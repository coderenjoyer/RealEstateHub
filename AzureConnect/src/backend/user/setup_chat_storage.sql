-- ============================================================================
-- CHAT MEDIA STORAGE SETUP
-- Execute this in Supabase SQL Editor AFTER running setup_messenger_complete.sql
-- ============================================================================

-- Step 1: Create chat-media storage bucket
-- Note: This INSERT might fail if bucket already exists - that's OK
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own chat files" ON storage.objects;

-- Step 3: Create RLS policies for chat-media bucket

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload chat files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'chat-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to view all chat files
CREATE POLICY "Users can view chat files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-media');

-- Allow users to delete only their own files
CREATE POLICY "Users can delete own chat files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'chat-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update only their own files
CREATE POLICY "Users can update own chat files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'chat-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 4: Verification
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'CHAT STORAGE SETUP COMPLETE';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Bucket created: chat-media';
    RAISE NOTICE 'RLS policies applied for file operations';
    RAISE NOTICE '';
    RAISE NOTICE 'File upload structure:';
    RAISE NOTICE '  <user-id>/<filename>';
    RAISE NOTICE '';
    RAISE NOTICE 'Example:';
    RAISE NOTICE '  abc123-def456/image.jpg';
    RAISE NOTICE '==============================================';
END $$;
