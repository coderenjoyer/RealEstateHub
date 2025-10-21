"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import { MessengerDropdown } from "./messenger-dropdown";
import { NotificationDropdown } from "./notification";
import { useNavigate } from "react-router-dom";

export function TopNav() {
  const [activeTab, setActiveTab] = useState("Buy");
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-5 bg-gradient-to-br from-sky-300/95 via-blue-200/95 to-blue-300/95 backdrop-blur-md border-b border-white/20">
      {/* Left Side - Navigation Tabs */}
      <div className="flex items-center">
        <div className="flex items-center gap-1 lg:gap-2 bg-white/20 backdrop-blur-sm rounded-full px-2 lg:px-3 py-1 lg:py-1.5 border border-white/30">
          <Button
            variant={activeTab === "Buy" ? "default" : "ghost"}
            onClick={() => setActiveTab("Buy")}
            className={`px-4 lg:px-8 py-2 lg:py-2.5 rounded-full font-medium text-xs lg:text-sm transition-all ${
              activeTab === "Buy"
                ? "bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/30"
                : "bg-transparent hover:bg-white/20 text-white/90 hover:text-white"
            }`}
          >
            Buy
          </Button>
          <Button
            variant={activeTab === "Rent" ? "default" : "ghost"}
            onClick={() => setActiveTab("Rent")}
            className={`px-4 lg:px-8 py-2 lg:py-2.5 rounded-full font-medium text-xs lg:text-sm transition-all ${
              activeTab === "Rent"
                ? "bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/30"
                : "bg-transparent hover:bg-white/20 text-white/90 hover:text-white"
            }`}
          >
            Rent
          </Button>
          <Button
            variant={activeTab === "Favorites" ? "default" : "ghost"}
            onClick={() => setActiveTab("Favorites")}
            className={`px-4 lg:px-8 py-2 lg:py-2.5 rounded-full font-medium text-xs lg:text-sm transition-all ${
              activeTab === "Favorites"
                ? "bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/30"
                : "bg-transparent hover:bg-white/20 text-white/90 hover:text-white"
            }`}
          >
            Favorites
          </Button>
        </div>
      </div>

      {/* Right Side - Action Buttons & Profile */}
      <div className="flex items-center gap-2 lg:gap-3">
        <MessengerDropdown />
        <NotificationDropdown />

        {/* User Profile */}
        <div 
          className="flex items-center gap-2 lg:gap-3 ml-1 lg:ml-2 bg-sky-500/20 backdrop-blur-sm rounded-full pl-3 lg:pl-4 pr-1 lg:pr-2 py-1.5 lg:py-2 cursor-pointer hover:bg-sky-500/30 transition-all duration-200"
          onClick={() => navigate("/user/profile")}
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
