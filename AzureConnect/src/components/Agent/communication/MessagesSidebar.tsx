import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Conversation } from "@/components/Agent/communication/types";

interface MessagesSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation;
  onSelectConversation: (conversation: Conversation) => void;
  isMobileView: boolean;
  showChatView: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function MessagesSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  isMobileView,
  showChatView,
  searchQuery,
  onSearchChange,
}: MessagesSidebarProps) {
  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total unread count
  const totalUnreadCount = conversations.filter(c => c.unread).length;

  return (
    <div
      className={`${
        isMobileView && showChatView ? "hidden" : "w-full md:w-80"
      } bg-white/70 backdrop-blur-xl border-r border-sky-200/50 shadow-lg flex flex-col`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-sky-200/50 bg-gradient-to-r from-sky-400/10 to-blue-400/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              Messages
            </h2>
            {totalUnreadCount > 0 && (
              <Badge className="rounded-full h-6 w-6 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-rose-500 to-pink-500 border-0">
                {totalUnreadCount}
              </Badge>
            )}
          </div>
          <Button
            size="icon"
            className="h-9 w-9 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-500" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="pl-10 bg-white/80 border-sky-200 focus:border-sky-400 focus:ring-sky-400/20 rounded-full text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`w-full p-4 flex items-center gap-3 hover:bg-sky-100/50 transition-colors border-b border-sky-100/50 ${
              selectedConversation.id === conversation.id
                ? "bg-gradient-to-r from-sky-100 to-blue-100 border-l-4 border-l-sky-500"
                : ""
            }`}
          >
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-sky-200/50">
                <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-sky-400 to-blue-500 text-white">
                  {conversation.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {conversation.unread && (
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 ring-2 ring-white" />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-gray-800 truncate">
                  {conversation.name}
                </p>
                <span className="text-xs text-sky-600 font-medium">
                  {conversation.time}
                </span>
              </div>
              <p
                className={`text-sm truncate ${
                  conversation.unread
                    ? "text-gray-800 font-medium"
                    : "text-gray-500"
                }`}
              >
                {conversation.lastMessage}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
