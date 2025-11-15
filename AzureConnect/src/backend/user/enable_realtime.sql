-- ============================================================================
-- ENABLE REALTIME REPLICATION FOR MESSENGER
-- Execute this in Supabase SQL Editor if UI is not accessible
-- ============================================================================

-- Step 1: Ensure supabase_realtime publication exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime;
        RAISE NOTICE 'Created supabase_realtime publication';
    ELSE
        RAISE NOTICE 'supabase_realtime publication already exists';
    END IF;
END $$;

-- Step 2: Add tables to realtime publication (skip if already added)
DO $$
BEGIN
    -- Try to add conversations table
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
        RAISE NOTICE 'Added conversations to realtime';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'conversations already in realtime publication (skipped)';
    END;
    
    -- Try to add messages table
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
        RAISE NOTICE 'Added messages to realtime';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'messages already in realtime publication (skipped)';
    END;
END $$;

-- Step 4: Grant necessary permissions for realtime
GRANT SELECT ON conversations TO postgres, anon, authenticated, service_role;
GRANT SELECT ON messages TO postgres, anon, authenticated, service_role;

-- Step 5: Enable replica identity (required for DELETE operations)
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Step 6: Verification
DO $$
DECLARE
    conv_enabled BOOLEAN;
    msg_enabled BOOLEAN;
BEGIN
    -- Check if conversations is enabled
    SELECT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'conversations'
    ) INTO conv_enabled;
    
    -- Check if messages is enabled
    SELECT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'messages'
    ) INTO msg_enabled;
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'REALTIME REPLICATION STATUS';
    RAISE NOTICE '==============================================';
    
    IF conv_enabled THEN
        RAISE NOTICE '✓ conversations - ENABLED';
    ELSE
        RAISE NOTICE '✗ conversations - FAILED';
    END IF;
    
    IF msg_enabled THEN
        RAISE NOTICE '✓ messages - ENABLED';
    ELSE
        RAISE NOTICE '✗ messages - FAILED';
    END IF;
    
    RAISE NOTICE '==============================================';
    
    IF conv_enabled AND msg_enabled THEN
        RAISE NOTICE 'SUCCESS: Realtime is now enabled for messenger!';
    ELSE
        RAISE NOTICE 'ERROR: Some tables failed to enable realtime';
    END IF;
    
    RAISE NOTICE '==============================================';
END $$;

-- Step 7: Show all tables with realtime enabled
SELECT 
    schemaname,
    tablename,
    'Realtime Enabled ✓' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
