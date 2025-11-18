-- Table: property_maintenance_logs
-- Purpose: Store every maintenance interaction submitted by a homeowner
--          so we keep a full history beyond the latest status snapshot.

CREATE TABLE IF NOT EXISTS property_maintenance_logs (
    id BIGSERIAL PRIMARY KEY,
    property_ownership_id BIGINT NOT NULL REFERENCES property_ownerships(id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL REFERENCES listed_properties(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL,
    maintenance_type TEXT NOT NULL,
    maintenance_status TEXT CHECK (maintenance_status IN ('pending', 'in-progress', 'completed')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    description TEXT,
    scheduled_date DATE,
    estimated_cost NUMERIC(12,2),
    assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_property_maintenance_logs_owner
    ON property_maintenance_logs(owner_id);

CREATE INDEX IF NOT EXISTS idx_property_maintenance_logs_ownership
    ON property_maintenance_logs(property_ownership_id);

ALTER TABLE property_maintenance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their maintenance logs"
ON property_maintenance_logs FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert maintenance logs"
ON property_maintenance_logs FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Agents can view maintenance logs"
ON property_maintenance_logs FOR SELECT
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'agent'
  AND EXISTS (
    SELECT 1
    FROM property_ownerships po
    WHERE po.id = property_maintenance_logs.property_ownership_id
      AND po.agent_id = auth.uid()
  )
);

CREATE POLICY "Agents can insert maintenance logs"
ON property_maintenance_logs FOR INSERT
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'agent'
  AND EXISTS (
    SELECT 1
    FROM property_ownerships po
    WHERE po.id = property_maintenance_logs.property_ownership_id
      AND po.agent_id = auth.uid()
  )
);

CREATE POLICY "Agents can update maintenance logs"
ON property_maintenance_logs FOR UPDATE
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'agent'
  AND EXISTS (
    SELECT 1
    FROM property_ownerships po
    WHERE po.id = property_maintenance_logs.property_ownership_id
      AND po.agent_id = auth.uid()
  )
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'agent'
  AND EXISTS (
    SELECT 1
    FROM property_ownerships po
    WHERE po.id = property_maintenance_logs.property_ownership_id
      AND po.agent_id = auth.uid()
  )
);

CREATE POLICY "Agents can delete maintenance logs"
ON property_maintenance_logs FOR DELETE
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'agent'
  AND EXISTS (
    SELECT 1
    FROM property_ownerships po
    WHERE po.id = property_maintenance_logs.property_ownership_id
      AND po.agent_id = auth.uid()
  )
);