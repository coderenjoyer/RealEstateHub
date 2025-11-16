-- Verify all columns exist in profiles table
-- Run this in Supabase SQL Editor

-- Check all columns in profiles table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if the columns we need exist
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'profile_image_url'
    ) THEN 'profile_image_url EXISTS' ELSE 'profile_image_url MISSING' END as col1,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'cover_image_url'
    ) THEN 'cover_image_url EXISTS' ELSE 'cover_image_url MISSING' END as col2,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bio'
    ) THEN 'bio EXISTS' ELSE 'bio MISSING' END as col3,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'property_type'
    ) THEN 'property_type EXISTS' ELSE 'property_type MISSING' END as col4,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'preferred_location'
    ) THEN 'preferred_location EXISTS' ELSE 'preferred_location MISSING' END as col5,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'budget_range'
    ) THEN 'budget_range EXISTS' ELSE 'budget_range MISSING' END as col6,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'investment_goal'
    ) THEN 'investment_goal EXISTS' ELSE 'investment_goal MISSING' END as col7;

-- Check primary key
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'profiles' AND constraint_type = 'PRIMARY KEY';
