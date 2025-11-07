-- 1) Create the properties table (Postgres / Supabase)
CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL, -- Supabase auth.users.id
    property_title VARCHAR(255) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    listing_type TEXT CHECK (listing_type IN ('sale', 'rent')) NOT NULL,
    property_status TEXT CHECK (property_status IN ('available', 'pending', 'sold', 'rented')) DEFAULT 'available',
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
    features JSONB,          -- e.g. ["Balcony", "Pool", "Garden"]
    utilities JSONB,         -- e.g. ["Electricity", "Water", "Internet"]
    nearby_places JSONB,     -- e.g. [{"name":"Mall","distance_km":1.2}]
    media JSONB,             -- e.g. [{"file_name":"front.jpg","bucket_path":"property-media/{user_id}/{property_id}/front.jpg","mime_type":"image/jpeg","size":245678,"order":1}]

    -- Visibility
    is_public BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Create indexes (Postgres style)
CREATE INDEX idx_user_id ON properties (user_id);
CREATE INDEX idx_property_type ON properties (property_type);
CREATE INDEX idx_listing_type ON properties (listing_type);
CREATE INDEX idx_city ON properties (city);
CREATE INDEX idx_price ON properties (price);
CREATE INDEX idx_bedrooms ON properties (bedrooms);
CREATE INDEX idx_is_public ON properties (is_public);
CREATE INDEX idx_is_deleted ON properties (is_deleted);

-- Optional: if you will frequently query JSONB contents, you can add GIN indexes:
-- CREATE INDEX idx_features_gin ON properties USING GIN (features);
-- CREATE INDEX idx_media_gin ON properties USING GIN (media);

-- 3) Trigger to auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
