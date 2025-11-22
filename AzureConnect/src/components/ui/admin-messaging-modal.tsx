import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import supabase from '@/supabaseClient';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message_text: string;
  created_at: string;
}

interface AdminMessagingModalProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  adminId: string; // The admin's user ID
}

const AdminMessagingModal: React.FC<AdminMessagingModalProps> = ({
  open,
  onClose,
  userId,
  adminId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  useEffect(() => {
    if (!open || !userId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('admin_messages')
          .select('*')
          .or(
            `and(sender_id.eq.${userId},recipient_id.eq.${adminId}),and(sender_id.eq.${adminId},recipient_id.eq.${userId})`
          )
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
    const channel = supabase.channel(`messages_${userId}_${adminId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_messages',
          filter: `or(and(sender_id=eq.${userId},recipient_id=eq.${adminId}),and(sender_id=eq.${adminId},recipient_id=eq.${userId}))`,
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
  }, [open, userId, adminId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !userId) return;

    try {
      setSendingMessage(true);

      const { error } = await supabase
        .from('admin_messages')
        .insert([
          {
            sender_id: userId,
            recipient_id: adminId,
            message_text: messageInput.trim(),
          },
        ]);

      if (error) throw error;

      setMessageInput('');

      // Refresh messages
      const { data } = await supabase
        .from('admin_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${userId},recipient_id.eq.${adminId}),and(sender_id.eq.${adminId},recipient_id.eq.${userId})`
        )
        .order('created_at', { ascending: true });

      setMessages(data || []);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (!open) return null;

  const portalContainer = document.getElementById('modal-root') || document.body;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl flex flex-col max-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Report To the Admin</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-center">No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isFromUser = msg.sender_id === userId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      isFromUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="break-words">{msg.message_text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isFromUser ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
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

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || sendingMessage}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    portalContainer
  );
};

export default AdminMessagingModal;
