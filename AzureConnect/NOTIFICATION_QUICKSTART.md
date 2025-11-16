# Notification System - Quick Start

## What's New

Your notification component is now connected to a Supabase database with:
- ✅ Real-time notifications from new property listings
- ✅ Persistent storage of all notifications
- ✅ Read/Unread status tracking
- ✅ Real-time updates across browser tabs

## Setup (5 minutes)

### Step 1: Run Database Setup SQL

1. Open your Supabase Dashboard
2. Go to **SQL Editor** and run these scripts in order:

**Script 1:** Create notifications table
```
File: src/backend/user/notifications.sql
```

**Script 2:** Create auto-notification trigger
```
File: src/backend/admin/create_property_notifications.sql
```

### Step 2: Enable Realtime

1. In Supabase Dashboard, go to **Database** → **Tables**
2. Find the `notifications` table
3. Toggle the **Realtime** switch ON
4. Select events: **INSERT**, **UPDATE**, **DELETE**

### Step 3: Done!

The notification system is now live. Users will automatically receive notifications when new properties are posted.

## How It Works

### For Users:
1. When an agent posts a new property, all users get a notification
2. Notifications show: Agent name, property type, location, and price
3. Click notification to mark as read
4. Filter by "All" or "Unread"

### In the Database:
- New property → Trigger fires → Creates notifications for all users
- Notifications are stored in `notifications` table
- Real-time sync via Supabase Realtime

## Testing

1. **As Agent:** Post a new property in Agent Portal
2. **As User:** Check notification dropdown in top-right
3. You should see: "Agent Name posted a new [Property] in [City] for $[Price]"

## Files Modified

- `src/components/User/notification.tsx` - Now uses real data
- `src/components/User/top-nav.tsx` - Shows real unread count

## Files Created

- `src/hooks/useNotifications.ts` - Notification management hook
- `src/backend/user/notifications.sql` - Database table
- `src/backend/admin/create_property_notifications.sql` - Auto-notification trigger
- `NOTIFICATION_SETUP_GUIDE.md` - Full documentation

## Key Features

| Feature | Status |
|---------|--------|
| Store notifications in database | ✅ |
| Real-time updates | ✅ |
| Mark as read/unread | ✅ |
| Filter notifications | ✅ |
| Auto-notify on property listing | ✅ |
| Show agent name in notification | ✅ |
| Unread badge in top-nav | ✅ |

## Next Steps

- **Optional:** Customize notification templates in `create_property_notifications.sql`
- **Optional:** Add more notification types (price drops, favorites, etc.)
- **Optional:** Implement email notifications for offline users

## Troubleshooting

**Notifications not appearing?**
- Check that `notifications` table exists in Supabase
- Verify Realtime is enabled for the table
- Check browser console for errors

**Not seeing unread count?**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check that `useNotifications` hook is imported

## Questions?

See `NOTIFICATION_SETUP_GUIDE.md` for detailed documentation.
