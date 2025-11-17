-- Table: property_ownerships
-- Purpose: Track homes transferred from agents to end-users so that
--          owners can view their maintenance items while the public
--          listings remain hidden.

CREATE TABLE IF NOT EXISTS property_ownerships (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES listed_properties(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL,
    agent_id UUID NOT NULL,
    owner_email VARCHAR(255),
    owner_name VARCHAR(255),
    maintenance_status TEXT CHECK (maintenance_status IN ('pending', 'in-progress', 'completed')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    next_due_date DATE,
    notes TEXT,
    transferred_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_property_ownerships_property
    ON property_ownerships(property_id);

CREATE INDEX IF NOT EXISTS idx_property_ownerships_owner
    ON property_ownerships(owner_id);

CREATE INDEX IF NOT EXISTS idx_property_ownerships_agent
    ON property_ownerships(agent_id);

CREATE INDEX IF NOT EXISTS idx_property_ownerships_status
    ON property_ownerships(maintenance_status);

CREATE TRIGGER trg_property_ownerships_updated_at
BEFORE UPDATE ON property_ownerships
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

ALTER TABLE property_ownerships ENABLE ROW LEVEL SECURITY;

-- Owners can read their own maintenance records
CREATE POLICY "Owners can view their properties"
ON property_ownerships FOR SELECT
USING (auth.uid() = owner_id);

-- Agents can view records they created
CREATE POLICY "Agents can view transfers they created"
ON property_ownerships FOR SELECT
USING (auth.uid() = agent_id);

-- Agents can insert transfer records for properties they own
CREATE POLICY "Agents can create transfers"
ON property_ownerships FOR INSERT
WITH CHECK (auth.uid() = agent_id);

-- Owners can update maintenance status on their records
CREATE POLICY "Owners can update maintenance progress"
ON property_ownerships FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Agents can update records they created (e.g., notes)
CREATE POLICY "Agents can update transfer metadata"
ON property_ownerships FOR UPDATE
USING (auth.uid() = agent_id)
WITH CHECK (auth.uid() = agent_id);

-- Convenience view to display ownerships with property info
CREATE OR REPLACE VIEW property_ownerships_with_properties AS
SELECT
    po.*,
    lp.property_title,
    lp.property_type,
    lp.street_address,
    lp.city,
    lp.state
FROM property_ownerships po
LEFT JOIN listed_properties lp ON lp.id = po.property_id;

