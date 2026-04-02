-- Create system_settings table to store platform configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage settings
CREATE POLICY "Admins can manage system settings"
    ON public.system_settings
    FOR ALL
    TO authenticated
    USING ( (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin' )
    WITH CHECK ( (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin' );

-- Allow everyone to read settings
CREATE POLICY "Everyone can read system settings"
    ON public.system_settings
    FOR SELECT
    TO authenticated, anon
    USING ( true );

-- Insert default settings
INSERT INTO public.system_settings (key, value, description)
VALUES 
    ('boost_prices', '{"visibilite": {"price": 2500, "days": 7}, "premium": {"price": 5000, "days": 14}, "pro": {"price": 15000, "days": 30}}', 'Tarifs des packages booster'),
    ('moderation_rules', '{"blacklist": ["arnaque", "faux billet", "broutage"], "min_photos": 1}', 'Règles de modération automatique'),
    ('maintenance_mode', '{"enabled": false, "message": "Le site est en cours de maintenance. Veuillez patienter."}', 'État de la maintenance');
