-- Create admin_settings table for feature management
CREATE TABLE IF NOT EXISTS admin_settings (
    id BIGSERIAL PRIMARY KEY,
    user_registration_enabled BOOLEAN DEFAULT TRUE,
    property_listings_enabled BOOLEAN DEFAULT TRUE,
    messaging_enabled BOOLEAN DEFAULT TRUE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION set_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER trg_admin_settings_updated_at
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION set_admin_settings_updated_at();

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "Admins can view admin settings"
ON admin_settings FOR SELECT
TO authenticated
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Only admins can update settings
CREATE POLICY "Admins can update admin settings"
ON admin_settings FOR UPDATE
TO authenticated
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Insert default settings if not exists
INSERT INTO admin_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Verify setup
SELECT * FROM admin_settings;
