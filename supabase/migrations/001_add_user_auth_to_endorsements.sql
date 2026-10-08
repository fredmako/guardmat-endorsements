-- Add user_id and auth_provider columns to endorsements table
ALTER TABLE endorsements ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE endorsements ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'google';

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_endorsements_user_id ON endorsements(user_id);

-- Update RLS policies to allow users to read their own endorsements
DROP POLICY IF EXISTS "Users can read own endorsements" ON endorsements;
CREATE POLICY "Users can read own endorsements" ON endorsements
  FOR SELECT USING (user_id = auth.uid()::text OR verified = true);

-- Allow service role to insert with user_id
DROP POLICY IF EXISTS "Service role can insert endorsements with user_id" ON endorsements;
CREATE POLICY "Service role can insert endorsements with user_id" ON endorsements
  FOR INSERT WITH CHECK (true);