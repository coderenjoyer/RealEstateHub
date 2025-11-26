"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AgentCommunicationLayout } from "@/components/layouts/AgentCommunicationLayout";
import { MessagesSidebar } from "./MessagesSidebar";
import { ChatWindow } from "./ChatWindow";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/AuthContext";
import { useFeatureStatus } from "@/hooks/useFeatureStatus";
import MessagingDisabledModal from "@/components/ui/messaging-disabled-modal";
import supabase from "@/supabaseClient";
import type { Conversation, Message } from "./types";

export default function ChatPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { messagingEnabled } = useFeatureStatus();
  const {
    conversations: dbConversations,
    messages: dbMessages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    deleteMessage,
    removeConversationFromState,
    subscribeToConversation,
  } = useChat();

  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatView, setShowChatView] = useState(false);

  // Convert database conversations to component format
  const conversations: Conversation[] = dbConversations.map((conv) => ({
    id: conv.id.toString(),
    name: conv.other_participant_name || "Unknown User",
    lastMessage: conv.last_message || "No messages yet",
    avatar: conv.other_participant_avatar || "",
    unread: (conv.unread_count || 0) > 0,
    time: new Date(conv.last_message_at).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  }));

  // Get current conversation data
  const selectedConversation = selectedConversationId
    ? conversations.find((c) => c.id === selectedConversationId?.toString())
    : null;
  const currentDbMessages = selectedConversationId
    ? dbMessages[selectedConversationId] || []
    : [];

  // Convert database messages to component format
  const messages: Message[] = currentDbMessages.map((msg) => ({
    id: msg.id.toString(),
    conversationId: msg.conversation_id.toString(),
    sender: msg.sender_id === session?.user?.id ? "user" : "other",
    text: msg.message_text,
    timestamp: new Date(msg.created_at).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    avatar:
      msg.sender_id === session?.user?.id
        ? ""
        : selectedConversation?.avatar || "",
  }));

  // Check for mobile view on mount and resize
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768); // Tailwind's md breakpoint
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);

    return () => {
      window.removeEventListener("resize", checkMobileView);
    };
  }, []);

  const handleSendMessage = async () => {
    if (
      !messageInput.trim() ||
      !selectedConversationId ||
      !selectedConversation
    ) {
      return;
    }

    // Get the other participant's ID from the conversation
    const dbConv = dbConversations.find((c) => c.id === selectedConversationId);
    const receiverId = dbConv?.other_participant_id;

    if (!receiverId) {
      console.error("Cannot find receiver ID");
      return;
    }

    try {
      setSendingMessage(true);
      await sendMessage(
        selectedConversationId,
        receiverId,
        messageInput.trim()
      );
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(parseInt(messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    const convId = parseInt(conversation.id);
    setSelectedConversationId(convId);

    // For mobile, show the chat view when a conversation is selected
    if (isMobileView) {
      setShowChatView(true);
    }
  };

  const handleBackToConversations = () => {
    setShowChatView(false);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const convId = parseInt(conversationId);

      // Remove from local state immediately
      removeConversationFromState(convId);

      // Reset selected conversation immediately if it was the deleted one
      if (selectedConversationId === convId) {
        setSelectedConversationId(null);
      }

      // Delete all messages in this conversation first
      const { error: messagesError } = await supabase
        .from("messages")
        .delete()
        .eq("conversation_id", convId);

      if (messagesError) {
        console.error("Error deleting messages:", messagesError);
        throw messagesError;
      }

      // Then delete the conversation
      const { error: conversationError } = await supabase
        .from("conversations")
        .delete()
        .eq("id", convId);

      if (conversationError) {
        console.error("Error deleting conversation:", conversationError);
        throw conversationError;
      }

      console.log("Conversation deleted successfully:", convId);
    } catch (error) {
      console.error("Error deleting conversation:", error);
      // Re-fetch to ensure UI is in sync with database
      fetchConversations();
    }
  };

  // Fetch messages and subscribe when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
      const unsubscribe = subscribeToConversation(selectedConversationId);
      return unsubscribe;
    }
  }, [selectedConversationId, fetchMessages, subscribeToConversation]);

  // Handle case when selected conversation is deleted
  useEffect(() => {
    if (
      selectedConversationId &&
      !selectedConversation &&
      conversations.length > 0
    ) {
      // If we had a selected conversation but it's no longer in the list, select the first one
      setSelectedConversationId(parseInt(conversations[0].id));
    } else if (
      selectedConversationId &&
      !selectedConversation &&
      conversations.length === 0
    ) {
      // If we had a selected conversation but all conversations are gone, clear selection
      setSelectedConversationId(null);
    }
  }, [selectedConversationId, selectedConversation, conversations]);

  // Handle case when all conversations are deleted
  useEffect(() => {
    if (conversations.length === 0 && selectedConversationId) {
      setSelectedConversationId(null);
    }
  }, [conversations.length, selectedConversationId]);

  // Handle case when conversations list changes
  useEffect(() => {
    // If we have a selected conversation but it's no longer in the list, clear the selection
    if (
      selectedConversationId &&
      !conversations.some((c) => c.id === selectedConversationId.toString())
    ) {
      setSelectedConversationId(null);
    }
  }, [conversations, selectedConversationId]);

  // Redirect to agent profile when messaging is disabled
  useEffect(() => {
    if (!messagingEnabled) {
      const timer = setTimeout(() => {
        navigate("/agent/profile");
      }, 3000); // 3 second delay to show the modal
      return () => clearTimeout(timer);
    }
  }, [messagingEnabled, navigate]);

  // Show messaging disabled modal overlay
  if (!messagingEnabled) {
    return (
      <AgentCommunicationLayout>
        <MessagingDisabledModal open={true} onClose={() => {}} />
      </AgentCommunicationLayout>
    );
  }

  // Show loading state
  if (loading && conversations.length === 0) {
    return (
      <AgentCommunicationLayout>
        <div className="flex h-screen items-center justify-center bg-[#BDD8E9]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        </div>
      </AgentCommunicationLayout>
    );
  }

  // Show empty state
  if (conversations.length === 0) {
    return (
      <AgentCommunicationLayout>
        <div className="flex h-screen items-center justify-center bg-[#BDD8E9]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Conversations Yet
            </h2>
            <p className="text-gray-600">
              When users message you, their conversations will appear here.
            </p>
          </div>
        </div>
      </AgentCommunicationLayout>
    );
  }

  return (
    <AgentCommunicationLayout>
      <div className="flex h-screen bg-[#BDD8E9]">
        <MessagesSidebar
          conversations={conversations}
          selectedConversation={selectedConversation || undefined}
          onSelectConversation={handleSelectConversation}
          isMobileView={isMobileView}
          showChatView={showChatView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {selectedConversation && (
          <ChatWindow
            selectedConversation={selectedConversation}
            messages={messages}
            messageInput={messageInput}
            onMessageInputChange={setMessageInput}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            onDeleteConversation={handleDeleteConversation}
            onBackToConversations={handleBackToConversations}
            isMobileView={isMobileView}
            sendingMessage={sendingMessage}
            participantUserId={dbConversations.find(c => c.id === selectedConversationId)?.other_participant_id}
          />
        )}
      </div>
    </AgentCommunicationLayout>
  );
}
