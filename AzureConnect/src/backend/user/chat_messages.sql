-- Chat Messages Module for Real-Time Messaging
-- Run this in Supabase SQL Editor

-- 1. Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    participant_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure participants are ordered (participant_1 < participant_2)
    CONSTRAINT ordered_participants CHECK (participant_1_id < participant_2_id),
    -- Ensure unique conversation between two users
    CONSTRAINT unique_conversation UNIQUE (participant_1_id, participant_2_id)
);

-- 2. Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'call', 'image', 'file')),
    metadata JSONB, -- For storing additional data like file URLs, call duration, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = FALSE;

-- 4. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Create trigger to update conversation's last_message_at when a new message is sent
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- 6. Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for conversations
-- Users can view conversations they're part of
CREATE POLICY "Users can view own conversations"
    ON conversations FOR SELECT
    TO authenticated
    USING (
        auth.uid() = participant_1_id OR 
        auth.uid() = participant_2_id
    );

-- Users can create conversations
CREATE POLICY "Users can create conversations"
    ON conversations FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = participant_1_id OR 
        auth.uid() = participant_2_id
    );

-- Users can update conversations they're part of
CREATE POLICY "Users can update own conversations"
    ON conversations FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = participant_1_id OR 
        auth.uid() = participant_2_id
    );

-- 8. RLS Policies for messages
-- Users can view messages in their conversations
CREATE POLICY "Users can view own messages"
    ON messages FOR SELECT
    TO authenticated
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id
    );

-- Users can send messages
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

-- Users can update their own messages (e.g., mark as read)
CREATE POLICY "Users can update own messages"
    ON messages FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id
    );

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
    ON messages FOR DELETE
    TO authenticated
    USING (auth.uid() = sender_id);

-- 9. Create helper function to get or create conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(
    user1_id UUID,
    user2_id UUID
)
RETURNS BIGINT AS $$
DECLARE
    conversation_id BIGINT;
    lesser_id UUID;
    greater_id UUID;
BEGIN
    -- Order the user IDs
    lesser_id := LEAST(user1_id, user2_id);
    greater_id := GREATEST(user1_id, user2_id);
    
    -- Try to find existing conversation
    SELECT id INTO conversation_id
    FROM conversations
    WHERE participant_1_id = lesser_id AND participant_2_id = greater_id
    LIMIT 1;
    
    -- If not found, create new conversation
    IF conversation_id IS NULL THEN
        INSERT INTO conversations (participant_1_id, participant_2_id)
        VALUES (lesser_id, greater_id)
        RETURNING id INTO conversation_id;
    END IF;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_or_create_conversation(UUID, UUID) TO authenticated;

-- 10. Create view for conversation list with participant details
CREATE OR REPLACE VIEW conversation_list AS
SELECT 
    c.id,
    c.participant_1_id,
    c.participant_2_id,
    c.last_message_at,
    c.created_at,
    -- Get last message
    (SELECT message_text FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
    -- Get unread count for current user
    (SELECT COUNT(*) FROM messages 
     WHERE conversation_id = c.id 
     AND receiver_id = auth.uid() 
     AND is_read = FALSE) as unread_count
FROM conversations c
WHERE c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid();

-- Grant access to the view
GRANT SELECT ON conversation_list TO authenticated;
