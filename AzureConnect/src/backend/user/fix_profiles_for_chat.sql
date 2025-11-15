-- ============================================================================
-- FIX PROFILES TABLE FOR CHAT FUNCTIONALITY
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN
    -- Add email column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
    
    -- Add first_name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'first_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN first_name TEXT;
    END IF;
    
    -- Add last_name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'last_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_name TEXT;
    END IF;
END $$;

-- Step 2: Create a function to auto-populate profiles from auth.users
CREATE OR REPLACE FUNCTION sync_profile_from_auth()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
        last_name = COALESCE(EXCLUDED.last_name, profiles.last_name);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create trigger to auto-sync profiles when users sign up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_profile_from_auth();

-- Step 4: Backfill existing users into profiles table from auth.users metadata
-- Use user_id instead of id if that's the column name
INSERT INTO public.profiles (user_id, email, first_name, last_name, created_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', '') as first_name,
    COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name,
    au.created_at
FROM auth.users au
WHERE au.deleted_at IS NULL
ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
    last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name);

-- Step 5: Verification
SELECT 
    'Profiles synced' as status,
    COUNT(*) as profile_count
FROM profiles;

SELECT 
    'Sample profiles' as info,
    id,
    email,
    first_name,
    last_name
FROM profiles
LIMIT 5;

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'PROFILES TABLE FIXED FOR CHAT';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'All existing users have been synced to profiles table';
    RAISE NOTICE 'New users will auto-create profiles on signup';
    RAISE NOTICE '==============================================';
END $$;
