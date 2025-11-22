import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Search, MessageCircle } from 'lucide-react';
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
          console.error('Error fetching agents:', agentsError);
        }
        if (usersError) {
          console.error('Error fetching users:', usersError);
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
        console.error('Error fetching recipients:', error);
      }
    };

    fetchRecipients();
  }, []);

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
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

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

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedRecipient || !adminId) return;

    try {
      setSendingMessage(true);
      console.log('Sending message from', adminId, 'to', selectedRecipient.id);
      
      const { data, error } = await supabase
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
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Message sent successfully:', data);
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
      console.error('Error sending message:', error);
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
    <div className="flex h-screen bg-gray-50">
      {/* Recipients Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle size={24} />
            Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedRecipient?.id === recipient.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <p className="font-medium text-gray-900 truncate">{recipient.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    recipient.role === 'agent'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {recipient.role}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{recipient.email}</p>
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
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {selectedRecipient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedRecipient.name}</p>
                  <p className="text-sm text-gray-500">{selectedRecipient.email}</p>
                </div>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${
                selectedRecipient.role === 'agent'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {selectedRecipient.role.charAt(0).toUpperCase() + selectedRecipient.role.slice(1)}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          isAdmin
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="break-words">{msg.message_text}</p>
                        <p className={`text-xs mt-1 ${
                          isAdmin ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendingMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
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