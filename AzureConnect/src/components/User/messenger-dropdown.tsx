import { useState, useRef, useEffect } from "react";
import { Search, X, Phone, Minus, Send, } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/AuthContext";
import { useFeatureStatus } from "@/hooks/useFeatureStatus";
import MessagingDisabledModal from "@/components/ui/messaging-disabled-modal";
import supabase from "@/supabaseClient";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

interface MessengerDropdownProps {
  onClose: () => void;
  unreadCount: number;
  initialChatId?: number;
  agentToContact?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export function MessengerDropdown({
  onClose,
  unreadCount,
  initialChatId,
  agentToContact,
}: MessengerDropdownProps) {
  const { session } = useAuth();
  const { messagingEnabled } = useFeatureStatus();
  const {
    conversations: dbConversations,
    messages: dbMessages,
    fetchMessages,
    fetchConversations, // Add this
    getOrCreateConversation,
    sendMessage,
    subscribeToConversation,
  } = useChat();

  const [isOpen, setIsOpen] = useState(true);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current conversation data
  const selectedConversation = dbConversations.find(
    (c) => c.id === selectedChat
  );
  const currentMessages = selectedChat ? dbMessages[selectedChat] || [] : [];

  // Get other participant info for selected conversation
  const otherParticipant = selectedConversation
    ? {
        id: selectedConversation.other_participant_id || "",
        name: selectedConversation.other_participant_name || "Unknown",
        avatar: selectedConversation.other_participant_avatar,
      }
    : null;

  // Filter conversations based on active filter
  const filteredConversations = dbConversations.filter((conv) => {
    if (activeFilter === "unread") {
      return (conv.unread_count || 0) > 0;
    }
    return true;
  });

  // Add effect to subscribe to real-time conversation updates
  useEffect(() => {
    // Subscribe to real-time conversation updates
    const channel: RealtimeChannel = supabase
      .channel("messenger-dropdown-conversations")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log("New conversation in dropdown:", payload);
          fetchConversations();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log("New message in dropdown:", payload);
          fetchConversations();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log("Message updated in dropdown:", payload);
          fetchConversations();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log("Message deleted in dropdown:", payload);
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConversations]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Files selected:", files);
    }
  };

