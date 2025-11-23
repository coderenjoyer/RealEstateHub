-- Add rent_end_date column to property_ownerships table
-- This column stores the date when a rental period ends
-- Run this SQL in your Supabase SQL Editor

-- Add the rent_end_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'property_ownerships' 
        AND column_name = 'rent_end_date'
    ) THEN
        ALTER TABLE property_ownerships
        ADD COLUMN rent_end_date DATE;
        
        -- Add a comment to describe the column
        COMMENT ON COLUMN property_ownerships.rent_end_date IS 'The date when the rental period ends and the property should be deactivated';
    END IF;
END $$;

-- Update the view to include rent_end_date
DROP VIEW IF EXISTS property_ownerships_with_properties CASCADE;

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
