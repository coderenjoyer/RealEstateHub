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
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    }
  }, [session?.user?.id]);

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

      return data as Message;
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message);
      return null;
    }
  }, [session?.user?.id]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', session?.user?.id);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.error('Error deleting message:', err);
      setError(err.message);
    }
  }, [session?.user?.id]);

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
    fetchConversations,
    fetchMessages,
    getOrCreateConversation,
    sendMessage,
    deleteMessage,
    subscribeToConversation,
  };
}
