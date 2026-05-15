
-- 1. Condition (neuf/occasion) + phone_visible + sold_at
DO $$ BEGIN
  CREATE TYPE listing_condition AS ENUM ('new', 'like_new', 'good', 'fair');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS condition listing_condition,
  ADD COLUMN IF NOT EXISTS phone_visible boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS sold_at timestamptz,
  ADD COLUMN IF NOT EXISTS slug text;

CREATE INDEX IF NOT EXISTS listings_status_created_idx ON public.listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS listings_category_idx ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS listings_city_idx ON public.listings(city);
CREATE INDEX IF NOT EXISTS listings_user_idx ON public.listings(user_id);

-- 2. blocked_users
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their own blocks" ON public.blocked_users;
CREATE POLICY "Users manage their own blocks" ON public.blocked_users
  FOR ALL TO authenticated USING (auth.uid() = blocker_id) WITH CHECK (auth.uid() = blocker_id);

-- 3. saved_searches
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  notify boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their saved searches" ON public.saved_searches;
CREATE POLICY "Users manage their saved searches" ON public.saved_searches
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. RPC increment views (atomic)
CREATE OR REPLACE FUNCTION public.increment_listing_views(_listing_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.listings SET views_count = COALESCE(views_count,0) + 1 WHERE id = _listing_id AND status = 'active';
$$;

-- 5. RPC increment contact_count
CREATE OR REPLACE FUNCTION public.increment_listing_contacts(_listing_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.listings SET contact_count = COALESCE(contact_count,0) + 1 WHERE id = _listing_id;
$$;

-- 6. Trigger : masquer numéros de téléphone dans description
CREATE OR REPLACE FUNCTION public.mask_phone_in_description()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.description IS NOT NULL THEN
    -- Masque les séquences de 8+ chiffres (avec espaces, +, -, .)
    NEW.description := regexp_replace(
      NEW.description,
      '(\+?\d[\d\s\.\-]{7,}\d)',
      '[Numéro masqué — utilisez la messagerie]',
      'g'
    );
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_mask_phone ON public.listings;
CREATE TRIGGER trg_mask_phone BEFORE INSERT OR UPDATE OF description ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.mask_phone_in_description();

-- 7. Trigger : auto-modération après 3 signalements
CREATE OR REPLACE FUNCTION public.auto_moderate_on_reports()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  report_count int;
BEGIN
  SELECT count(*) INTO report_count FROM public.reports
    WHERE listing_id = NEW.listing_id AND status = 'pending';
  IF report_count >= 3 THEN
    UPDATE public.listings SET status = 'pending_moderation'
      WHERE id = NEW.listing_id AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_auto_moderate ON public.reports;
CREATE TRIGGER trg_auto_moderate AFTER INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.auto_moderate_on_reports();

-- 8. Trigger : notif au vendeur quand status change
CREATE OR REPLACE FUNCTION public.notify_listing_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'active' THEN
      INSERT INTO public.notifications (user_id, listing_id, type, title, message)
      VALUES (NEW.user_id, NEW.id, 'listing_approved', 'Annonce approuvée', 'Votre annonce "' || NEW.title || '" est maintenant en ligne.');
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, listing_id, type, title, message)
      VALUES (NEW.user_id, NEW.id, 'listing_rejected', 'Annonce refusée', COALESCE(NEW.rejection_reason, 'Votre annonce ne respecte pas les règles.'));
    ELSIF NEW.status = 'expired' THEN
      INSERT INTO public.notifications (user_id, listing_id, type, title, message)
      VALUES (NEW.user_id, NEW.id, 'listing_expired', 'Annonce expirée', 'Renouvelez "' || NEW.title || '" en un clic.');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_listing_status ON public.listings;
CREATE TRIGGER trg_listing_status AFTER UPDATE OF status ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.notify_listing_status_change();

-- 9. RPC pour expirer les annonces (appelable par cron ou admin)
CREATE OR REPLACE FUNCTION public.expire_old_listings()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  affected int;
BEGIN
  UPDATE public.listings
    SET status = 'expired'
    WHERE status = 'active' AND expires_at < now();
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- 10. RPC pour renouveler une annonce (60 jours de plus)
CREATE OR REPLACE FUNCTION public.renew_listing(_listing_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.listings
    SET status = 'active', expires_at = now() + interval '60 days', updated_at = now()
    WHERE id = _listing_id AND user_id = auth.uid() AND status IN ('expired','sold');
END;
$$;

-- 11. RPC pour supprimer son propre compte (RGPD)
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE uid uuid;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN RAISE EXCEPTION 'Non authentifié'; END IF;
  DELETE FROM public.listings WHERE user_id = uid;
  DELETE FROM public.favorites WHERE user_id = uid;
  DELETE FROM public.messages WHERE sender_id = uid OR receiver_id = uid;
  DELETE FROM public.notifications WHERE user_id = uid;
  DELETE FROM public.profiles WHERE user_id = uid;
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

-- 12. Réponses aux avis
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS seller_response text, ADD COLUMN IF NOT EXISTS responded_at timestamptz;
DROP POLICY IF EXISTS "Sellers can respond to own reviews" ON public.reviews;
CREATE POLICY "Sellers can respond to own reviews" ON public.reviews
  FOR UPDATE TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

-- 13. AdminSettings persistées : seed les clés par défaut
INSERT INTO public.platform_settings (key, value, description)
VALUES
  ('listing_expiration_days', '60'::jsonb, 'Durée de vie d''une annonce (jours)'),
  ('max_listings_unverified', '3'::jsonb, 'Quota annonces utilisateur non vérifié'),
  ('max_listings_verified', '20'::jsonb, 'Quota annonces utilisateur vérifié'),
  ('max_images_per_listing', '8'::jsonb, 'Nombre max de photos par annonce'),
  ('boost_price_7d', '2000'::jsonb, 'Prix boost 7 jours (FCFA)'),
  ('boost_price_30d', '5000'::jsonb, 'Prix boost 30 jours (FCFA)')
ON CONFLICT (key) DO NOTHING;
