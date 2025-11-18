import { useState, useEffect, useCallback } from 'react';
import supabase from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  is_read: boolean;
  message_type: 'text' | 'call' | 'image' | 'file';
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at: string;
  created_at: string;
  last_message?: string;
  unread_count?: number;
  // Enhanced fields
  other_participant_id?: string;
  other_participant_name?: string;
  other_participant_avatar?: string;
}

export function useChat() {
  const { session } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [conversationId: number]: Message[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Fetch all conversations for the current user
  const fetchConversations = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1_id.eq.${session.user.id},participant_2_id.eq.${session.user.id}`)
        .order('last_message_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Fetch user metadata for each conversation
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv) => {
          const otherParticipantId =
            conv.participant_1_id === session.user.id
              ? conv.participant_2_id
              : conv.participant_1_id;

          // Get user details - query from profiles or auth metadata
          let participantName = 'Unknown User';
          let otherUser = null;
          
          // Try to get from profiles table first (using user_id column)
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('user_id', otherParticipantId)
            .maybeSingle();
          
          if (profileData) {
            otherUser = profileData;
            const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
            if (fullName) {
              participantName = fullName;
            } else if (profileData.email) {
              participantName = profileData.email.split('@')[0];
            }
          } else {
            console.log('No profile found for user:', otherParticipantId);
            // If profiles table doesn't work, we'll keep it as Unknown User
            // The user ID will still work for messaging
          }
          
          console.log('Other participant ID:', otherParticipantId);
          console.log('Found user profile:', otherUser);
          console.log('Participant name:', participantName);

          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('message_text')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('receiver_id', session.user.id)
            .eq('is_read', false);

          return {
            ...conv,
            other_participant_id: otherParticipantId,
            other_participant_name: participantName,
            other_participant_avatar: null, // TODO: Fetch from storage
            last_message: lastMsg?.message_text,
            unread_count: unreadCount || 0,
          };
        })
      );

      setConversations(conversationsWithDetails);
      
      // Calculate and set total unread count
      const totalUnread = conversationsWithDetails.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
      setTotalUnreadCount(totalUnread);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (conversationId: number) => {
    if (!session?.user?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setMessages((prev) => ({
        ...prev,
        [conversationId]: data || [],
      }));

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', session.user.id)
        .eq('is_read', false);
      
      // Refresh conversations to update unread counts
      await fetchConversations();
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    }
  }, [session?.user?.id, fetchConversations]);

  // Get or create conversation with another user
  const getOrCreateConversation = useCallback(async (otherUserId: string) => {
    if (!session?.user?.id) return null;

    try {
      const { data, error: rpcError } = await supabase.rpc('get_or_create_conversation', {
        user1_id: session.user.id,
        user2_id: otherUserId,
      });

      if (rpcError) throw rpcError;

      // Refresh conversations
      await fetchConversations();

      return data as number;
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      setError(err.message);
      return null;
    }
  }, [session?.user?.id, fetchConversations]);

  // Send a message
  const sendMessage = useCallback(async (
    conversationId: number,
    receiverId: string,
    messageText: string,
    messageType: 'text' | 'call' | 'image' | 'file' = 'text',
    metadata?: any
  ) => {
    if (!session?.user?.id) return null;

    try {
      const { data, error: sendError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: session.user.id,
          receiver_id: receiverId,
          message_text: messageText,
          message_type: messageType,
          metadata: metadata,
        })
        .select()
        .single();

      if (sendError) throw sendError;
      
      // Refresh conversations to update last message
      await fetchConversations();

      return data as Message;
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message);
      return null;
    }
  }, [session?.user?.id, fetchConversations]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId: number) => {
    try {
      // First, find which conversation this message belongs to
      const conversationId = Object.keys(messages).find((convId) =>
        messages[parseInt(convId)]?.some((msg) => msg.id === messageId)
      );

      // Optimistically update the UI immediately
      if (conversationId) {
        setMessages((prev) => ({
          ...prev,
          [conversationId]: prev[parseInt(conversationId)].filter(
            (msg) => msg.id !== messageId
          ),
        }));
      }

      // Then delete from database
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', session?.user?.id);

      if (deleteError) {
        // If delete fails, refetch messages to restore state
        if (conversationId) {
          await fetchMessages(parseInt(conversationId));
        }
        throw deleteError;
      }
      
      // Refresh conversations to update last message
      await fetchConversations();
    } catch (err: any) {
      console.error('Error deleting message:', err);
      setError(err.message);
    }
  }, [session?.user?.id, messages, fetchMessages, fetchConversations]);

  // Remove a conversation from local state immediately
  const removeConversationFromState = useCallback((conversationId: number) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
    // Also remove associated messages
    setMessages((prev) => {
      const newMessages = { ...prev };
      delete newMessages[conversationId];
      return newMessages;
    });
  }, []);

  // Add a function to manually refresh the total unread count
  const refreshTotalUnreadCount = useCallback(() => {
    const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
    setTotalUnreadCount(totalUnread);
  }, [conversations]);

  // Subscribe to real-time updates for a conversation
  const subscribeToConversation = useCallback((conversationId: number) => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Only add message if current user is sender or receiver
          if (newMessage.sender_id === session.user.id || newMessage.receiver_id === session.user.id) {
            console.log('New message received:', payload);
            setMessages((prev) => ({
              ...prev,
              [conversationId]: [...(prev[conversationId] || []), newMessage],
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          
          // Only process update if current user is sender or receiver
          if (updatedMessage.sender_id === session.user.id || updatedMessage.receiver_id === session.user.id) {
            console.log('Message updated:', payload);
            setMessages((prev) => ({
              ...prev,
              [conversationId]: (prev[conversationId] || []).map((msg) =>
                msg.id === updatedMessage.id ? updatedMessage : msg
              ),
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const deletedMessage = payload.old as Message;
          
          // Only process delete if current user is sender or receiver
          if (deletedMessage.sender_id === session.user.id || deletedMessage.receiver_id === session.user.id) {
            console.log('Message deleted:', payload);
            setMessages((prev) => ({
              ...prev,
              [conversationId]: (prev[conversationId] || []).filter(
                (msg) => msg.id !== deletedMessage.id
              ),
            }));
          }
        }
      )
      .subscribe();

    setRealtimeChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [session?.user?.id]);

  // Cleanup real-time subscription
  useEffect(() => {
    return () => {
      if (realtimeChannel) {
        realtimeChannel.unsubscribe();
      }
    };
  }, [realtimeChannel]);

  // Set up real-time subscription for conversations and messages
  useEffect(() => {
    if (!session?.user?.id) return;

    let channel: RealtimeChannel | null = null;

    const setupRealtime = async () => {
      try {
        // Fetch initial data
        await fetchConversations();

        // Subscribe to real-time changes for conversations
        channel = supabase
          .channel('chat-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'conversations',
            },
            (payload) => {
              console.log('New conversation:', payload);
              fetchConversations(); // Refresh all conversations
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
            },
            (payload) => {
              console.log('New message:', payload);
              fetchConversations(); // Refresh all conversations to update unread counts
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'messages',
            },
            (payload) => {
              console.log('Message updated:', payload);
              fetchConversations(); // Refresh all conversations to update unread counts
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'messages',
            },
            (payload) => {
              console.log('Message deleted:', payload);
              fetchConversations(); // Refresh all conversations to update unread counts
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'conversations',
            },
            (payload) => {
              console.log('Conversation deleted:', payload);
              fetchConversations(); // Refresh all conversations
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
  }, [session?.user?.id, fetchConversations]);

  // Fetch conversations on mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchConversations();
    }
  }, [session?.user?.id, fetchConversations]);

  return {
    conversations,
    messages,
    loading,
    error,
    totalUnreadCount,
    fetchConversations,
    fetchMessages,
    getOrCreateConversation,
    sendMessage,
    deleteMessage,
    removeConversationFromState,
    subscribeToConversation,
    refreshTotalUnreadCount, // Add this line
  };
}
