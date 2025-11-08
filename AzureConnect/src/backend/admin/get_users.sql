-- Database function to get all users from Supabase auth.users table
-- This function queries directly from authentication, no profiles table needed
-- Run this SQL in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_all_users(user_role TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  mobile_number TEXT,
  phone TEXT,
  role TEXT,
  properties_count BIGINT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  properties_table_exists BOOLEAN;
BEGIN
  -- Check if properties table exists (optional - won't break if it doesn't)
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'properties'
  ) INTO properties_table_exists;

  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    (au.raw_user_meta_data->>'first_name')::TEXT as first_name,
    (au.raw_user_meta_data->>'last_name')::TEXT as last_name,
    (au.raw_user_meta_data->>'mobile_number')::TEXT as mobile_number,
    (au.raw_user_meta_data->>'mobile_number')::TEXT as phone,
    (au.raw_user_meta_data->>'role')::TEXT as role,
    CASE 
      WHEN properties_table_exists THEN
        COALESCE(
          (SELECT COUNT(*) 
           FROM public.properties p 
           WHERE CASE 
             WHEN user_role = 'agent' THEN p.agent_id = au.id
             WHEN user_role = 'user' THEN p.user_id = au.id
             ELSE (p.agent_id = au.id OR p.user_id = au.id)
           END
          ), 0
        )
      ELSE 0
    END as properties_count,
    CASE 
      WHEN user_role = 'agent' THEN 'Pending'::TEXT
      ELSE NULL::TEXT
    END as status,
    au.created_at
  FROM auth.users au
  WHERE 
    (user_role IS NULL OR (au.raw_user_meta_data->>'role')::TEXT = user_role)
    AND au.deleted_at IS NULL
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_users(TEXT) TO authenticated;

-- Note: This function queries directly from auth.users table
-- It extracts user metadata (first_name, last_name, mobile_number, role) from raw_user_meta_data
-- The properties_count is optional - returns 0 if properties table doesn't exist
-- Adjust column names in the properties query if your schema differs

