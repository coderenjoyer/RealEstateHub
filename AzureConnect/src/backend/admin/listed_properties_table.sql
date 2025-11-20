-- Table for approved/listed properties (visible to users)
CREATE TABLE listed_properties (
    id BIGSERIAL PRIMARY KEY,
    approval_id BIGINT REFERENCES listing_approvals(id), -- Link to original submission
    user_id UUID NOT NULL, -- Supabase auth.users.id (agent/owner)
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

    -- Location
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    zip_postal VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'Philippines',

    -- Description
    description TEXT NOT NULL,
    about_property TEXT,

    -- Contact
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,

    -- JSONB fields
    features JSONB,
    utilities JSONB,
    nearby_places JSONB,
    media JSONB,

    -- Visibility
    is_public BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,

    -- Timestamps
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for listed_properties
CREATE INDEX idx_listed_properties_user_id ON listed_properties (user_id);
CREATE INDEX idx_listed_properties_property_type ON listed_properties (property_type);
CREATE INDEX idx_listed_properties_listing_type ON listed_properties (listing_type);
CREATE INDEX idx_listed_properties_property_status ON listed_properties (property_status);
CREATE INDEX idx_listed_properties_city ON listed_properties (city);
CREATE INDEX idx_listed_properties_price ON listed_properties (price);
CREATE INDEX idx_listed_properties_bedrooms ON listed_properties (bedrooms);
CREATE INDEX idx_listed_properties_is_public ON listed_properties (is_public);
CREATE INDEX idx_listed_properties_is_deleted ON listed_properties (is_deleted);

-- Trigger to auto-update updated_at
CREATE TRIGGER trg_listed_properties_updated_at
BEFORE UPDATE ON listed_properties
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- RLS Policies for listed_properties
ALTER TABLE listed_properties ENABLE ROW LEVEL SECURITY;

-- Public can view available, non-deleted properties
CREATE POLICY "Public can view available properties"
ON listed_properties FOR SELECT
TO authenticated
USING (
    is_public = true AND 
    is_deleted = false AND 
    property_status = 'available'
);

-- Agents can view their own properties
CREATE POLICY "Agents can view own properties"
ON listed_properties FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all properties
CREATE POLICY "Admins can view all properties"
ON listed_properties FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@example.com');

-- Admins can insert approved listings
CREATE POLICY "Admins can insert approved listings"
ON listed_properties FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'email' = 'admin@example.com');

-- Agents can update their own properties
CREATE POLICY "Agents can update own properties"
ON listed_properties FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can update any property
CREATE POLICY "Admins can update any property"
ON listed_properties FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@example.com')
WITH CHECK (auth.jwt() ->> 'email' = 'admin@example.com');

-- Agents can soft-delete their own properties
CREATE POLICY "Agents can delete own properties"
ON listed_properties FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND is_deleted = true);

-- Admins can permanently delete any properties
CREATE POLICY "Admins can delete properties"
ON listed_properties FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@example.com');
