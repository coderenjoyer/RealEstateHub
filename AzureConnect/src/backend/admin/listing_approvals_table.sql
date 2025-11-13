-- Table for pending listing approvals (submissions awaiting admin review)
CREATE TABLE listing_approvals (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL, -- Supabase auth.users.id (agent who submitted)
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

    -- Approval status
    approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewed_by UUID, -- admin user_id who reviewed
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,

    -- Timestamps
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for listing_approvals
CREATE INDEX idx_listing_approvals_user_id ON listing_approvals (user_id);
CREATE INDEX idx_listing_approvals_approval_status ON listing_approvals (approval_status);
CREATE INDEX idx_listing_approvals_submitted_at ON listing_approvals (submitted_at);

-- Trigger to auto-update updated_at
CREATE TRIGGER trg_listing_approvals_updated_at
BEFORE UPDATE ON listing_approvals
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- RLS Policies for listing_approvals
ALTER TABLE listing_approvals ENABLE ROW LEVEL SECURITY;

-- Agents can insert their own submissions
CREATE POLICY "Agents can create listing submissions"
ON listing_approvals FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id AND 
    (auth.jwt() ->> 'role') = 'agent'
);

-- Agents can view their own submissions
CREATE POLICY "Agents can view own submissions"
ON listing_approvals FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
ON listing_approvals FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

-- Admins can update submissions (approve/reject)
CREATE POLICY "Admins can update submissions"
ON listing_approvals FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Admins can delete rejected submissions
CREATE POLICY "Admins can delete rejected submissions"
ON listing_approvals FOR DELETE
TO authenticated
USING (
    (auth.jwt() ->> 'role') = 'admin' AND 
    approval_status = 'rejected'
);
