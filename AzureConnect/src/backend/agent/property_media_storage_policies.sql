-- Storage Policies for property-media bucket
-- Run this in Supabase SQL Editor

-- STEP 1: Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-media', 'property-media', true)
ON CONFLICT (id) DO NOTHING;

-- STEP 2: Drop existing policies (if any)
DROP POLICY IF EXISTS "Allow authenticated users to upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view property images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own property images" ON storage.objects;

-- STEP 3: Create INSERT policy (Upload)
-- Only authenticated users can upload to their own folder
CREATE POLICY "Allow authenticated users to upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-media' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- STEP 4: Create SELECT policy (View/Download)
-- Anyone can view property images (public access)
CREATE POLICY "Allow public to view property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-media');

-- STEP 5: Create UPDATE policy
-- Users can update their own property images
CREATE POLICY "Allow users to update their own property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-media' AND 
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'property-media' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- STEP 6: Create DELETE policy
-- Users can delete their own property images
CREATE POLICY "Allow users to delete their own property images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-media' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- STEP 7: Verify policies were created
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%property images%'
ORDER BY policyname;
