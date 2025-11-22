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

  // Get user role
  const userRole = session?.user?.user_metadata?.role;
  const isAdmin = userRole === 'admin';

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
        // Get all messages from admin that haven't been read yet
        // For simplicity, we'll just count messages from the admin
        const { data, error } = await supabase
          .from('admin_messages')
          .select('id')
          .eq('sender_id', adminId)
          .eq('recipient_id', session.user.id);

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
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, adminId]);

  if (!session?.user?.id || isAdmin) return null;

  // Don't return null while loading - show button even if admin ID hasn't loaded yet
  if (isLoading) {
    return (
      <button
        className="fixed bottom-6 right-6 z-[999] bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 flex items-center justify-center"
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
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-[999] bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 flex items-center justify-center"
      >
        <MessageCircle size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
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
