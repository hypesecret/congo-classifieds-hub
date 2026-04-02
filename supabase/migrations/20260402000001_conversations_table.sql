
-- Phase 0.1: Create conversations table for better chat management
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
    participant_ids uuid[] NOT NULL, -- Array of user IDs [sender, receiver]
    last_message text,
    last_message_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(listing_id, participant_ids)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Conversations RLS
CREATE POLICY "Users can view their own conversations" ON public.conversations 
    FOR SELECT USING (auth.uid() = ANY(participant_ids));

-- Update messages table to link to conversations
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='conversation_id') THEN
        ALTER TABLE public.messages ADD COLUMN conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE;
    ELSE
        -- Ensure the FK exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='messages_conversation_id_fkey') THEN
            ALTER TABLE public.messages ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Trigger to auto-manage conversations
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
DECLARE
    conv_id uuid;
BEGIN
    -- Check if conversation exists for this listing and pair of users
    -- We sort participant_ids to ensure uniqueness regardless of who started the chat
    SELECT id INTO conv_id 
    FROM public.conversations 
    WHERE listing_id = NEW.listing_id 
    AND participant_ids @> ARRAY[NEW.sender_id, NEW.receiver_id];

    IF conv_id IS NULL THEN
        INSERT INTO public.conversations (listing_id, participant_ids, last_message, last_message_at)
        VALUES (NEW.listing_id, ARRAY[NEW.sender_id, NEW.receiver_id], NEW.content, NEW.created_at)
        RETURNING id INTO conv_id;
    ELSE
        UPDATE public.conversations 
        SET last_message = NEW.content, last_message_at = NEW.created_at, updated_at = now()
        WHERE id = conv_id;
    END IF;

    -- Update the message with the conversation_id
    NEW.conversation_id := conv_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_inserted
    BEFORE INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();
