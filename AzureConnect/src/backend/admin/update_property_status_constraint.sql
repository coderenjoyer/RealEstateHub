-- Fix property_status CHECK constraint to include 'rejected' status
-- This is required for the admin approval workflow

-- Drop the old constraint
ALTER TABLE properties 
DROP CONSTRAINT IF EXISTS properties_property_status_check;

-- Add new constraint with 'rejected' status included
ALTER TABLE properties 
ADD CONSTRAINT properties_property_status_check 
CHECK (property_status IN ('available', 'pending', 'sold', 'rented', 'rejected'));
