-- Create admin_messages table
CREATE TABLE IF NOT EXISTS admin_messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_admin_messages_sender ON admin_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_recipient ON admin_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_conversation ON admin_messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages(created_at);

-- Enable RLS
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own admin messages" ON admin_messages;
DROP POLICY IF EXISTS "Users can insert messages" ON admin_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON admin_messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON admin_messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON admin_messages;

-- RLS Policy: Anyone authenticated can insert messages
CREATE POLICY "Anyone can insert messages"
ON admin_messages FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS Policy: Users can view messages where they are sender or recipient
CREATE POLICY "Users can view their own messages"
ON admin_messages FOR SELECT
TO authenticated
USING (
  auth.uid() = sender_id 
  OR auth.uid() = recipient_id
);

-- Set up realtime replication for admin_messages table
DO $$
BEGIN
  -- Add table to supabase_realtime publication if not already present
  ALTER PUBLICATION supabase_realtime ADD TABLE admin_messages;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Set replica identity to FULL to include all columns in replication
ALTER TABLE admin_messages REPLICA IDENTITY FULL;
