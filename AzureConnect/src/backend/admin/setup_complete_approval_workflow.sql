
//second approval workflow setup



-- ============================================
-- COMPLETE APPROVAL WORKFLOW SETUP
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Step 1: Create helper function for role checking (fixes RLS permission errors)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT raw_user_meta_data->>'role'
    FROM auth.users
    WHERE id = user_id
  );
END;
$$;

-- Step 2: Create set_updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create listed_properties table (if not exists)
CREATE TABLE IF NOT EXISTS listed_properties (
    id BIGSERIAL PRIMARY KEY,
    approval_id BIGINT, -- Will add FK constraint after listing_approvals exists
    user_id UUID NOT NULL,
    property_title VARCHAR(255) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    listing_type TEXT CHECK (listing_type IN ('sale', 'rent')) NOT NULL,
    property_status TEXT CHECK (property_status IN ('available', 'sold', 'rented')) DEFAULT 'available',
    price NUMERIC(15,2) NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    square_feet INT,
    lot_size NUMERIC(10,2),
    year_built INT,
    parking_spaces INT,
    available_from DATE,
    furnished VARCHAR(50),
    pet_policy VARCHAR(100),
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    zip_postal VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'Philippines',
    description TEXT NOT NULL,
    about_property TEXT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    features JSONB,
    utilities JSONB,
    nearby_places JSONB,
    media JSONB,
    is_public BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create listing_approvals table (if not exists)
CREATE TABLE IF NOT EXISTS listing_approvals (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    property_title VARCHAR(255) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    listing_type TEXT CHECK (listing_type IN ('sale', 'rent')) NOT NULL,
    price NUMERIC(15,2) NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    square_feet INT,
    lot_size NUMERIC(10,2),
    year_built INT,
    parking_spaces INT,
    available_from DATE,
    furnished VARCHAR(50),
    pet_policy VARCHAR(100),
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    zip_postal VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'Philippines',
    description TEXT NOT NULL,
    about_property TEXT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    features JSONB,
    utilities JSONB,
    nearby_places JSONB,
    media JSONB,
    approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Add foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'listed_properties_approval_id_fkey'
    ) THEN
        ALTER TABLE listed_properties
        ADD CONSTRAINT listed_properties_approval_id_fkey
        FOREIGN KEY (approval_id) REFERENCES listing_approvals(id);
    END IF;
END $$;

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_listing_approvals_user_id ON listing_approvals (user_id);
CREATE INDEX IF NOT EXISTS idx_listing_approvals_approval_status ON listing_approvals (approval_status);
CREATE INDEX IF NOT EXISTS idx_listing_approvals_submitted_at ON listing_approvals (submitted_at);

CREATE INDEX IF NOT EXISTS idx_listed_properties_user_id ON listed_properties (user_id);
CREATE INDEX IF NOT EXISTS idx_listed_properties_property_type ON listed_properties (property_type);
CREATE INDEX IF NOT EXISTS idx_listed_properties_listing_type ON listed_properties (listing_type);
CREATE INDEX IF NOT EXISTS idx_listed_properties_property_status ON listed_properties (property_status);
CREATE INDEX IF NOT EXISTS idx_listed_properties_city ON listed_properties (city);
CREATE INDEX IF NOT EXISTS idx_listed_properties_price ON listed_properties (price);
CREATE INDEX IF NOT EXISTS idx_listed_properties_bedrooms ON listed_properties (bedrooms);
CREATE INDEX IF NOT EXISTS idx_listed_properties_is_public ON listed_properties (is_public);
CREATE INDEX IF NOT EXISTS idx_listed_properties_is_deleted ON listed_properties (is_deleted);

-- Step 7: Create triggers
DROP TRIGGER IF EXISTS trg_listing_approvals_updated_at ON listing_approvals;
CREATE TRIGGER trg_listing_approvals_updated_at
BEFORE UPDATE ON listing_approvals
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_listed_properties_updated_at ON listed_properties;
CREATE TRIGGER trg_listed_properties_updated_at
BEFORE UPDATE ON listed_properties
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Step 8: Enable RLS
ALTER TABLE listing_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE listed_properties ENABLE ROW LEVEL SECURITY;

-- Step 9: Drop existing policies
DROP POLICY IF EXISTS "Agents can create listing submissions" ON listing_approvals;
DROP POLICY IF EXISTS "Agents can view own submissions" ON listing_approvals;
DROP POLICY IF EXISTS "Admins can view all submissions" ON listing_approvals;
DROP POLICY IF EXISTS "Admins can update submissions" ON listing_approvals;
DROP POLICY IF EXISTS "Admins can delete rejected submissions" ON listing_approvals;

DROP POLICY IF EXISTS "Public can view available properties" ON listed_properties;
DROP POLICY IF EXISTS "Agents can view own properties" ON listed_properties;
DROP POLICY IF EXISTS "Admins can view all properties" ON listed_properties;
DROP POLICY IF EXISTS "Admins can insert approved listings" ON listed_properties;
DROP POLICY IF EXISTS "Agents can update own properties" ON listed_properties;
DROP POLICY IF EXISTS "Admins can update any property" ON listed_properties;
DROP POLICY IF EXISTS "Agents can delete own properties" ON listed_properties;

-- Step 10: Create RLS policies for listing_approvals using helper function
CREATE POLICY "Agents can create listing submissions"
ON listing_approvals FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id AND 
    get_user_role(auth.uid()) = 'agent'
);

