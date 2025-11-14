-- Alternative RLS Policy Fix for listing_approvals
-- This uses user_metadata instead of jwt() which can be more reliable

-- Drop existing policies
DROP POLICY IF EXISTS "Agents can create listing submissions" ON listing_approvals;
DROP POLICY IF EXISTS "Agents can view own submissions" ON listing_approvals;
DROP POLICY IF EXISTS "Admins can view all submissions" ON listing_approvals;
DROP POLICY IF EXISTS "Admins can update submissions" ON listing_approvals;
DROP POLICY IF EXISTS "Admins can delete rejected submissions" ON listing_approvals;

-- Recreate with better JWT parsing
-- Agents can insert their own submissions
CREATE POLICY "Agents can create listing submissions"
ON listing_approvals FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id AND 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'agent'
);

-- Agents can view their own submissions
CREATE POLICY "Agents can view own submissions"
ON listing_approvals FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
ON listing_approvals FOR SELECT
TO authenticated
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Admins can update submissions (approve/reject)
CREATE POLICY "Admins can update submissions"
ON listing_approvals FOR UPDATE
TO authenticated
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Admins can delete rejected submissions
CREATE POLICY "Admins can delete rejected submissions"
ON listing_approvals FOR DELETE
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' AND 
    approval_status = 'rejected'
);
