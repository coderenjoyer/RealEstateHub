"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, Menu } from "lucide-react";
import { MessengerDropdown } from "./messenger-dropdown";
import { NotificationDropdown } from "./notification";
import { useNavigate } from "react-router-dom";

interface TopNavProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export function TopNav({ isSidebarOpen, setIsSidebarOpen }: TopNavProps) {
  const [activeTab, setActiveTab] = useState("Buy");
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-5 bg-gradient-to-br from-sky-300/95 via-blue-200/95 to-blue-300/95 backdrop-blur-md border-b border-white/20">
      {/* Left Side - Hamburger + Navigation Tabs */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Hamburger Menu - Only visible on mobile/tablet */}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 shadow-md"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Navigation Tabs */}
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
      <div className="flex items-center gap-2 lg:gap-3">
        <MessengerDropdown />
        <NotificationDropdown />

        {/* Fallback Bell icon if NotificationDropdown not rendered */}
        {/* <Button
          size="icon"
          variant="ghost"
          className="p-2 lg:p-2.5 bg-sky-500/90 hover:bg-sky-600 text-white rounded-xl transition-all shadow-md"
        >
          <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
        </Button> */}

        {/* User Profile */}
        <div
          onClick={() => navigate("/user/profile")}
          className="flex items-center gap-2 lg:gap-3 ml-1 lg:ml-2 bg-sky-500/20 backdrop-blur-sm rounded-full pl-3 lg:pl-4 pr-1 lg:pr-2 py-1.5 lg:py-2 cursor-pointer hover:bg-sky-500/30 transition-all duration-200"
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
          <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4 text-white/80" />
        </div>
      </div>
    </div>
  );
}
