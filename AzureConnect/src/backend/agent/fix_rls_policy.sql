-- Fix RLS Policy for Properties Table
-- This ensures only users with 'agent' role can insert properties

-- STEP 1: Drop existing policies
DROP POLICY IF EXISTS "insert_properties_agent_only" ON properties;

-- STEP 2: Create the correct INSERT policy
-- This checks if the authenticated user's role in their JWT metadata is 'agent'
CREATE POLICY "insert_properties_agent_only" ON properties
FOR INSERT 
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'agent'
);

-- STEP 3: Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'properties' AND policyname = 'insert_properties_agent_only';
