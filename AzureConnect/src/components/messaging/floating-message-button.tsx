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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [messagingEnabled, setMessagingEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get user role from auth metadata and check messaging status
  useEffect(() => {
    const initializeButton = async () => {
      if (!session?.user?.id) return;

      try {
        // Get role from auth metadata
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        const role = user?.user_metadata?.role || null;
        setUserRole(role);
        
        // Check if messaging is enabled
        const { data: settings, error: settingsError } = await supabase
          .from('admin_settings')
          .select('messaging_enabled')
          .single();
        
        if (!settingsError && settings) {
          setMessagingEnabled(settings.messaging_enabled ?? true);
        }
        
        // Get admin ID
        const { data: adminProfiles, error: adminError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('role', 'admin')
          .limit(1);

        if (!adminError && adminProfiles && adminProfiles.length > 0) {
          setAdminId(adminProfiles[0].user_id);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing message button:', error);
        setIsInitialized(true);
      }
    };

    initializeButton();
  }, [session?.user?.id]);

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

  // Only show button for users and agents (not for admins), and only if messaging is enabled and initialized
  if (!session?.user?.id) return null;
  if (userRole === 'admin') return null;
  if (!isInitialized) return null; // Wait for initialization
  if (!messagingEnabled) return null; // Don't show if messaging is disabled
  if (!adminId) return null; // Wait for admin ID

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
