"use client";
import { useState } from "react";
import { PropertyFilters, FilterState } from "@/components/User/property-filters";
import { PropertyGrid } from "@/components/User/property-grid";
import { TopNav } from "@/components/User/top-nav";

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<
    "none" | "chats" | "notifications" | "profile"
  >("none");
  const [activeTab, setActiveTab] = useState("Buy");
  const [selectedChatId, setSelectedChatId] = useState<number | undefined>(
    undefined
  );
  const [filters, setFilters] = useState<FilterState>({
    selectedTypes: [],
    selectedAmenities: [],
    priceRange: [0, 999999999], // Wide range to show all properties initially
    listingType: null, // Don't filter by type initially
  });

  const handleFilterChange = (newFilters: FilterState) => {
    console.log('Filter changed:', newFilters); // Debug log
    setFilters(newFilters);
  };

  const handleContactAgent = (agentId: number, agentName: string) => {
    // Map agent names to chat IDs for demonstration
    // In a real app, you would use agentId to fetch the correct chat
    const agentToChatMap: { [key: string]: number } = {
      "Sarah Johnson": 1,
      "Michael Rodriguez": 5,
      "Property Investment Group": 2,
    };

    // Use agentId as fallback if name mapping fails
    const chatId = agentToChatMap[agentName] || agentId || 1;
    setSelectedChatId(chatId);
    setActiveDropdown("chats");
  };

  const handleCloseDropdown = () => {
    setActiveDropdown("none");
    setSelectedChatId(undefined);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-blue-300 flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar with smooth animations */}
      <PropertyFilters
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onFilterChange={handleFilterChange}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <TopNav
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            selectedChatId={selectedChatId}
            onCloseDropdown={handleCloseDropdown}
          />
        </div>

        {/* Scrollable Property Grid */}
        <div className="flex-1 px-4 lg:px-8 pb-8 overflow-hidden">
          <PropertyGrid
            activeTab={activeTab}
            filters={filters}
            onContactAgent={handleContactAgent}
          />
        </div>
      </div>
    </div>
  );
}
