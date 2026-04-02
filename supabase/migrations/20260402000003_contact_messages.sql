-- Create contact_messages table to store messages from the contact form
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit a contact message
CREATE POLICY "Anyone can submit a contact message"
    ON public.contact_messages
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- Allow admins to manage contact messages
CREATE POLICY "Admins can manage contact messages"
    ON public.contact_messages
    FOR ALL
    TO authenticated
    USING ( (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin' )
    WITH CHECK ( (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin' );
