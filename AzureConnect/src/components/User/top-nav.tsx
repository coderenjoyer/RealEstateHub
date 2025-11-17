"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronDown,
  Menu,
  MessageCircle,
  Bell,
  Search,
  MapPin,
  X,
} from "lucide-react";
import { MessengerDropdown } from "./messenger-dropdown";
import { NotificationDropdown } from "./notification";
import { UserProfileDropdown } from "./user-profile-dropdown";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import supabase from "../../supabaseClient";

interface TopNavProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeDropdown: "none" | "chats" | "notifications" | "profile";
  setActiveDropdown: (
    dropdown: "none" | "chats" | "notifications" | "profile"
  ) => void;
  selectedChatId?: number;
  onCloseDropdown?: () => void;
  agentToContact?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export function TopNav({
  isSidebarOpen,
  setIsSidebarOpen,
  activeDropdown,
  setActiveDropdown,
  selectedChatId,
  onCloseDropdown,
  agentToContact,
}: TopNavProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { session } = useAuth();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const userId = session?.user?.id;
      if (!userId) {
        setProfileImageUrl(null);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("profile_image_url")
        .eq("user_id", userId)
        .maybeSingle();
      if (!isMounted) return;
      if (error) {
        console.error("Failed to load profile image:", error);
        setProfileImageUrl(null);
        return;
      }
      setProfileImageUrl(data?.profile_image_url ?? null);
    })();
    return () => { isMounted = false };
  }, [session?.user?.id]);

  const unreadChatsCount = 3;
  const { unreadCount: unreadNotificationsCount } = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const GEOAPIFY_KEY = "72903e1463b146169ffcf808147da823";

  const handleChatsClick = () => {
    if (activeDropdown === "chats") {
      setActiveDropdown("none");
    } else {
      setActiveDropdown("chats");
    }
  };

  const handleNotificationsClick = () => {
    if (activeDropdown === "notifications") {
      setActiveDropdown("none");
    } else {
      setActiveDropdown("notifications");
    }
  };

  const handleProfileClick = () => {
    if (activeDropdown === "profile") {
      setActiveDropdown("none");
    } else {
      setActiveDropdown("profile");
    }
  };

  const handleCloseDropdown = () => {
    setActiveDropdown("none");
    onCloseDropdown?.();
  };

  const handleNavigateToProfile = () => {
    navigate("/user/profile");
    setActiveDropdown("none");
  };

  const handleNavigateToPropertyMaintenance = () => {
    navigate("/user/property-maintenance");
    setActiveDropdown("none");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  // Fetch location suggestions from Geoapify
  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          query
        )}&filter=countrycode:ph&limit=5&apiKey=${GEOAPIFY_KEY}`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (err) {
      console.error("Error fetching Geoapify:", err);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchSuggestions(query);
    setShowSuggestions(true);
  };

  const handleSelectLocation = (place: any) => {
    const name = place.properties.formatted || place.properties.name;
    setSearchQuery(name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-5 bg-gradient-to-br from-sky-300/95 via-blue-200/95 to-blue-300/95 backdrop-blur-md border-b border-white/20">
      {/* Left Side - Hamburger + Location Search */}
      <div className="flex items-center gap-2 lg:gap-3 flex-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 shadow-md"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Location Search Bar */}
        <div
          ref={searchRef}
          className={`relative flex-1 max-w-[200px] sm:max-w-sm md:max-w-md lg:max-w-2xl ${
            isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none z-10">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search location..."
              className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-1.5 sm:py-2 lg:py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg sm:rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all text-xs sm:text-sm lg:text-base"
              onFocus={() => setShowSuggestions(true)}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center hover:bg-white/10 rounded-r-lg sm:rounded-r-xl transition-colors z-10"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white hover:text-white" />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
              {suggestions.map((place) => (
                <button
                  key={place.properties.place_id}
                  onClick={() => handleSelectLocation(place)}
                  className="w-full px-4 py-3 text-left hover:bg-sky-100 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-sky-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {place.properties.name || place.properties.formatted}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {place.properties.formatted}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-2 lg:gap-3 relative">
        {/* Chats Button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={handleChatsClick}
          className={`p-2 lg:p-2.5 bg-sky-500/20 hover:bg-sky-500/30 text-white rounded-xl transition-all duration-200 shadow-md relative ${
            activeDropdown === "chats"
              ? "ring-2 ring-green-400 ring-opacity-50 scale-105"
              : ""
          }`}
        >
          <MessageCircle className="h-4 w-4 lg:h-5 lg:w-5" />
          {unreadChatsCount > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          )}
        </Button>

        {/* Notifications Button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={handleNotificationsClick}
          className={`p-2 lg:p-2.5 bg-sky-500/20 hover:bg-sky-500/30 text-white rounded-xl transition-all duration-200 shadow-md relative ${
            activeDropdown === "notifications"
              ? "ring-2 ring-orange-400 ring-opacity-50 scale-105"
              : ""
          }`}
        >
          <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          )}
        </Button>

        {/* User Profile */}
        <div className="relative">
          <div
            onClick={handleProfileClick}
            className={`flex items-center gap-2 lg:gap-3 ml-1 lg:ml-2 bg-sky-500/20 backdrop-blur-sm rounded-full pl-3 lg:pl-4 pr-1 lg:pr-2 py-1.5 lg:py-2 cursor-pointer hover:bg-sky-500/30 transition-all duration-200 ${
              activeDropdown === "profile"
                ? "ring-2 ring-sky-400 ring-opacity-50 scale-105"
                : ""
            }`}
          >
            {/* Removed hardcoded name/email display */}
            <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
              <AvatarImage src={profileImageUrl || "/def-prof.jpg"} alt="User profile" />
            </Avatar>
            <ChevronDown
              className={`h-3 w-3 lg:h-4 lg:w-4 text-white/80 transition-transform duration-200 ${
                activeDropdown === "profile" ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Profile Dropdown */}
          {activeDropdown === "profile" && (
            <UserProfileDropdown
              onClose={handleCloseDropdown}
              onNavigateToProfile={handleNavigateToProfile}
              onNavigateToPropertyMaintenance={handleNavigateToPropertyMaintenance}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>

      {/* Render dropdowns */}
      {activeDropdown === "chats" && (
        <MessengerDropdown
          onClose={handleCloseDropdown}
          unreadCount={unreadChatsCount}
          initialChatId={selectedChatId}
          agentToContact={agentToContact}
        />
      )}
      {activeDropdown === "notifications" && (
        <NotificationDropdown
          onClose={handleCloseDropdown}
          unreadCount={unreadNotificationsCount}
        />
      )}
    </div>
  );
}
