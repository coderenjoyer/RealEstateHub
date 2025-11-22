import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Conversation } from "@/components/Agent/communication/types";

interface MessagesSidebarProps {
  conversations: Conversation[];
  selectedConversation?: Conversation;
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
  const totalUnreadCount = conversations.filter((c) => c.unread).length;

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
            <h2 className="text-xl font-bold text-[#49769F]">
              Messages
            </h2>
            {totalUnreadCount > 0 && (
              <Badge className="rounded-full h-6 w-6 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-rose-500 to-pink-500 border-0">
                {totalUnreadCount}
              </Badge>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#49769F]" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="pl-10 bg-white/80 border-sky-200 focus:border-[#49769F] focus:ring-[#49769F]/20 rounded-full text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-[#49769F]/10 transition-colors border-b border-[#BDD8E9]/50 ${
                selectedConversation &&
                selectedConversation.id === conversation.id
                  ? "bg-[#49769F]/10 border-l-4 border-l-[#49769F]"
                  : ""
              }`}
            >
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-800 truncate">
                    {conversation.name}
                  </p>
                  <span className="text-xs text-[#49769F] font-medium">
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
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p>No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
