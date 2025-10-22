"use client";
import { useState } from "react";
import { PropertyFilters } from "@/components/User/property-filters";
import { PropertyGrid } from "@/components/User/property-grid";
import { TopNav } from "@/components/User/top-nav";

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-blue-300 flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar with smooth animations - now controlled by PropertyFilters internally */}
      <PropertyFilters 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navigation with Hamburger - Absolutely positioned */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <TopNav 
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        </div>

        {/* Scrollable Property Grid */}
        <div className="flex-1 px-4 lg:px-8 pb-8 overflow-hidden">
          <PropertyGrid />
        </div>
      </div>
    </div>
  );
}