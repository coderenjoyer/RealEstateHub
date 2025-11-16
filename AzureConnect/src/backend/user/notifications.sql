-- Create notifications table for user notifications
-- Run this SQL in your Supabase SQL Editor

-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('property', 'message', 'favorite', 'appointment', 'system')),
    related_property_id BIGINT REFERENCES listed_properties(id) ON DELETE SET NULL,
    related_agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own notifications
CREATE POLICY "users_view_own_notifications" ON notifications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Users can only update their own notifications (mark as read)
CREATE POLICY "users_update_own_notifications" ON notifications
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own notifications
CREATE POLICY "users_delete_own_notifications" ON notifications
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Admin policy: Admins can insert notifications for users
CREATE POLICY "admins_insert_notifications" ON notifications
    FOR INSERT
    TO authenticated
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin' OR (auth.jwt() ->> 'role') = 'agent');

-- Grant permissions
GRANT ALL ON notifications TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE notifications_id_seq TO authenticated;

-- Trigger to auto-update updated_at
CREATE TRIGGER trg_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