CREATE POLICY "Agents can view own submissions"
ON listing_approvals FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions"
ON listing_approvals FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update submissions"
ON listing_approvals FOR UPDATE
TO authenticated
USING (get_user_role(auth.uid()) = 'admin')
WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete rejected submissions"
ON listing_approvals FOR DELETE
TO authenticated
USING (
    get_user_role(auth.uid()) = 'admin' AND 
    approval_status = 'rejected'
);

-- Step 11: Create RLS policies for listed_properties
CREATE POLICY "Public can view available properties"
ON listed_properties FOR SELECT
TO authenticated
USING (
    is_public = true AND 
    is_deleted = false AND 
    property_status = 'available'
);

CREATE POLICY "Agents can view own properties"
ON listed_properties FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all properties"
ON listed_properties FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can insert approved listings"
ON listed_properties FOR INSERT
TO authenticated
WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Agents can update own properties"
ON listed_properties FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any property"
ON listed_properties FOR UPDATE
TO authenticated
USING (get_user_role(auth.uid()) = 'admin')
WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Agents can delete own properties"
ON listed_properties FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND is_deleted = true);

-- Step 12: Create approval workflow functions
CREATE OR REPLACE FUNCTION approve_listing(approval_record_id BIGINT)
RETURNS BIGINT AS $$
DECLARE
    new_property_id BIGINT;
BEGIN
    -- Insert into listed_properties from listing_approvals
    INSERT INTO listed_properties (
        approval_id, user_id, property_title, property_type, listing_type,
        price, bedrooms, bathrooms, square_feet, lot_size, year_built,
        parking_spaces, available_from, furnished, pet_policy,
        street_address, city, state, zip_postal, country,
        description, about_property, full_name, email, phone_number,
        features, utilities, nearby_places, media
    )
    SELECT 
        id, user_id, property_title, property_type, listing_type,
        price, bedrooms, bathrooms, square_feet, lot_size, year_built,
        parking_spaces, available_from, furnished, pet_policy,
        street_address, city, state, zip_postal, country,
        description, about_property, full_name, email, phone_number,
        features, utilities, nearby_places, media
    FROM listing_approvals
    WHERE id = approval_record_id
    RETURNING id INTO new_property_id;

    -- Update the approval record
    UPDATE listing_approvals
    SET 
        approval_status = 'approved',
        reviewed_by = auth.uid(),
        reviewed_at = NOW()
    WHERE id = approval_record_id;

    RETURN new_property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reject_listing(
    approval_record_id BIGINT,
    reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE listing_approvals
    SET 
        approval_status = 'rejected',
        reviewed_by = auth.uid(),
        reviewed_at = NOW(),
        rejection_reason = reason
    WHERE id = approval_record_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 13: Grant execute permissions
GRANT EXECUTE ON FUNCTION approve_listing(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_listing(BIGINT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;

-- ============================================
-- Setup complete! You can now:
-- 1. Submit listings (agents)
-- 2. Approve/reject listings (admins)
-- 3. View approved listings (all users)
-- ============================================
