
-- Drop the broken FK first
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_user_id_fkey;

-- Update all listings to use profiles.user_id instead of profiles.id
UPDATE listings l
SET user_id = p.user_id
FROM profiles p
WHERE l.user_id = p.id AND l.user_id != p.user_id;

-- Recreate FK to profiles(user_id)
ALTER TABLE listings ADD CONSTRAINT listings_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
