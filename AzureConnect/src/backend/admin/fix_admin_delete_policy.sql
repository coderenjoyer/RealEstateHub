-- Fix admin UPDATE policy to check admin email instead of role
-- This policy allows admins (by email) to update ANY property including setting is_deleted to true

DROP POLICY IF EXISTS "Admins can update any property" ON listed_properties;

CREATE POLICY "Admins can update any property"
ON listed_properties FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@example.com')
WITH CHECK (auth.jwt() ->> 'email' = 'admin@example.com');

-- Also update the SELECT policy for admins
DROP POLICY IF EXISTS "Admins can view all properties" ON listed_properties;

CREATE POLICY "Admins can view all properties"
ON listed_properties FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@example.com');

-- Also update the INSERT policy for admins
DROP POLICY IF EXISTS "Admins can insert approved listings" ON listed_properties;

CREATE POLICY "Admins can insert approved listings"
ON listed_properties FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'email' = 'admin@example.com');

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'listed_properties' AND policyname LIKE 'Admins%';
