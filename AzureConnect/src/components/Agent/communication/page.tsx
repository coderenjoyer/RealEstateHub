"use client";

import { useState, useRef, useEffect } from "react";
import { AgentCommunicationLayout } from "@/components/layouts/AgentCommunicationLayout";
import { MessagesSidebar } from "./MessagesSidebar";
import { ChatWindow } from "./ChatWindow";
import type { Conversation, Message } from "./types";

const conversations: Conversation[] = [
  {
    id: "1",
    name: "Khalil Peque",
    lastMessage:
      "Hey there! I'm interested in the downtown property you listed.",
    avatar: "/cozy-suburban-house.png",
    unread: false,
    time: "2m ago",
  },
  {
    id: "2",
    name: "Jeff Morrison",
    lastMessage: "The inspection report for the Oak Street property is ready.",
    avatar: "/cozy-suburban-house.png",
    unread: true,
    time: "5m ago",
  },
  {
    id: "3",
    name: "Sarah Chen",
    lastMessage: "Thanks for the market analysis. I'll review it tomorrow.",
    avatar: "/cozy-suburban-house.png",
    unread: false,
    time: "1h ago",
  },
];

const allMessages: Message[] = [
  // Khalil's messages
  {
    id: "1-1",
    conversationId: "1",
    sender: "other",
    text: "Hey! How are you doing today? I wanted to check in about the downtown property listing.",
    timestamp: "Thu Dec 3, 5:00 PM",
    avatar: "/cozy-suburban-house.png",
  },
  {
    id: "1-2",
    conversationId: "1",
    sender: "other",
    text: "I've had three interested parties already. The location is really attracting attention!",
    timestamp: "Thu Dec 3, 5:01 PM",
    avatar: "/cozy-suburban-house.png",
  },
  {
    id: "1-3",
    conversationId: "1",
    sender: "user",
    text: "Hi Khalil! I'm doing great, thanks for asking. That's fantastic news about the interest!",
    timestamp: "Thu Dec 3, 5:02 PM",
    avatar: "/diverse-group.png",
  },
  {
    id: "1-4",
    conversationId: "1",
    sender: "user",
    text: "The downtown location is definitely a hot spot right now. I'll prepare the showing materials for this weekend.",
    timestamp: "Thu Dec 3, 5:02 PM",
    avatar: "/diverse-group.png",
  },
  {
    id: "1-5",
    conversationId: "1",
    sender: "other",
    text: "That's wonderful to hear! Keep up the great work. Let me know if you need anything from my end.",
    timestamp: "Thu Dec 3, 5:03 PM",
    avatar: "/cozy-suburban-house.png",
  },
  // Jeff's messages
  {
    id: "2-1",
    conversationId: "2",
    sender: "other",
    text: "Hi! I have the inspection report ready for the Oak Street property.",
    timestamp: "Thu Dec 3, 3:30 PM",
    avatar: "/cozy-suburban-house.png",
  },
  {
    id: "2-2",
    conversationId: "2",
    sender: "other",
    text: "Should I email it to you or would you prefer to pick it up in person?",
    timestamp: "Thu Dec 3, 3:31 PM",
    avatar: "/cozy-suburban-house.png",
  },
  {
    id: "2-3",
    conversationId: "2",
    sender: "user",
    text: "Hey Jeff! Email would be perfect, thanks!",
    timestamp: "Thu Dec 3, 3:45 PM",
    avatar: "/diverse-group.png",
  },
  // Sarah's messages
  {
    id: "3-1",
    conversationId: "3",
    sender: "other",
    text: "Hi there! I received the market analysis you sent over.",
    timestamp: "Thu Dec 3, 2:00 PM",
    avatar: "/cozy-suburban-house.png",
  },
  {
    id: "3-2",
    conversationId: "3",
    sender: "user",
    text: "Great! Let me know if you have any questions about it.",
    timestamp: "Thu Dec 3, 2:15 PM",
    avatar: "/diverse-group.png",
  },
  {
    id: "3-3",
    conversationId: "3",
    sender: "other",
    text: "Thanks for the market analysis. I'll review it and get back to you by tomorrow.",
    timestamp: "Thu Dec 3, 2:20 PM",
    avatar: "/cozy-suburban-house.png",
  },
];

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState(
    conversations[0]
  );
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>(
    allMessages.filter((msg) => msg.conversationId === conversations[0].id)
  );
  const [isMobileView, setIsMobileView] = useState(false); // For mobile responsiveness
  const [showChatView, setShowChatView] = useState(false); // For mobile toggle between list and chat

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

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        conversationId: selectedConversation.id,
        sender: "user",
        text: messageInput,
        timestamp: new Date().toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        avatar: "/diverse-group.png",
      };
      setMessages((prev) => [...prev, newMessage]);
      setMessageInput("");
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Filter messages for the selected conversation
    const conversationMessages = allMessages.filter(
      (msg) => msg.conversationId === conversation.id
    );
    setMessages(conversationMessages);

    // For mobile, show the chat view when a conversation is selected
    if (isMobileView) {
      setShowChatView(true);
    }
  };

  const handleBackToConversations = () => {
    setShowChatView(false);
  };

  return (
    <AgentCommunicationLayout>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
        <MessagesSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          isMobileView={isMobileView}
          showChatView={showChatView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <ChatWindow
          selectedConversation={selectedConversation}
          messages={messages}
          messageInput={messageInput}
          onMessageInputChange={setMessageInput}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          onBackToConversations={handleBackToConversations}
          isMobileView={isMobileView}
        />
      </div>
    </AgentCommunicationLayout>
  );
}
