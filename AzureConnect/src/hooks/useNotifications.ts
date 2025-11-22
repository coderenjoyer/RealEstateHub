import { useEffect, useState, useCallback } from 'react';
import supabase from '../supabaseClient';
import { useAuth } from '../AuthContext';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  type: 'property' | 'message' | 'favorite' | 'appointment' | 'system';
  related_property_id: number | null;
  related_agent_id: string | null;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotifications() {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        setError(error.message);
        return;
      }

      setNotifications(data || []);
      const unread = (data || []).filter((n) => !n.read).length;
      setUnreadCount(unread);
      setError(null);
    } catch (err) {
      console.error('Exception fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!session?.user?.id) return;

    let channel: RealtimeChannel | null = null;

    const setupRealtime = async () => {
      try {
        // Fetch initial data
        await fetchNotifications();

        // Subscribe to real-time changes
        channel = supabase
          .channel(`notifications:${session.user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${session.user.id}`,
            },
            (payload) => {
              setNotifications((prev) => [payload.new as Notification, ...prev]);
              setUnreadCount((prev) => prev + 1);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${session.user.id}`,
            },
            (payload) => {
              const updatedNotification = payload.new as Notification;
              setNotifications((prev) =>
                prev.map((n) =>
                  n.id === updatedNotification.id ? updatedNotification : n
                )
              );
              // Recalculate unread count after update
              setNotifications((prev) => {
                const unread = prev.filter((n) => !n.read).length;
                setUnreadCount(unread);
                return prev;
              });
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${session.user.id}`,
            },
            (payload) => {
              setNotifications((prev) =>
                prev.filter((n) => n.id !== (payload.old as Notification).id)
              );
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Error setting up realtime:', err);
      }
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [session?.user?.id, fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: number) => {
      if (!session?.user?.id) return;

      try {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true, updated_at: new Date().toISOString() }) // Add updated_at to trigger real-time update
          .eq('id', notificationId)
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error marking notification as read:', error);
          return;
        }

        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Exception marking notification as read:', err);
      }
    },
    [session?.user?.id]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() }) // Add updated_at to trigger real-time update
        .eq('user_id', session.user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all as read:', error);
        return;
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Exception marking all as read:', err);
    }
  }, [session?.user?.id]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: number) => {
      if (!session?.user?.id) return;

      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId)
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error deleting notification:', error);
          return;
        }

        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      } catch (err) {
        console.error('Exception deleting notification:', err);
      }
    },
    [session?.user?.id]
  );

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}
