-- Platform Settings table
CREATE TABLE public.platform_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value jsonb NOT NULL,
    description text,
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage platform settings
CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can read platform settings (for frontend to consume)
CREATE POLICY "Anyone can view platform settings" ON public.platform_settings
    FOR SELECT USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON public.platform_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default platform settings
INSERT INTO public.platform_settings (key, value, description) VALUES
    ('boost_pricing', '{"visibility": {"price": 2500, "duration_days": 7}, "premium": {"price": 5000, "duration_days": 14}, "pro": {"price": 15000, "duration_days": 30}}'::jsonb, 'Tarifs et durées des packs de boost'),
    ('auto_moderation', '{"keyword_blacklist": ["arnaque", "faux", "escroquerie"], "min_price_thresholds": {"immobilier": 10000, "vehicules": 50000}, "min_photos_required": 1}'::jsonb, 'Règles de modération automatique'),
    ('homepage_content', '{"featured_listings": [], "visible_categories": ["immobilier", "vehicules", "emploi", "services", "electronique", "mode-beaute", "maison-jardin", "loisirs"]}'::jsonb, 'Configuration de la page d''accueil'),
    ('system', '{"maintenance_mode": false, "maintenance_message": "Le site est en cours de maintenance. Veuillez patienter.", "sms_provider": "twilio", "max_listings_per_user_per_day": 10}'::jsonb, 'Paramètres système généraux');

-- Moderation Logs table
CREATE TABLE public.moderation_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    moderator_id uuid REFERENCES auth.users(id) NOT NULL,
    action text NOT NULL, -- e.g., 'approve_listing', 'reject_listing', 'ban_user', 'approve_kyc'
    entity_type text NOT NULL, -- e.g., 'listing', 'user', 'kyc', 'report'
    entity_id uuid NOT NULL,
    reason text,
    details jsonb,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Only admins/moderators can view or insert moderation logs
CREATE POLICY "Admins and moderators can view moderation logs" ON public.moderation_logs
    FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins and moderators can insert moderation logs" ON public.moderation_logs
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
