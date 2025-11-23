"use client";
import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import supabase from "@/supabaseClient";
import { useAuth } from "@/AuthContext";
import AzureRealEstateLoader from "@/components/ui/loadingscreen";
import {
  PropertyFilters,
  FilterState,
} from "@/components/User/property-filters";
import { PropertyGrid } from "@/components/User/property-grid";
import { TopNav } from "@/components/User/top-nav";

export default function HomePage() {
  const { session } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<
    "none" | "chats" | "notifications" | "profile"
  >("none");
  const [activeTab, setActiveTab] = useState("Buy");
  const [selectedChatId, setSelectedChatId] = useState<number | undefined>(
    undefined
  );
  const [agentToContact, setAgentToContact] = useState<
    | {
        id: string;
        name: string;
        avatar: string | null;
      }
    | undefined
  >(undefined);
  const [filters, setFilters] = useState<FilterState>({
    selectedTypes: [],
    selectedAmenities: [],
    priceRange: [0, 999999999],
    listingType: "sale",
  });
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [isCheckingProperties, setIsCheckingProperties] = useState(true);
  const [hasRentalProperty, setHasRentalProperty] = useState(false);
  const [shouldSkipRedirect, setShouldSkipRedirect] = useState(false);

  // Check if user intentionally navigated to this page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("view") === "listings") {
      setShouldSkipRedirect(true);
    }
  }, [location]);

  // Check if user has at least one rental property
  useEffect(() => {
    const checkForRentalProperties = async () => {
      if (!session?.user?.id) {
        setIsCheckingProperties(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("property_ownerships_with_properties")
          .select("id")
          .eq("owner_id", session.user.id)
          .limit(1);

        if (error) {
          console.error("Error checking rental properties:", error);
          setIsCheckingProperties(false);
          return;
        }

        setHasRentalProperty(data && data.length > 0);
        setIsCheckingProperties(false);
      } catch (error) {
        console.error("Exception checking rental properties:", error);
        setIsCheckingProperties(false);
      }
    };

    checkForRentalProperties();
  }, [session?.user?.id]);

  // If user has rental properties and didn't intentionally navigate here, redirect to maintenance page
  if (!isCheckingProperties && hasRentalProperty && !shouldSkipRedirect) {
    return <Navigate to="/user/property-maintenance" replace />;
  }

  // Show loader while checking properties
  if (isCheckingProperties) {
    return <AzureRealEstateLoader />;
  }

  const handleFilterChange = (newFilters: FilterState) => {
    console.log("Filter changed:", newFilters); // Debug log
    setFilters(newFilters);
  };

  const handleLocationSearch = (location: string) => {
    setSearchLocation(location);
  };

  const handleContactAgent = (
    agentId: string,
    agentName: string,
    agentAvatar?: string | null
  ) => {
    // Set agent to contact
    setAgentToContact({
      id: agentId,
      name: agentName,
      avatar: agentAvatar || null,
    });
    // Open messenger dropdown
    setActiveDropdown("chats");
  };

  // ... existing code ...
  const handleCloseDropdown = () => {
    setActiveDropdown("none");
    setSelectedChatId(undefined);
    setAgentToContact(undefined);
  };


  return (
    <div className="h-screen bg-[#BDD8E9] flex flex-col lg:flex-row overflow-hidden">
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
            agentToContact={agentToContact}
            onSearch={handleLocationSearch} // Pass the search handler
          />
        </div>

        {/* Scrollable Property Grid */}
        <div className="flex-1 px-4 lg:px-8 pb-8 overflow-hidden">
          <PropertyGrid
            activeTab={activeTab}
            filters={filters}
            onContactAgent={handleContactAgent}
            searchLocation={searchLocation} // Pass the search location to property grid
          />
        </div>
      </div>
    </div>
  );
}