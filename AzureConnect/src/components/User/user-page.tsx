"use client";
import { useState } from "react";
import { PropertyFilters } from "@/components/User/property-filters";
import { PropertyGrid } from "@/components/User/property-grid";
import { TopNav } from "@/components/User/top-nav";

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-blue-300 flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar - Hidden on mobile (unless toggled), Fixed on desktop */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex-shrink-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <PropertyFilters />
      </div>

      {/* Mobile Sidebar Overlay - Click outside to close */}
      {isSidebarOpen && (
        <div
          className="fixed inset-y-0 right-0 left-0 z-30 bg-black/50 lg:hidden"
          style={{ marginLeft: '320px' }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

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