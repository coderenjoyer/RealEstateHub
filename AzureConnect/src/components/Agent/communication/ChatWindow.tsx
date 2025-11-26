import { useState, useRef, useEffect } from "react";
import { ArrowLeft, MoreVertical, Send, Trash2, User, FileText, Home, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import supabase from "@/supabaseClient";
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
  onDeleteConversation?: (conversationId: string) => void;
  onBackToConversations?: () => void;
  isMobileView: boolean;
  sendingMessage?: boolean;
  participantUserId?: string;
}

export function ChatWindow({
  selectedConversation,
  messages,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  onDeleteMessage,
  onDeleteConversation,
  onBackToConversations,
  isMobileView,
  sendingMessage = false,
  participantUserId,
}: ChatWindowProps) {
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(
    null
  );
  const [deleteConversationConfirmation, setDeleteConversationConfirmation] =
    useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(event.target as Node)
      ) {
        setShowOptionsMenu(false);
      }
    };

    if (showOptionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showOptionsMenu]);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      
      if (!participantUserId) {
        setLoadingProfile(false);
        return;
      }
      
      // Fetch the participant's profile using their user ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, bio, property_type, preferred_location, budget_range, investment_goal, current_location, profile_image_url')
        .eq('user_id', participantUserId)
        .single();

      if (profileError) {
        setLoadingProfile(false);
        return;
      }
      
      if (profileData) {
        setUserProfile(profileData);
        
        // Set avatar from profile_image_url
        if (profileData.profile_image_url) {
          setUserAvatar(profileData.profile_image_url);
        }
      }
    } catch (error) {
      // Error fetching profile - continue without crashing
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleViewProfile = async () => {
    await fetchUserProfile();
    setShowUserProfile(true);
    setShowOptionsMenu(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Files selected:", files);
      event.target.value = "";
    }
  };

  const confirmDelete = (messageId: string) => {
    setDeleteConfirmation(messageId);
  };

  const handleDeleteConversation = () => {
    setDeleteConversationConfirmation(true);
    setShowOptionsMenu(false);
  };

  const confirmDeleteConversation = () => {
    if (onDeleteConversation) {
      onDeleteConversation(selectedConversation.id);
      setDeleteConversationConfirmation(false);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    onDeleteMessage(messageId);
    setDeleteConfirmation(null);
    setHoveredMessage(null);
  };

  return (
    <div
      className={`${
        isMobileView && !onBackToConversations ? "hidden" : "flex-1"
      } flex flex-col min-w-[300px] md:min-w-[375px] relative`}
    >
      {/* Delete Message Confirmation Modal */}
      {deleteConfirmation && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-auto border border-gray-100 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6 sm:h-7 sm:w-7 text-red-500" />
              </div>
              <h3
                className="text-xl sm:text-2xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Delete Message?
              </h3>
              <p
                className="text-sm sm:text-base text-gray-600"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                This action cannot be undone. Are you sure you want to delete
                this message?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 px-5 py-3 text-sm sm:text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMessage(deleteConfirmation)}
                className="flex-1 px-5 py-3 text-sm sm:text-base font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/30"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Conversation Confirmation Modal */}
      {deleteConversationConfirmation && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-auto border border-gray-100 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6 sm:h-7 sm:w-7 text-red-500" />
              </div>
              <h3
                className="text-xl sm:text-2xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Delete Conversation?
              </h3>
              <p
                className="text-sm sm:text-base text-gray-600"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                This will permanently delete your conversation with{" "}
                <span className="font-semibold text-gray-900">
                  {selectedConversation.name}
                </span>{" "}
                and all messages. This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
              <button
                onClick={() => setDeleteConversationConfirmation(false)}
                className="flex-1 px-5 py-3 text-sm sm:text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteConversation}
                className="flex-1 px-5 py-3 text-sm sm:text-base font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/30"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Delete Conversation
              </button>
            </div>
          </div>
        </div>
      )}
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
          </div>
        </div>
        <div className="relative" ref={optionsMenuRef}>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full hover:bg-[#49769F]/10"
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
          >
            <MoreVertical className="h-5 w-5 text-[#49769F]" />
          </Button>

          {/* Options Dropdown Menu */}
          {showOptionsMenu && (
            <div className="absolute right-0 top-12 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px] z-50 animate-in fade-in-0 zoom-in-95 duration-150">
              <button
                onClick={handleViewProfile}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#49769F] hover:bg-[#49769F]/10 transition-colors flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                View Profile
              </button>
              {onDeleteConversation && (
                <button
                  onClick={handleDeleteConversation}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#49769F] hover:bg-[#49769F]/10 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Conversation
                </button>
              )}
            </div>
          )}
        </div>
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
                    ? "bg-[#49769F] text-white shadow-lg shadow-[#49769F]/30"
                    : "bg-white text-gray-800 shadow-md border border-[#BDD8E9]"
                } rounded-2xl p-3 relative transition-all hover:shadow-lg`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p
                    className={`text-xs font-semibold ${
                      message.sender === "user" ? "text-[#F0FFFF]" : "text-[#49769F]"
                    }`}
                  >
                    {message.sender === "user"
                      ? "You"
                      : selectedConversation.name}
                  </p>
                  <p
                    className={`text-xs ${
                      message.sender === "user"
                        ? "text-[#F0FFFF]"
                        : "text-[#49769F]"
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
                  onClick={() => confirmDelete(message.id)}
                  title="Delete message"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                </button>
              )}
            </div>

            {message.sender === "user" && <div className="w-8 flex-shrink-0" />}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white/70 backdrop-blur-xl border-t border-[#BDD8E9]/50 shadow-lg">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex gap-2 items-center bg-white rounded-full p-2 shadow-md border border-[#BDD8E9]">
          <Input
            value={messageInput}
            onChange={(e) => onMessageInputChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
            placeholder="Type your message here..."
            className="flex-1 border-0 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49769F] focus-visible:ring-offset-0 placeholder:text-gray-400 rounded-full focus-visible:rounded-full"
          />
          <Button
            onClick={onSendMessage}
            disabled={!messageInput.trim() || sendingMessage}
            size="sm"
            className="rounded-full bg-[#49769F] hover:bg-[#3a5d7f] text-white p-2 h-8 w-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* User Profile Modal */}
      {showUserProfile && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowUserProfile(false)}
        >
          <Card
            className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#49769F] to-[#0A4174] text-white px-6 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* User Avatar */}
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-base overflow-hidden border-2 border-white/30 flex-shrink-0">
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt={selectedConversation.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.textContent = selectedConversation.name.substring(0, 2).toUpperCase();
                      }}
                    />
                  ) : (
                    selectedConversation.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <h2 className="text-2xl font-bold">{selectedConversation.name}</h2>
              </div>
              <button
                onClick={() => setShowUserProfile(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            {loadingProfile ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">Loading profile...</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* About Me Section */}
                {userProfile?.bio && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="h-5 w-5 text-[#49769F]" />
                      <h3 className="font-semibold text-gray-900">About Me</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line ml-8">
                      {userProfile.bio}
                    </p>
                  </div>
                )}

                {/* Property Preferences Section */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Home className="h-5 w-5 text-[#49769F]" />
                    <h3 className="font-semibold text-gray-900">Property Preferences</h3>
                  </div>
                  <div className="space-y-3 ml-8">
                    {userProfile?.property_type && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Property Type</p>
                        <p className="text-sm text-gray-900">{userProfile.property_type}</p>
                      </div>
                    )}
                    {userProfile?.preferred_location && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Preferred Location</p>
                        <p className="text-sm text-gray-900">{userProfile.preferred_location}</p>
                      </div>
                    )}
                    {userProfile?.budget_range && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Budget Range</p>
                        <p className="text-sm text-gray-900">{userProfile.budget_range}</p>
                      </div>
                    )}
                    {userProfile?.investment_goal && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Investment Goal</p>
                        <p className="text-sm text-gray-900">{userProfile.investment_goal}</p>
                      </div>
                    )}
                    {userProfile?.current_location && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Current Location</p>
                        <p className="text-sm text-gray-900">{userProfile.current_location}</p>
                      </div>
                    )}
                    {!userProfile?.property_type && !userProfile?.preferred_location && !userProfile?.budget_range && !userProfile?.investment_goal && !userProfile?.current_location && (
                      <p className="text-gray-500 text-sm">No preferences set</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
