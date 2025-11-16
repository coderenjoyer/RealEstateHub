-- Fix RLS policies for profiles table
-- Run this in Supabase SQL Editor if users cannot update their own profiles

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Add UPDATE policy - allows users to update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add INSERT policy - allows users to insert their own profile
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Verify policies are applied
SELECT * FROM pg_policies WHERE tablename = 'profiles';
