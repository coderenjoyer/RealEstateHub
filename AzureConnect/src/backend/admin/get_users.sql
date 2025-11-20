-- Database function to get all users from Supabase auth.users table
-- This function queries directly from authentication, no profiles table needed
-- Run this SQL in your Supabase SQL Editor

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_all_users(TEXT);

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
  created_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::TEXT,
    (au.raw_user_meta_data->>'first_name')::TEXT as first_name,
    (au.raw_user_meta_data->>'last_name')::TEXT as last_name,
    (au.raw_user_meta_data->>'mobile_number')::TEXT as mobile_number,
    (au.raw_user_meta_data->>'mobile_number')::TEXT as phone,
    (au.raw_user_meta_data->>'role')::TEXT as role,
    COALESCE(COUNT(lp.id), 0)::BIGINT as properties_count,
    CASE 
      WHEN (au.raw_user_meta_data->>'status')::TEXT = 'Inactive' THEN 'Inactive'::TEXT
      ELSE 'Active'::TEXT
    END as status,
    au.created_at,
    au.email_confirmed_at
  FROM auth.users au
  LEFT JOIN listed_properties lp ON au.id = lp.user_id AND lp.is_deleted = FALSE
  WHERE 
    (user_role IS NULL OR (au.raw_user_meta_data->>'role')::TEXT = user_role)
    AND au.deleted_at IS NULL
  GROUP BY au.id, au.email, au.raw_user_meta_data, au.created_at, au.email_confirmed_at
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_users(TEXT) TO authenticated;

-- Note: This function queries directly from auth.users table
-- It extracts user metadata (first_name, last_name, mobile_number, role) from raw_user_meta_data
-- The properties_count is optional - returns 0 if properties table doesn't exist
-- Adjust column names in the properties query if your schema differs

