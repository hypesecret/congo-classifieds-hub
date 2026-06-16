
-- 1. Referral code on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE c text;
BEGIN
  LOOP
    c := upper(substring(md5(random()::text || clock_timestamp()::text), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = c);
  END LOOP;
  RETURN c;
END;$$;

UPDATE public.profiles SET referral_code = public.generate_referral_code() WHERE referral_code IS NULL;

CREATE OR REPLACE FUNCTION public.set_referral_code_on_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := public.generate_referral_code();
  END IF;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS trg_set_referral_code ON public.profiles;
CREATE TRIGGER trg_set_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_referral_code_on_profile();

-- 2. Referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | qualified | rewarded
  reward_amount integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  qualified_at timestamptz,
  UNIQUE (referred_id)
);

GRANT SELECT, INSERT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own referrals" ON public.referrals;
CREATE POLICY "Users view own referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

DROP POLICY IF EXISTS "Users can create their own referral" ON public.referrals;
CREATE POLICY "Users can create their own referral" ON public.referrals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = referred_id);

-- 3. Rate limiting
CREATE OR REPLACE FUNCTION public.check_rate_limit(_user_id uuid, _kind text, _limit int, _window interval)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE n int;
BEGIN
  IF _kind = 'listing' THEN
    SELECT count(*) INTO n FROM public.listings
      WHERE user_id = _user_id AND created_at > now() - _window;
  ELSIF _kind = 'message' THEN
    SELECT count(*) INTO n FROM public.messages
      WHERE sender_id = _user_id AND created_at > now() - _window;
  ELSE
    RETURN true;
  END IF;
  RETURN n < _limit;
END;$$;

CREATE OR REPLACE FUNCTION public.enforce_listing_rate_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.check_rate_limit(NEW.user_id, 'listing', 5, interval '1 hour') THEN
    RAISE EXCEPTION 'Limite atteinte : maximum 5 annonces par heure. Réessayez plus tard.';
  END IF;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS trg_listings_rate_limit ON public.listings;
CREATE TRIGGER trg_listings_rate_limit
  BEFORE INSERT ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_listing_rate_limit();

CREATE OR REPLACE FUNCTION public.enforce_message_rate_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.check_rate_limit(NEW.sender_id, 'message', 30, interval '1 hour') THEN
    RAISE EXCEPTION 'Limite atteinte : maximum 30 messages par heure. Réessayez plus tard.';
  END IF;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS trg_messages_rate_limit ON public.messages;
CREATE TRIGGER trg_messages_rate_limit
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.enforce_message_rate_limit();
