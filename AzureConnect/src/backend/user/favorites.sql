-- Create favorites table for user bookmarked properties
-- Run this SQL in your Supabase SQL Editor

-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS favorites CASCADE;

CREATE TABLE IF NOT EXISTS favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL REFERENCES listed_properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure a user can only bookmark a property once
    UNIQUE(user_id, property_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);

-- Enable Row Level Security (RLS)
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own favorites
CREATE POLICY "users_view_own_favorites" ON favorites
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Users can only insert their own favorites
CREATE POLICY "users_insert_own_favorites" ON favorites
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own favorites
CREATE POLICY "users_delete_own_favorites" ON favorites
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON favorites TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE favorites_id_seq TO authenticated;
