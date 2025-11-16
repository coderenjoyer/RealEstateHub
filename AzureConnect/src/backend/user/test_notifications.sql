-- Test Script: Create Sample Notifications
-- Run this script to test the notification system
-- Copy one or more of these queries and paste into Supabase SQL Editor

-- IMPORTANT: Replace 'USER_ID_HERE' with actual user IDs from auth.users table
-- You can find user IDs in Supabase Dashboard > Authentication > Users

-- Test 1: Create a sample property notification
INSERT INTO notifications (
  user_id,
  title,
  message,
  type,
  related_property_id,
  related_agent_id,
  read,
  created_at
) VALUES (
  'USER_ID_HERE',
  'New Property Listed',
  'John Smith posted a new 3 Bedroom House in Manila for $500,000.00',
  'property',
  NULL,
  NULL,
  FALSE,
  NOW()
);

-- Test 2: Create a sample message notification
INSERT INTO notifications (
  user_id,
  title,
  message,
  type,
  read,
  created_at
) VALUES (
  'USER_ID_HERE',
  'Message from Agent',
  'Sarah Johnson sent you a message about the property viewing',
  'message',
  FALSE,
  NOW()
);

-- Test 3: Create a sample system notification
INSERT INTO notifications (
  user_id,
  title,
  message,
  type,
  read,
  created_at
) VALUES (
  'USER_ID_HERE',
  'System Update',
  'New features have been added to your dashboard',
  'system',
  FALSE,
  NOW()
);

-- Test 4: View all notifications for a specific user
SELECT * FROM notifications 
WHERE user_id = 'USER_ID_HERE'
ORDER BY created_at DESC;

-- Test 5: Count unread notifications for a user
SELECT COUNT(*) as unread_count FROM notifications 
WHERE user_id = 'USER_ID_HERE' AND read = FALSE;

-- Test 6: Mark all notifications as read for a user
UPDATE notifications 
SET read = TRUE 
WHERE user_id = 'USER_ID_HERE' AND read = FALSE;

-- Test 7: Delete old notifications (older than 30 days)
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Test 8: View notifications with property details
SELECT 
  n.id,
  n.title,
  n.message,
  n.type,
  n.read,
  n.created_at,
  lp.property_title,
  lp.price,
  lp.city
FROM notifications n
LEFT JOIN listed_properties lp ON n.related_property_id = lp.id
WHERE n.user_id = 'USER_ID_HERE'
ORDER BY n.created_at DESC;

-- Test 9: Check the trigger is working
-- After running this, check if notifications were created for other users
INSERT INTO listed_properties (
  user_id,
  property_title,
  property_type,
  listing_type,
  price,
  bedrooms,
  bathrooms,
  street_address,
  city,
  zip_postal,
  description,
  full_name,
  email,
  phone_number
) VALUES (
  'AGENT_USER_ID_HERE',
  'Test Property',
  'House',
  'sale',
  250000.00,
  3,
  2,
  '123 Test Street',
  'Test City',
  '12345',
  'This is a test property',
  'Test Agent',
  'test@example.com',
  '09123456789'
);

-- Then verify notifications were created:
SELECT COUNT(*) as notification_count FROM notifications 
WHERE type = 'property' AND created_at > NOW() - INTERVAL '5 minutes';
