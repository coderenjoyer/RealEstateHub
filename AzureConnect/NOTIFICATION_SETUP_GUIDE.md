# Notification System Setup Guide

This document outlines the implementation of a database-connected notification system for the RealEstateHub application.

## Overview

The notification system:
- Stores notifications in a Supabase database table
- Automatically creates notifications when new properties are posted
- Provides real-time updates using Supabase Realtime
- Displays notifications in the UI with read/unread status

## Implementation Steps

### 1. Create the Notifications Table

Run the SQL script in Supabase SQL Editor:
```
src/backend/user/notifications.sql
```

This creates:
- `notifications` table with user_id, title, message, type, and read status
- Row Level Security (RLS) policies for user access control
- Indexes for performance optimization

### 2. Setup Property Notification Trigger

Run the SQL script in Supabase SQL Editor:
```
src/backend/admin/create_property_notifications.sql
```

This creates:
- Function `create_property_notification()` that generates notifications for all users when a property is listed
- Trigger that automatically calls this function on new property insertions
- Notifications include agent name, property title, location, and price

### 3. Enable Realtime for Notifications Table

In your Supabase Dashboard:
1. Navigate to **Database** → **Tables**
2. Find the `notifications` table
3. Click the **Realtime** toggle to enable it
4. Select **INSERT**, **UPDATE**, and **DELETE** events

Alternatively, run in SQL Editor if the UI is unavailable.

## Files Changed/Created

### New Files
- `src/hooks/useNotifications.ts` - Custom React hook for managing notifications
- `src/backend/user/notifications.sql` - Database table setup
- `src/backend/admin/create_property_notifications.sql` - Trigger setup for auto-notifications

### Modified Files
- `src/components/User/notification.tsx` - Updated to use real database notifications
- `src/components/User/top-nav.tsx` - Updated to use `useNotifications` hook

## Features

### useNotifications Hook
Location: `src/hooks/useNotifications.ts`

Provides:
- `notifications` - Array of user's notifications
- `loading` - Loading state
- `error` - Error messages
- `unreadCount` - Count of unread notifications
- `markAsRead(id)` - Mark single notification as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Delete a notification
- `refetch()` - Manually refresh notifications

### Notification Component
Location: `src/components/User/notification.tsx`

Features:
- Real-time notification updates via Supabase Realtime
- Filter by "All" or "Unread" notifications
- Click to mark notifications as read
- "Mark all as read" button
- Relative time formatting (e.g., "2m", "1h", "2d")
- Different icons and colors for notification types

## Notification Types

1. **property** - New property listings, price drops, availability changes
2. **message** - Messages from agents
3. **favorite** - When a property is added to favorites
4. **appointment** - Appointment reminders and scheduling
5. **system** - System updates and announcements

## Auto-Notification on Property Listing

When a new property is posted by an agent:
1. Trigger fires on `listed_properties` insert
2. Function retrieves agent name from profiles table
3. Creates notification for each user (excluding the agent)
4. Notification contains:
   - Title: "New Property Listed"
   - Message: "[Agent Name] posted a new [Property] in [City] for $[Price]"
   - Type: "property"
   - Related Property ID: Links to the property
   - Related Agent ID: Links to the agent

## Database Schema

### notifications table columns
- `id` - Primary key (BIGSERIAL)
- `user_id` - Foreign key to auth.users
- `title` - Notification title (VARCHAR 255)
- `message` - Notification message (TEXT)
- `type` - Notification type (property, message, favorite, appointment, system)
- `related_property_id` - Foreign key to listed_properties (nullable)
- `related_agent_id` - Foreign key to auth.users (nullable)
- `read` - Boolean flag for read status (default: false)
- `created_at` - Timestamp of creation
- `updated_at` - Timestamp of last update

### Indexes
- `idx_notifications_user_id` - For user lookups
- `idx_notifications_read` - For unread count queries
- `idx_notifications_created_at` - For sorting
- `idx_notifications_type` - For filtering by type

## RLS Policies

1. **users_view_own_notifications** - Users can only view their own notifications
2. **users_update_own_notifications** - Users can mark their own as read
3. **users_delete_own_notifications** - Users can delete their own notifications
4. **admins_insert_notifications** - Admins/agents can insert notifications

## Usage in Components

### In TopNav Component
```typescript
import { useNotifications } from "../../hooks/useNotifications";

// Get unread count for badge
const { unreadCount } = useNotifications();

// Display in notification button
{unreadNotificationsCount > 0 && (
  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
)}
```

### In Notification Dropdown
```typescript
// Hook automatically provides all notifications
const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();

// Mark individual notification as read
onClick={() => !notification.read && markAsRead(notification.id)}

// Mark all as read
onClick={markAllAsRead}
```

## Testing the Implementation

1. **Create Test Notifications**:
   - Insert test data into the notifications table via Supabase Dashboard

2. **Test Auto-Notifications**:
   - Create a new property through the agent interface
   - Check if notifications appear for all users in real-time

3. **Test Real-Time Updates**:
   - Open the notification dropdown in multiple browser tabs
   - Mark a notification as read in one tab
   - Verify it updates in other tabs instantly

4. **Test Filtering**:
   - Toggle between "All" and "Unread" filters
   - Verify correct notifications display

## Troubleshooting

### Notifications Not Appearing
- Verify the `notifications` table exists in Supabase
- Check RLS policies are enabled and correct
- Ensure Realtime is enabled for the table
- Check browser console for errors

### Realtime Not Working
- Verify Realtime is enabled in Supabase Dashboard
- Check WebSocket connection in browser DevTools
- Confirm RLS policies allow the user to view notifications

### Performance Issues
- Ensure indexes are created (see SQL setup files)
- Consider pagination if users have many notifications
- Limit notification retention (e.g., delete after 90 days)

## Future Enhancements

1. Add notification persistence (limit to last 100)
2. Implement notification categories/preferences
3. Add email notifications for offline users
4. Create admin interface for sending system notifications
5. Add notification sound/desktop alerts
6. Implement notification archiving
