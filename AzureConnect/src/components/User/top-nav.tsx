"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, Menu, MessageCircle, Bell } from "lucide-react";
import { MessengerDropdown } from "./messenger-dropdown";
import { NotificationDropdown } from "./notification";
import { UserProfileDropdown } from "./user-profile-dropdown";
import { useNavigate } from "react-router-dom";

interface TopNavProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeDropdown: "none" | "chats" | "notifications" | "profile";
  setActiveDropdown: (dropdown: "none" | "chats" | "notifications" | "profile") => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function TopNav({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  activeDropdown, 
  setActiveDropdown,
  activeTab,
  setActiveTab
}: TopNavProps) {
  const navigate = useNavigate();
  const unreadChatsCount = 3;
  const unreadNotificationsCount = 2;

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
  };

  const handleNavigateToProfile = () => {
    navigate("/user/profile");
    setActiveDropdown("none");
  };

  const handleLogout = () => {
    console.log("Logging out...");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-5 bg-gradient-to-br from-sky-300/95 via-blue-200/95 to-blue-300/95 backdrop-blur-md border-b border-white/20">
      {/* Left Side - Hamburger + Navigation Tabs */}
      <div className="flex items-center gap-2 lg:gap-3">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 shadow-md"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div
          className={`flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/50 shadow-inner transition-opacity duration-300 ${
            isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {["Buy", "Rent", "Favorites"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 lg:px-8 py-2 lg:py-2.5 rounded-full font-medium text-xs lg:text-sm transition-all duration-200 ${
                activeTab === tab
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                  : "bg-transparent text-white/80 hover:bg-[#8ECCFD] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
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
            activeDropdown === "chats" ? "ring-2 ring-green-400 ring-opacity-50 scale-105" : ""
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
            activeDropdown === "notifications" ? "ring-2 ring-orange-400 ring-opacity-50 scale-105" : ""
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
              activeDropdown === "profile" ? "ring-2 ring-sky-400 ring-opacity-50 scale-105" : ""
            }`}
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs lg:text-sm font-semibold text-white leading-tight">
                John Doe
              </p>
              <p className="text-xs text-sky-100">johndoe@gmail.com</p>
            </div>
            <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
              <AvatarFallback className="bg-gradient-to-br from-sky-400 to-sky-600 text-white text-xs lg:text-sm font-semibold shadow-lg">
                JD
              </AvatarFallback>
            </Avatar>
            <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 text-white/80 transition-transform duration-200 ${
              activeDropdown === "profile" ? "rotate-180" : ""
            }`} />
          </div>

          {/* Profile Dropdown */}
          {activeDropdown === "profile" && (
            <UserProfileDropdown
              onClose={handleCloseDropdown}
              onNavigateToProfile={handleNavigateToProfile}
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