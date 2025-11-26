-- ============================================================================
-- ADD AGENT PROFILE FIELDS TO PROFILES TABLE
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN
    -- Add bio column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bio'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;
    
    -- Add specializations column (JSON array)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'specializations'
    ) THEN
        ALTER TABLE profiles ADD COLUMN specializations JSONB DEFAULT '[]';
    END IF;
    
    -- Add languages column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'languages'
    ) THEN
        ALTER TABLE profiles ADD COLUMN languages TEXT;
    END IF;
    
    -- Add certifications column (JSON array)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'certifications'
    ) THEN
        ALTER TABLE profiles ADD COLUMN certifications JSONB DEFAULT '[]';
    END IF;
END $$;

-- Step 2: Verify columns exist
SELECT 
    'Columns verified' as status,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN 'bio EXISTS' ELSE 'bio MISSING' END,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'specializations') THEN 'specializations EXISTS' ELSE 'specializations MISSING' END,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'languages') THEN 'languages EXISTS' ELSE 'languages MISSING' END,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'certifications') THEN 'certifications EXISTS' ELSE 'certifications MISSING' END;

-- Step 3: Confirmation message
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'AGENT PROFILE FIELDS ADDED';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Added columns: bio, specializations, languages, certifications';
    RAISE NOTICE 'Agents can now view their profile details in property listings';
    RAISE NOTICE '==============================================';
END $$;
