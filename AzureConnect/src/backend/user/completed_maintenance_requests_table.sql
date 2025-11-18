-- Table: completed_maintenance_requests
-- Purpose: Store completed maintenance requests for reporting and historical purposes
--          This table contains only completed maintenance requests for easier querying

CREATE TABLE IF NOT EXISTS completed_maintenance_requests (
    id BIGSERIAL PRIMARY KEY,
    property_ownership_id BIGINT NOT NULL REFERENCES property_ownerships(id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL REFERENCES listed_properties(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL,
    agent_id UUID,
    maintenance_type TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    description TEXT,
    scheduled_date DATE,
    completed_date DATE,
    estimated_cost NUMERIC(12,2),
    actual_cost NUMERIC(12,2),
    assigned_to TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_completed_maintenance_owner
    ON completed_maintenance_requests(owner_id);

CREATE INDEX IF NOT EXISTS idx_completed_maintenance_property
    ON completed_maintenance_requests(property_id);

CREATE INDEX IF NOT EXISTS idx_completed_maintenance_ownership
    ON completed_maintenance_requests(property_ownership_id);

CREATE INDEX IF NOT EXISTS idx_completed_maintenance_agent
    ON completed_maintenance_requests(agent_id);

CREATE INDEX IF NOT EXISTS idx_completed_maintenance_completed_date
    ON completed_maintenance_requests(completed_date);

CREATE INDEX IF NOT EXISTS idx_completed_maintenance_type
    ON completed_maintenance_requests(maintenance_type);

ALTER TABLE completed_maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Owners can view their completed maintenance requests
CREATE POLICY "Owners can view their completed maintenance requests"
ON completed_maintenance_requests FOR SELECT
USING (auth.uid() = owner_id);

-- Agents can view completed maintenance requests for properties they manage
CREATE POLICY "Agents can view completed maintenance requests"
ON completed_maintenance_requests FOR SELECT
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'agent'
  AND (
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1
      FROM property_ownerships po
      WHERE po.id = completed_maintenance_requests.property_ownership_id
        AND po.agent_id = auth.uid()
    )
  )
);

-- Admins can view all completed maintenance requests
CREATE POLICY "Admins can view all completed maintenance requests"
ON completed_maintenance_requests FOR SELECT
USING ((auth.jwt() ->> 'role') = 'admin');

-- Owners can insert completed maintenance requests
CREATE POLICY "Owners can insert completed maintenance requests"
ON completed_maintenance_requests FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Agents can insert completed maintenance requests for properties they manage
CREATE POLICY "Agents can insert completed maintenance requests"
ON completed_maintenance_requests FOR INSERT
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'agent'
  AND EXISTS (
    SELECT 1
    FROM property_ownerships po
    WHERE po.id = property_ownership_id
      AND po.agent_id = auth.uid()
  )
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION set_completed_maintenance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_completed_maintenance_updated_at
BEFORE UPDATE ON completed_maintenance_requests
FOR EACH ROW
EXECUTE FUNCTION set_completed_maintenance_updated_at();