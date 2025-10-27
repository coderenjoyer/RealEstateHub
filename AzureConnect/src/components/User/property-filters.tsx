"use client";

import { useState } from "react";
import {
  DollarSign,
  Home,
  Sparkles,
  X,
  Heart,
  ShoppingCart,
  Key,
} from "lucide-react";

interface PropertyFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function PropertyFilters({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
}: PropertyFiltersProps) {
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([15, 55]);
  const [customMinPrice, setCustomMinPrice] = useState("");
  const [customMaxPrice, setCustomMaxPrice] = useState("");
  const priceOptions = ["Under 30k", "40k-60k", "More than 100k", "Custom"];
  const propertyTypes = [
    "Apartment",
    "Condominium",
    "Single Family Home",
    "Bungalow",
    "Villa",
  ];
  const amenities = ["Garage", "Pool", "Spa", "Gym", "Garden", "Lounge"];

  const handleClearAll = () => {
    setSelectedPrice("");
    setSelectedTypes([]);
    setSelectedAmenities([]);
    setPriceRange([15, 55]);
    setCustomMinPrice("");
    setCustomMaxPrice("");
  };

  const handleSliderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newValue = parseInt(e.target.value);
    const newRange = [...priceRange];
    if (index === 0) newRange[0] = Math.min(newValue, priceRange[1] - 5);
    else newRange[1] = Math.max(newValue, priceRange[0] + 5);
    setPriceRange(newRange);
  };

  const handlePriceOptionChange = (option: string) => {
    setSelectedPrice(option);
    // Reset custom inputs when switching away from Custom
    if (option !== "Custom") {
      setCustomMinPrice("");
      setCustomMaxPrice("");
    }
  };

  const handleCustomMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, ""); // Only allow digits
    setCustomMinPrice(value);
  };

  const handleCustomMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, ""); // Only allow digits
    setCustomMaxPrice(value);
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
        <div className="px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">Custom Filter</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAll}
                className="text-sm text-sky-600 hover:text-sky-700 font-semibold hover:underline transition-all"
              >
                Clear
              </button>
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 hover:bg-sky-100 rounded-lg transition-all duration-200"
              >
                <X className="h-5 w-5 text-gray-600" />
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

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-sky-100 to-sky-50 rounded-xl shadow-sm">
                <DollarSign className="h-4 w-4 text-sky-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">Price Range</h3>
            </div>

            <div className="space-y-1 pl-1">
              {priceOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center cursor-pointer group py-1"
                >
                  <input
                    type="radio"
                    name="price"
                    className="w-4.5 h-4.5 border-2 border-gray-300 text-sky-600 focus:ring-2 focus:ring-sky-500 focus:ring-offset-0 cursor-pointer transition-all"
                    checked={selectedPrice === option}
                    onChange={() => handlePriceOptionChange(option)}
                  />
                  <span className="ml-3 text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                    {option}
                  </span>
                </label>
              ))}
            </div>

            {selectedPrice === "Custom" && (
              <div className="pt-3 pl-1 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 block">
                    Min Price (₱)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customMinPrice}
                      onChange={handleCustomMinChange}
                      placeholder="e.g., 15000"
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 block">
                    Max Price (₱)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customMaxPrice}
                      onChange={handleCustomMaxChange}
                      placeholder="e.g., 55000"
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                {customMinPrice && customMaxPrice && (
                  <div className="text-center py-2 px-3 bg-sky-50 border border-sky-200 rounded-lg">
                    <p className="text-xs font-semibold text-sky-700">
                      ₱{parseInt(customMinPrice).toLocaleString()} - ₱
                      {parseInt(customMaxPrice).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedPrice !== "Custom" && (
              <div className="pt-2 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-600 px-1">
                  <span>15k</span>
                  <span>25k</span>
                  <span>35k</span>
                  <span>45k</span>
                  <span>55k</span>
                </div>

                <div className="relative h-8 flex items-center">
                  <div className="w-full h-1.5 bg-gray-200 rounded-full"></div>
                  <div
                    className="absolute h-1.5 bg-sky-600 rounded-full"
                    style={{
                      left: `${((priceRange[0] - 15) / 40) * 100}%`,
                      right: `${100 - ((priceRange[1] - 15) / 40) * 100}%`,
                    }}
                  ></div>

                  <input
                    type="range"
                    min="15"
                    max="55"
                    step="5"
                    value={priceRange[0]}
                    onChange={(e) => handleSliderChange(e, 0)}
                    className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sky-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                  />

                  <input
                    type="range"
                    min="15"
                    max="55"
                    step="5"
                    value={priceRange[1]}
                    onChange={(e) => handleSliderChange(e, 1)}
                    className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sky-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                  />
                </div>

                <div className="text-center text-sm font-semibold text-gray-700">
                  {priceRange[0]}k - {priceRange[1]}k
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
              {propertyTypes.map((type) => (
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
              ))}
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
              {amenities.map((amenity, idx) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
