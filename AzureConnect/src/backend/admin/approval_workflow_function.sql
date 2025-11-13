-- Function to approve a listing and move it to listed_properties
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

-- Function to reject a listing
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION approve_listing(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_listing(BIGINT, TEXT) TO authenticated;
