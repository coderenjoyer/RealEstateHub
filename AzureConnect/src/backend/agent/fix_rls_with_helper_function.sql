-- Create a helper function to check user role (with SECURITY DEFINER to access auth.users)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT raw_user_meta_data->>'role'
    FROM auth.users
    WHERE id = user_id
  );
END;
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Agents can create listing submissions" ON listing_approvals;
DROP POLICY IF EXISTS "Agents can view own submissions" ON listing_approvals;
DROP POLICY IF EXISTS "Admins can view all submissions" ON listing_approvals;
DROP POLICY IF EXISTS "Admins can update submissions" ON listing_approvals;
DROP POLICY IF EXISTS "Admins can delete rejected submissions" ON listing_approvals;

-- Recreate policies using the helper function
-- Agents can insert their own submissions
CREATE POLICY "Agents can create listing submissions"
ON listing_approvals FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id AND 
    get_user_role(auth.uid()) = 'agent'
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
USING (get_user_role(auth.uid()) = 'admin');

-- Admins can update submissions (approve/reject)
CREATE POLICY "Admins can update submissions"
ON listing_approvals FOR UPDATE
TO authenticated
USING (get_user_role(auth.uid()) = 'admin')
WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Admins can delete rejected submissions
CREATE POLICY "Admins can delete rejected submissions"
ON listing_approvals FOR DELETE
TO authenticated
USING (
    get_user_role(auth.uid()) = 'admin' AND 
    approval_status = 'rejected'
);
