import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Search, MessageCircle, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import supabase from '@/supabaseClient';

interface Recipient {
  id: string;
  email: string;
  name: string;
  role: 'agent' | 'user';
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message_text: string;
  created_at: string;
}

const AdminMessaging: React.FC = () => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingConversation, setDeletingConversation] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current admin ID on mount
  useEffect(() => {
    const getAdminId = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setAdminId(sessionData.session?.user?.id || null);
    };
    getAdminId();
  }, []);

  // Fetch all agents and users
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        // Fetch all agents
        const { data: agentsData, error: agentsError } = await supabase
          .rpc('get_all_users', { user_role: 'agent' });

        // Fetch all users
        const { data: usersData, error: usersError } = await supabase
          .rpc('get_all_users', { user_role: 'user' });

        if (agentsError) {
          // Error fetching agents
        }
        if (usersError) {
          // Error fetching users
        }

        // Combine both arrays
        const allUsers = [...(agentsData || []), ...(usersData || [])];

        const formattedRecipients: Recipient[] = allUsers.map((user: any) => {
          const firstName = user.first_name || '';
          const lastName = user.last_name || '';
          const displayName = `${firstName} ${lastName}`.trim();

          return {
            id: user.id || user.user_id,
            email: user.email || 'No email',
            name: displayName || user.email?.split('@')[0] || 'Unknown User',
            role: user.role as 'agent' | 'user',
          };
        }).sort((a, b) => a.name.localeCompare(b.name));

        setRecipients(formattedRecipients);
      } catch (error) {
        // Error fetching recipients
      }
    };

    fetchRecipients();
  }, []);

  // Fetch unread message counts for all recipients
  useEffect(() => {
    if (!adminId) return;

    const fetchUnreadCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_messages')
          .select('sender_id, is_read')
          .eq('recipient_id', adminId)
          .eq('is_read', false);

        if (error) throw error;

        // Count unread messages by sender
        const counts: { [key: string]: number } = {};
        if (data) {
          data.forEach((msg: any) => {
            counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
          });
        }
        setUnreadCounts(counts);
      } catch (error) {
        // Error fetching unread counts
      }
    };

    fetchUnreadCounts();

    // Subscribe to message changes for real-time unread count updates
    const channel = supabase.channel(`unread_${adminId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_messages',
          filter: `recipient_id=eq.${adminId}`,
        },
        () => {
          // Refetch unread counts when messages change
          fetchUnreadCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [adminId]);

  // ... existing code ...

  // Fetch messages for selected recipient
  useEffect(() => {
    if (!selectedRecipient || !adminId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        // Fetch all messages between admin and selected recipient
        const { data, error } = await supabase
          .from('admin_messages')
          .select('*')
          .or(`and(sender_id.eq.${adminId},recipient_id.eq.${selectedRecipient.id}),and(sender_id.eq.${selectedRecipient.id},recipient_id.eq.${adminId})`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        // Error fetching messages
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Mark messages as read when viewing the conversation
    const markAsRead = async () => {
      try {
        await supabase
          .from('admin_messages')
          .update({ is_read: true })
          .eq('recipient_id', adminId)
          .eq('sender_id', selectedRecipient.id)
          .eq('is_read', false);
      } catch (error) {
        // Error marking messages as read
      }
    };
    markAsRead();

    // Subscribe to real-time updates
    const channel = supabase.channel(`messages_${adminId}_${selectedRecipient.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_messages',
          filter: `or(and(sender_id=eq.${adminId},recipient_id=eq.${selectedRecipient.id}),and(sender_id=eq.${selectedRecipient.id},recipient_id=eq.${adminId}))`,
        },
        (payload: any) => {
          setMessages((prev) => {
            const exists = prev.find((msg) => msg.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRecipient, adminId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDeleteConversation = async () => {
    if (!selectedRecipient || !adminId) return;

    try {
      setDeletingConversation(true);
      
      // Delete all messages between admin and selected recipient
      await supabase
        .from('admin_messages')
        .delete()
        .or(`and(sender_id.eq.${adminId},recipient_id.eq.${selectedRecipient.id}),and(sender_id.eq.${selectedRecipient.id},recipient_id.eq.${adminId})`);

      // Reset UI state immediately before async operations complete
      setSelectedRecipient(null);
      setMessages([]);
      setShowDeleteModal(false);
    } catch (error) {
      alert('Failed to delete conversation. Please try again.');
    } finally {
      setDeletingConversation(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedRecipient || !adminId) return;

    try {
      setSendingMessage(true);
      
      const { error } = await supabase
        .from('admin_messages')
        .insert([
          {
            sender_id: adminId,
            recipient_id: selectedRecipient.id,
            message_text: messageInput.trim(),
          },
        ])
        .select();

      if (error) {
        throw error;
      }
      setMessageInput('');
      
      // Refresh messages after sending
      const { data: refreshedData, error: refreshError } = await supabase
        .from('admin_messages')
        .select('*')
        .or(`and(sender_id.eq.${adminId},recipient_id.eq.${selectedRecipient.id}),and(sender_id.eq.${selectedRecipient.id},recipient_id.eq.${adminId})`)
        .order('created_at', { ascending: true });

      if (refreshError) throw refreshError;
      setMessages(refreshedData || []);
    } catch (error) {
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredRecipients = recipients.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#BDD8E9]">
      {/* Recipients Sidebar */}
      <div className="w-80 bg-white/70 backdrop-blur-xl border-r border-[#49769F]/30 shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#49769F]/30 bg-gradient-to-r from-[#49769F]/10 to-[#0A4174]/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#49769F] flex items-center gap-2">
              <MessageCircle size={24} />
              Messages
            </h2>
            {Object.values(unreadCounts).reduce((a, b) => a + b, 0) > 0 && (
              <div className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
              </div>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#49769F]" />
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white/80 border border-[#49769F]/30 focus:border-[#49769F] focus:ring-[#49769F]/20 rounded-full text-sm"
            />
          </div>
        </div>

        {/* Recipients List */}
        <div className="flex-1 overflow-y-auto">
          {filteredRecipients.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No recipients found</p>
            </div>
          ) : (
            filteredRecipients.map((recipient) => (
              <button
                key={recipient.id}
                onClick={() => setSelectedRecipient(recipient)}
                className={`w-full text-left p-4 border-b border-[#BDD8E9]/50 hover:bg-[#49769F]/10 transition-colors relative ${
                  selectedRecipient?.id === recipient.id ? 'bg-[#49769F]/10 border-l-4 border-l-[#49769F]' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[#49769F]" />
                  <p className="font-semibold text-gray-800 truncate">{recipient.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    recipient.role === 'agent'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {recipient.role}
                  </span>
                  {/* Unread notification indicator */}
                  {unreadCounts[recipient.id] > 0 && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-red-500" />
                  )}
                </div>
                <p className={`text-sm truncate ${
                  recipient.id === selectedRecipient?.id
                    ? "text-gray-800 font-medium"
                    : "text-gray-500"
                }`}>{recipient.email}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRecipient ? (
          <>
            {/* Chat Header */}
            <div className="bg-white/70 backdrop-blur-xl border-b border-[#49769F]/30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#49769F] flex items-center justify-center text-[#F0FFFF] font-semibold">
                  {selectedRecipient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selectedRecipient.name}</p>
                  <p className="text-sm text-gray-600">{selectedRecipient.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm px-3 py-1 rounded-full ${
                  selectedRecipient.role === 'agent'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {selectedRecipient.role.charAt(0).toUpperCase() + selectedRecipient.role.slice(1)}
                </span>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deletingConversation}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete conversation"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.sender_id === adminId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2 ${
                        isAdmin ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl p-3 relative transition-all hover:shadow-lg ${
                          isAdmin
                            ? 'bg-[#49769F] text-white shadow-lg shadow-[#49769F]/30'
                            : 'bg-white text-gray-800 shadow-md border border-[#BDD8E9]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p
                            className={`text-xs font-semibold ${
                              isAdmin ? 'text-[#F0FFFF]' : 'text-[#49769F]'
                            }`}
                          >
                            {isAdmin ? 'You' : selectedRecipient.name}
                          </p>
                          <p
                            className={`text-xs ${
                              isAdmin ? 'text-[#F0FFFF]' : 'text-[#49769F]'
                            } font-medium ml-2`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </p>
                        </div>
                        <p className="text-sm leading-relaxed break-words">{msg.message_text}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white/70 backdrop-blur-xl border-t border-[#49769F]/30 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  disabled={sendingMessage}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49769F] disabled:bg-gray-100"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendingMessage}
                  className="bg-[#49769F] text-white px-4 py-2 rounded-lg hover:bg-[#49769F]/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a recipient to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Conversation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the conversation with {selectedRecipient?.name}? This action cannot be undone and all messages will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingConversation}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                disabled={deletingConversation}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Trash2 size={18} />
                {deletingConversation ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminMessagingPage() {
  return (
    <AdminLayout>
      <AdminMessaging />
    </AdminLayout>
  );
}