  const handleSendMessage = async () => {
    if (
      !messageInput.trim() ||
      !selectedChat ||
      !otherParticipant?.id ||
      !session?.user?.id
    ) {
      return;
    }

    try {
      setSendingMessage(true);
      await sendMessage(selectedChat, otherParticipant.id, messageInput.trim());
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle agent contact - create or open conversation with agent
  useEffect(() => {
    const handleAgentContact = async () => {
      if (agentToContact && session?.user?.id) {
        // Get or create conversation with agent
        const conversationId = await getOrCreateConversation(agentToContact.id);
        if (conversationId) {
          setSelectedChat(conversationId);
        }
      } else if (initialChatId) {
        setSelectedChat(initialChatId);
      }
    };

    handleAgentContact();
  }, [
    initialChatId,
    agentToContact,
    session?.user?.id,
    getOrCreateConversation,
  ]);

  // ✅ FIXED: Use setIsOpen
  useEffect(() => {
    if (!isOpen) {
      // Refresh conversations when dropdown is closed
      // Add a small delay to ensure read operations complete
      setTimeout(() => {
        fetchConversations();
      }, 500);
      onClose();
    }
  }, [isOpen, onClose, fetchConversations]);

  // Fetch messages and subscribe to realtime updates when conversation is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
      const unsubscribe = subscribeToConversation(selectedChat);
      return unsubscribe;
    }
  }, [selectedChat, fetchMessages, subscribeToConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't close if clicking on the trigger button
      if (target.closest('[data-dropdown-trigger="chats"]')) {
        return;
      }
      if (!target.closest(".messenger-dropdown-container")) {
        setIsOpen(false); // This will trigger the useEffect above
        // Remove onClose() from here since it's now in the useEffect
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false); // This will trigger the useEffect above
        // Remove onClose() from here since it's now in the useEffect
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  // ✅ FIXED: Use isOpen in render
  if (!isOpen) return null;

  // Show messaging disabled modal overlay
  if (!messagingEnabled) {
    return (
      <div className="fixed inset-0 z-[9999]">
        <MessagingDisabledModal open={true} onClose={() => {}} />
      </div>
    );
  }

 
  return (
    <div className="messenger-dropdown-container fixed right-20 top-20 w-[380px] max-h-[70vh] z-50 flex flex-col animate-in fade-in-0 zoom-in-95 duration-150">
      {/* Chat List Dropdown */}
      {!selectedChat && (
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[70vh]">
          {/* Header - ✅ USE unreadCount */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                {/* ✅ USE unreadCount - Show dot */}
                {unreadCount > 0 && (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setIsOpen(false)} // ✅ USE setIsOpen
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Messages"
                className="w-full pl-10 pr-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#49769F]"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-gray-200">
            <button
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                activeFilter === "all"
                  ? "text-[#49769F] bg-[#49769F]/10"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setActiveFilter("all")}
            >
              All
            </button>
            <button
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                activeFilter === "unread"
                  ? "text-[#49769F] bg-[#49769F]/10"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setActiveFilter("unread")}
            >
              Unread
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-lg font-medium">
                  {activeFilter === "unread"
                    ? "No unread messages"
                    : "No conversations"}
                </p>
                <p className="text-sm">
                  {activeFilter === "unread"
                    ? "You're all caught up!"
                    : "Start a conversation"}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center gap-2.5 p-2.5 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                  onClick={() => setSelectedChat(conv.id)}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-[#49769F] flex items-center justify-center text-white font-semibold text-base">
                      {conv.other_participant_name
                        ?.substring(0, 2)
                        .toUpperCase() || "??"}
                    </div>
                    {/* Always show as online for now - can be enhanced later */}
                    <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {conv.other_participant_name || "Unknown User"}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {new Date(conv.last_message_at).toLocaleTimeString(
                          "en-US",
                          { hour: "numeric", minute: "2-digit", hour12: true }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm truncate ${
                          (conv.unread_count || 0) > 0
                            ? "font-semibold text-gray-900"
                            : "text-gray-600"
                        }`}
                      >
                        {conv.last_message || "No messages yet"}
                      </p>
                      {(conv.unread_count || 0) > 0 && (
                        <div className="h-2.5 w-2.5 bg-[#49769F] rounded-full flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
        </div>
      )}

      {/* Chat Window */}
      {selectedChat && selectedConversation && (
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 flex flex-col h-[70vh] w-[380px]">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Chat Header */}
          <div className="bg-[#49769F] p-3 flex items-center justify-between shadow-md border-b border-white/20">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-[#49769F] font-semibold text-xs shadow-inner">
                  {otherParticipant?.name?.substring(0, 2).toUpperCase() ||
                    "??"}
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm truncate tracking-wide">
                  {otherParticipant?.name || "Unknown User"}
                </h3>
                <p className="text-xs text-white/80">Active now</p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                className="p-1 hover:bg-white/20 rounded-full transition-all duration-200"
                onClick={handleCloseChat}
              >
                <Minus className="h-4 w-4 text-white" />
              </button>
              <button
                className="p-1 hover:bg-white/20 rounded-full transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2 bg-white min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {currentMessages.map((msg) => {
              const isSender = msg.sender_id === session?.user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${
                    isSender ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isSender && (
                    <div className="h-6 w-6 rounded-full bg-[#49769F] flex items-center justify-center text-white font-semibold text-[10px] mr-2 flex-shrink-0">
                      {otherParticipant?.name?.substring(0, 2).toUpperCase() ||
                        "??"}
                    </div>
                  )}
                  <div
                    className={`max-w-[65%] ${
                      isSender ? "items-end" : "items-start"
                    } flex flex-col gap-1`}
                  >
                    {msg.message_type === "call" ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gray-100 transition-colors">
                        <div className="p-1 bg-red-100 rounded-full">
                          <Phone className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {msg.message_text}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(msg.created_at).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`px-3 py-1.5 rounded-2xl transition-colors relative break-words ${
                          isSender
                            ? "bg-[#49769F] text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm break-words">
                          {msg.message_text}
                        </p>
                      </div>
                    )}
                    <span className="text-xs text-gray-500 px-1">
                      {new Date(msg.created_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-2 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Aa"
                disabled={sendingMessage}
                className="flex-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#49769F]"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sendingMessage}
                className="p-1 bg-[#49769F] hover:bg-[#49769F]/90 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
