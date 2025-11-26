import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import AdminMessagingModal from '@/components/ui/admin-messaging-modal';
import { useAuth } from '@/AuthContext';
import supabase from '@/supabaseClient';

const FloatingMessageButton: React.FC = () => {
  const { session } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Get user role
  useEffect(() => {
    const getUserRole = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (error) throw error;
        setUserRole(data?.role || null);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    getUserRole();
  }, [session?.user?.id]);

  // Get admin ID on mount
  useEffect(() => {
    const getAdminId = async () => {
      try {
        // Query to find an admin user
        const { data: adminProfiles, error } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('role', 'admin')
          .limit(1);

        if (error) throw error;

        if (adminProfiles && adminProfiles.length > 0) {
          setAdminId(adminProfiles[0].user_id);
        }
      } catch (error) {
        console.error('Error fetching admin ID:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getAdminId();
  }, []);

  // Count unread messages from admin
  useEffect(() => {
    if (!session?.user?.id || !adminId) return;

    const fetchUnreadCount = async () => {
      try {
        // Get unread messages from admin (only count messages where is_read is false or null)
        const { data, error } = await supabase
          .from('admin_messages')
          .select('id')
          .eq('sender_id', adminId)
          .eq('recipient_id', session.user.id)
          .or('is_read.eq.false,is_read.is.null');

        if (error) throw error;
        setUnreadCount(data?.length || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase.channel(`messages_unread_${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_messages',
          filter: `recipient_id=eq.${session.user.id}`,
        },
        (payload: any) => {
          // If the message is from admin and not read, increment count
          if (payload.new.sender_id === adminId) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'admin_messages',
          filter: `recipient_id=eq.${session.user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, adminId]);

  // Only show button for users and agents (not for admins)
  if (!session?.user?.id) return null;
  if (userRole === 'admin') return null;

  // Don't return null while loading - show button even if admin ID hasn't loaded yet
  if (isLoading) {
    return (
      <button
        className="fixed bottom-6 right-[38px] z-[999] bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 flex items-center justify-center"
        disabled
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={async () => {
          setShowModal(true);
          // Mark all unread messages as read in database
          if (adminId && session?.user?.id) {
            try {
              await supabase
                .from('admin_messages')
                .update({ is_read: true })
                .eq('sender_id', adminId)
                .eq('recipient_id', session.user.id)
                .or('is_read.eq.false,is_read.is.null');
              setUnreadCount(0);
            } catch (error) {
              console.error('Error marking messages as read:', error);
            }
          }
        }}
        className="fixed bottom-25 right-[20px] z-[999] bg-[#49769F] text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 flex items-center justify-center"
      >
        <MessageCircle size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 w-3 h-3 rounded-full"></span>
        )}
      </button>

      {/* Modal */}
      {adminId && (
        <AdminMessagingModal
          open={showModal}
          onClose={() => setShowModal(false)}
          userId={session.user.id}
          adminId={adminId}
        />
      )}
    </>
  );
};

export default FloatingMessageButton;
