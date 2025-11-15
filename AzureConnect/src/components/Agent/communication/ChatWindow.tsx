import { useState, useRef, useEffect } from "react";
import { ArrowLeft, MoreVertical, Paperclip, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  Conversation,
  Message,
} from "@/components/Agent/communication/types";

interface ChatWindowProps {
  selectedConversation: Conversation;
  messages: Message[];
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => void;
  onDeleteMessage: (messageId: string) => void;
  onBackToConversations?: () => void;
  isMobileView: boolean;
  sendingMessage?: boolean;
}

export function ChatWindow({
  selectedConversation,
  messages,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  onDeleteMessage,
  onBackToConversations,
  isMobileView,
  sendingMessage = false,
}: ChatWindowProps) {
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Files selected:", files);
      event.target.value = "";
    }
  };

  return (
    <div
      className={`${
        isMobileView && !onBackToConversations ? "hidden" : "flex-1"
      } flex flex-col min-w-[300px] md:min-w-[375px]`}
    >
      {/* Chat Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-sky-200/50 p-4 flex items-center justify-between shadow-sm">
        {/* Back button for mobile */}
        {isMobileView && onBackToConversations && (
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full hover:bg-sky-100 md:hidden mr-2"
            onClick={onBackToConversations}
          >
            <ArrowLeft className="h-5 w-5 text-sky-600" />
          </Button>
        )}

        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              {selectedConversation.name}
            </h3>
            <p className="text-xs text-sky-600 font-medium">Active now</p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-full hover:bg-sky-100"
        >
          <MoreVertical className="h-5 w-5 text-sky-600" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-2 ${
              message.sender === "user" ? "justify-end" : "justify-start"
            } group`}
            onMouseEnter={() => setHoveredMessage(message.id)}
            onMouseLeave={() => setHoveredMessage(null)}
          >
            {message.sender === "other" && (
              <div className="w-8 flex-shrink-0" />
            )}

            <div
              className={`flex items-center gap-2 ${
                message.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-200"
                    : "bg-white text-gray-800 shadow-md border border-sky-100"
                } rounded-2xl p-3 relative transition-all hover:shadow-lg`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p
                    className={`text-xs font-semibold ${
                      message.sender === "user" ? "text-sky-50" : "text-sky-700"
                    }`}
                  >
                    {message.sender === "user" ? "You" : selectedConversation.name}
                  </p>
                  <p
                    className={`text-xs ${
                      message.sender === "user" ? "text-sky-100" : "text-sky-600"
                    } font-medium ml-2`}
                  >
                    {message.timestamp}
                  </p>
                </div>
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>

              {/* Delete Button - shows on hover for user's own messages */}
              {hoveredMessage === message.id && message.sender === "user" && (
                <button
                  className="p-1.5 hover:bg-rose-100 rounded-full transition-all bg-white shadow-md border border-rose-200"
                  onClick={() => onDeleteMessage(message.id)}
                  title="Delete message"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                </button>
              )}
            </div>

            {message.sender === "user" && (
              <div className="w-8 flex-shrink-0" />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white/70 backdrop-blur-xl border-t border-sky-200/50 shadow-lg">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex gap-2 items-center bg-white rounded-full p-2 shadow-md border border-sky-200">
          <Button
            onClick={handleFileUpload}
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full hover:bg-sky-100 text-sky-600"
            title="Attach files"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={messageInput}
            onChange={(e) => onMessageInputChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
            placeholder="Type your message here..."
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
          />
          <Button
            onClick={onSendMessage}
            disabled={!messageInput.trim() || sendingMessage}
            size="icon"
            className="h-9 w-9 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
