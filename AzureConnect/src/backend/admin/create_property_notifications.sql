-- Function to create notifications for all users when a property is listed
CREATE OR REPLACE FUNCTION create_property_notification()
RETURNS TRIGGER AS $$
DECLARE
  agent_name TEXT;
  agent_profile RECORD;
BEGIN
  -- Get agent name from profiles table
  SELECT first_name, last_name INTO agent_profile
  FROM profiles
  WHERE user_id = NEW.user_id;
  
  agent_name := COALESCE(agent_profile.first_name || ' ' || agent_profile.last_name, 'An agent');

  -- Create notifications for all users
  INSERT INTO notifications (user_id, title, message, type, related_property_id, related_agent_id, read, created_at)
  SELECT 
    auth.users.id,
    'New Property Listed',
    agent_name || ' posted a new ' || NEW.property_title || ' in ' || NEW.city || ' for $' || TO_CHAR(NEW.price, 'FM9,999,999.99'),
    'property',
    NEW.id,
    NEW.user_id,
    FALSE,
    NOW()
  FROM auth.users
  WHERE auth.users.id != NEW.user_id AND raw_user_meta_data->>'role' = 'user';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on listed_properties table
DROP TRIGGER IF EXISTS trg_create_property_notification ON listed_properties;
CREATE TRIGGER trg_create_property_notification
AFTER INSERT ON listed_properties
FOR EACH ROW
EXECUTE FUNCTION create_property_notification();

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_property_notification() TO authenticated;
