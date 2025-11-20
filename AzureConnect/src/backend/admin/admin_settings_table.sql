-- Create admin_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_settings (
  id BIGINT PRIMARY KEY DEFAULT 1,
  user_registration_enabled BOOLEAN DEFAULT true,
  property_listings_enabled BOOLEAN DEFAULT true,
  messaging_enabled BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT only_one_row CHECK (id = 1)
);

-- Insert default record if it doesn't exist
INSERT INTO admin_settings (id, user_registration_enabled, property_listings_enabled, messaging_enabled, notifications_enabled, maintenance_mode)
VALUES (1, true, true, true, true, false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins to select settings
CREATE POLICY "Admins can view settings"
ON admin_settings FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@example.com');

-- Policy to allow admins to update settings
CREATE POLICY "Admins can update settings"
ON admin_settings FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@example.com')
WITH CHECK (auth.jwt() ->> 'email' = 'admin@example.com');

-- Public read access for registration status (no auth required)
DROP POLICY IF EXISTS "Public can view registration status" ON admin_settings;
CREATE POLICY "Public can view registration status"
ON admin_settings FOR SELECT
TO anon
USING (true);
