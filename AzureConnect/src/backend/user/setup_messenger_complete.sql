-- ============================================================================
-- COMPLETE MESSENGER SETUP
-- Execute this in Supabase SQL Editor to set up the full messaging system
-- ============================================================================

-- Step 1: Verify and create tables (from chat_messages.sql)
-- This ensures idempotency - safe to run multiple times

-- 1.1 Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    participant_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT ordered_participants CHECK (participant_1_id < participant_2_id),
    CONSTRAINT unique_conversation UNIQUE (participant_1_id, participant_2_id)
);

-- 1.2 Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'call', 'image', 'file')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = FALSE;

-- Step 2: Create triggers

-- 2.1 Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.2 Apply triggers to tables
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2.3 Update conversation timestamp on new message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_timestamp ON messages;
CREATE TRIGGER update_conversation_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Step 3: Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;

-- Step 5: Create RLS Policies

-- 5.1 Conversations policies
CREATE POLICY "Users can view own conversations"
    ON conversations FOR SELECT
    TO authenticated
    USING (
        auth.uid() = participant_1_id OR 
        auth.uid() = participant_2_id
    );

CREATE POLICY "Users can create conversations"
    ON conversations FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = participant_1_id OR 
        auth.uid() = participant_2_id
    );

CREATE POLICY "Users can update own conversations"
    ON conversations FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = participant_1_id OR 
        auth.uid() = participant_2_id
    );

-- 5.2 Messages policies
CREATE POLICY "Users can view own messages"
    ON messages FOR SELECT
    TO authenticated
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id
    );

CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages"
    ON messages FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id
    );

CREATE POLICY "Users can delete own messages"
    ON messages FOR DELETE
    TO authenticated
    USING (auth.uid() = sender_id);

-- Step 6: Create helper function
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

GRANT EXECUTE ON FUNCTION get_or_create_conversation(UUID, UUID) TO authenticated;

-- Step 7: Create profiles table for user avatars (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    avatar_url TEXT,
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Step 8: Create trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Verification queries
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'MESSENGER SETUP COMPLETE';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Tables created: conversations, messages, profiles';
    RAISE NOTICE 'Function created: get_or_create_conversation';
    RAISE NOTICE 'RLS enabled and policies applied';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Enable Realtime in Supabase Dashboard:';
    RAISE NOTICE '   - Go to Database > Replication';
    RAISE NOTICE '   - Enable for: conversations, messages';
    RAISE NOTICE '';
    RAISE NOTICE '2. Create chat-media storage bucket:';
    RAISE NOTICE '   - Run setup_chat_storage.sql';
    RAISE NOTICE '==============================================';
END $$;
