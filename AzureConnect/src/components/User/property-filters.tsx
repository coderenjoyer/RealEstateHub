"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Home,
  Sparkles,
  X,
  Heart,
  ShoppingCart,
  Key,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { Slider } from "@mui/material";
import supabase from "@/supabaseClient";

export interface FilterState {
  selectedTypes: string[];
  selectedAmenities: string[];
  priceRange: number[];
  listingType: "rent" | "sale" | null;
}

interface PropertyFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onFilterChange: (filters: FilterState) => void;
}

export function PropertyFilters({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onFilterChange,
}: PropertyFiltersProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [priceRange, setPriceRange] = useState<number[]>([15000, 55000]);
  const [showSlider, setShowSlider] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch unique property types and amenities from database
  useEffect(() => {
    fetchFilterOptions();

    // Initialize filters based on active tab
    const listingType =
      activeTab === "Buy" ? "sale" : activeTab === "Rent" ? "rent" : null;
    onFilterChange({
      selectedTypes: [],
      selectedAmenities: [],
      priceRange: [0, 999999999],
      listingType,
    });
  }, []);

  // Update filters whenever any filter state changes
  useEffect(() => {
    const listingType =
      activeTab === "Buy" ? "sale" : activeTab === "Rent" ? "rent" : null;
    onFilterChange({
      selectedTypes,
      selectedAmenities,
      priceRange,
      listingType,
    });
  }, [selectedTypes, selectedAmenities, priceRange, activeTab]);

  const fetchFilterOptions = async () => {
    try {
      setLoading(true);

      // Fetch all properties to extract unique types and features
      const { data, error } = await supabase
        .from("listed_properties")
        .select("property_type, features")
        .eq("is_deleted", false)
        .eq("is_public", true);

      if (error) {
        console.error("Error fetching filter options:", error);
        return;
      }

      // Extract unique property types
      const types = new Set<string>();
      const allFeatures = new Set<string>();

      data?.forEach((property) => {
        if (property.property_type) {
          types.add(property.property_type);
        }
        // Extract features from JSONB array
        if (property.features && Array.isArray(property.features)) {
          property.features.forEach((feature: string) => {
            allFeatures.add(feature);
          });
        }
      });

      setPropertyTypes(Array.from(types).sort());
      setAmenities(Array.from(allFeatures).sort());
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    setSelectedTypes([]);
    setSelectedAmenities([]);
    setMinPriceInput("");
    setMaxPriceInput("");
    setPriceRange([0, 999999999]);
    setShowSlider(false);

    // Notify parent of filter reset
    const listingType =
      activeTab === "Buy" ? "sale" : activeTab === "Rent" ? "rent" : null;
    onFilterChange({
      selectedTypes: [],
      selectedAmenities: [],
      priceRange: [0, 999999999],
      listingType,
    });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setMinPriceInput(value);
    if (
      value &&
      maxPriceInput &&
      parseInt(value) > 0 &&
      parseInt(maxPriceInput) > 0
    ) {
      setPriceRange([parseInt(value), parseInt(maxPriceInput)]);
      setShowSlider(true);
    } else {
      setShowSlider(false);
    }
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setMaxPriceInput(value);
    if (
      value &&
      minPriceInput &&
      parseInt(value) > 0 &&
      parseInt(minPriceInput) > 0
    ) {
      setPriceRange([parseInt(minPriceInput), parseInt(value)]);
      setShowSlider(true);
    } else {
      setShowSlider(false);
    }
  };

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const tabs = [
    { name: "Buy", icon: ShoppingCart },
    { name: "Rent", icon: Key },
    { name: "Favorites", icon: Heart },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`
          fixed top-0 left-0 h-full z-50
          w-[340px] flex flex-col 
          bg-gradient-to-b from-sky-50 via-sky-50 to-blue-50
          rounded-tr-3xl rounded-br-3xl
          shadow-2xl border-r border-white/40
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:rounded-tl-none lg:rounded-bl-none
        `}
      >
        <div className="px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Title with icon */}
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-sky-100/50 backdrop-blur-sm rounded-lg shadow-sm border border-sky-200/30">
                <SlidersHorizontal className="h-4.5 w-4.5 text-sky-700" />
              </div>
              <h2 className="text-base font-bold text-gray-800">Filters</h2>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all duration-150"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear
              </button>
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-150"
              >
                <X className="h-4.5 w-4.5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-3 pb-6 space-y-4 max-h-[calc(105vh-140px)]">
          {/* Buy/Rent/Favorites Tabs */}
          <div className="grid grid-cols-1 gap-2.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activeTab === tab.name
                      ? "bg-sky-600 text-white border-2 border-sky-600"
                      : "bg-white text-gray-700 border-2 border-gray-200 hover:border-sky-400 hover:bg-sky-50"
                  }`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 transition-colors duration-200 ${
                      activeTab === tab.name ? "text-white" : "text-sky-600"
                    }`}
                  />
                  {tab.name}
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-200" />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-sky-100 to-sky-50 rounded-xl shadow-sm">
                <DollarSign className="h-4 w-4 text-sky-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">Price Range</h3>
            </div>

            {/* Min and Max Price Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  Minimum Price (₱)
                </label>
                <input
                  type="text"
                  value={minPriceInput}
                  onChange={handleMinPriceChange}
                  placeholder="e.g., 15000"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  Maximum Price (₱)
                </label>
                <input
                  type="text"
                  value={maxPriceInput}
                  onChange={handleMaxPriceChange}
                  placeholder="e.g., 55000"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all bg-white"
                />
              </div>
            </div>

            {/* Material UI Slider - appears when both values are set */}
            {showSlider && (
              <div className="pt-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-1">
                  <Slider
                    value={priceRange}
                    onChange={handleSliderChange}
                    valueLabelDisplay="auto"
                    min={parseInt(minPriceInput) || 15000}
                    max={parseInt(maxPriceInput) || 55000}
                    step={1000}
                    valueLabelFormat={(value) => `₱${value.toLocaleString()}`}
                    sx={{
                      color: "#0ea5e9",
                      "& .MuiSlider-thumb": {
                        backgroundColor: "#0ea5e9",
                        "&:hover": {
                          boxShadow: "0 0 0 8px rgba(14, 165, 233, 0.16)",
                        },
                      },
                      "& .MuiSlider-valueLabel": {
                        backgroundColor: "#0ea5e9",
                        color: "#fff",
                      },
                    }}
                  />
                </div>
                <div className="text-center text-xs font-semibold text-sky-700 bg-sky-50 py-2 px-3 rounded-lg">
                  ₱{priceRange[0].toLocaleString()} - ₱
                  {priceRange[1].toLocaleString()}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200" />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-sky-100 to-sky-50 rounded-xl shadow-sm">
                <Home className="h-4 w-4 text-sky-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">Type of place</h3>
            </div>
            <div className="space-y-1 pl-1">
              {loading ? (
                <div className="text-xs text-gray-500 py-2">
                  Loading types...
                </div>
              ) : propertyTypes.length === 0 ? (
                <div className="text-xs text-gray-500 py-2">
                  No property types available
                </div>
              ) : (
                propertyTypes.map((type) => (
                  <label
                    key={type}
                    className="flex items-center cursor-pointer group py-1"
                  >
                    <input
                      type="checkbox"
                      className="w-4.5 h-4.5 rounded border-2 border-gray-300 text-sky-600 focus:ring-2 focus:ring-sky-500 focus:ring-offset-0 cursor-pointer transition-all"
                      checked={selectedTypes.includes(type)}
                      onChange={() => {
                        setSelectedTypes((prev) =>
                          prev.includes(type)
                            ? prev.filter((t) => t !== type)
                            : [...prev, type]
                        );
                      }}
                    />
                    <span className="ml-3 text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                      {type}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-gray-200" />

          <div className="space-y-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-sky-100 to-sky-50 rounded-xl shadow-sm">
                <Sparkles className="h-4 w-4 text-sky-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">Amenities</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {loading ? (
                <div className="text-xs text-gray-500 py-2">
                  Loading amenities...
                </div>
              ) : amenities.length === 0 ? (
                <div className="text-xs text-gray-500 py-2">
                  No amenities available
                </div>
              ) : (
                amenities.map((amenity, idx) => (
                  <button
                    key={`${amenity}-${idx}`}
                    onClick={() => {
                      setSelectedAmenities((prev) =>
                        prev.includes(amenity)
                          ? prev.filter((a) => a !== amenity)
                          : [...prev, amenity]
                      );
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all duration-200 ${
                      selectedAmenities.includes(amenity)
                        ? "bg-sky-500 border-sky-500 text-white shadow-md"
                        : "bg-white border-gray-200 text-gray-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                    }`}
                  >
                    {amenity}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
