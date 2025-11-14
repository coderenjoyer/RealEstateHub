-- Fix Agent Role JWT Issue
-- This script ensures the role is properly set in user metadata AND reflected in JWT claims

-- First, verify your current user's role
-- Replace 'your-email@example.com' with your actual agent email
SELECT 
    id,
    email,
    raw_user_meta_data,
    raw_user_meta_data->>'role' as current_role
FROM auth.users
WHERE email = 'your-email@example.com';

-- If the role is missing or incorrect, update it:
-- Replace 'your-email@example.com' with your actual agent email
UPDATE auth.users
SET raw_user_meta_data = 
    CASE 
        WHEN raw_user_meta_data IS NULL THEN '{"role": "agent"}'::jsonb
        ELSE raw_user_meta_data || '{"role": "agent"}'::jsonb
    END
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT 
    id,
    email,
    raw_user_meta_data,
    raw_user_meta_data->>'role' as updated_role
FROM auth.users
WHERE email = 'your-email@example.com';

-- After running this, you MUST sign out and sign back in for the JWT to refresh!
