"use client"

import { useState } from "react"
import { Card } from "../ui/card"
import { MapPin, DollarSign, Home, Sparkles } from "lucide-react"

export function PropertyFilters() {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedPrice, setSelectedPrice] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([15, 55]) // Min and Max price in thousands

  const locations = ["Labangon", "Mandaue", "Talisay", "Naga", "More Location"]
  const priceOptions = ["Under 30k", "40k-60k", "More than 100k", "Custom"]
  const propertyTypes = ["Apartment", "Condominium", "Single Family Home", "Bungalow", "Villa"]
  const amenities = ["Garage", "Pool", "Spa", "Gym", "Garden", "Lounge"]

  const handleClearAll = () => {
    setSelectedLocations([])
    setSelectedPrice("")
    setSelectedTypes([])
    setSelectedAmenities([])
    setPriceRange([15, 55])
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = parseInt(e.target.value)
    const newRange = [...priceRange]
    
    if (index === 0) {
      // Min slider
      newRange[0] = Math.min(newValue, priceRange[1] - 5)
    } else {
      // Max slider
      newRange[1] = Math.max(newValue, priceRange[0] + 5)
    }
    
    setPriceRange(newRange)
  }

  return (
    <Card className="w-[340px] bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-white/50 shrink-0 overflow-hidden sticky top-20 self-start">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-5 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Custom Filter</h2>
          <button 
            onClick={handleClearAll}
            className="text-sm text-sky-600 hover:text-sky-700 font-semibold hover:underline transition-all"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Scrollable Filter Content */}
      <div className="px-6 py-5 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
        
        {/* Location Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-gradient-to-br from-sky-100 to-sky-50 rounded-xl shadow-sm">
              <MapPin className="h-4 w-4 text-sky-600" />
            </div>
            <h3 className="font-bold text-gray-800 text-base">Location</h3>
          </div>
          <div className="space-y-2.5 pl-1">
            {locations.map((location) => (
              <label key={location} className="flex items-center cursor-pointer group py-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="w-4.5 h-4.5 rounded border-2 border-gray-300 text-sky-600 focus:ring-2 focus:ring-sky-500 focus:ring-offset-0 cursor-pointer transition-all"
                    checked={selectedLocations.includes(location)}
                    onChange={() => {
                      setSelectedLocations(prev =>
                        prev.includes(location)
                          ? prev.filter(l => l !== location)
                          : [...prev, location]
                      )
                    }}
                  />
                </div>
                <span className="ml-3 text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{location}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Price Range Filter with Slider */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-gradient-to-br from-sky-100 to-sky-50 rounded-xl shadow-sm">
              <DollarSign className="h-4 w-4 text-sky-600" />
            </div>
            <h3 className="font-bold text-gray-800 text-base">Price Range</h3>
          </div>
          
          {/* Radio Options */}
          <div className="space-y-2.5 pl-1">
            {priceOptions.map((option) => (
              <label key={option} className="flex items-center cursor-pointer group py-1">
                <input
                  type="radio"
                  name="price"
                  className="w-4.5 h-4.5 border-2 border-gray-300 text-sky-600 focus:ring-2 focus:ring-sky-500 focus:ring-offset-0 cursor-pointer transition-all"
                  checked={selectedPrice === option}
                  onChange={() => setSelectedPrice(option)}
                />
                <span className="ml-3 text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{option}</span>
              </label>
            ))}
          </div>

          {/* Price Range Slider */}
          <div className="pt-3 space-y-3">
            {/* Price Labels */}
            <div className="flex justify-between items-center text-xs font-semibold text-gray-600 px-1">
              <span>15k</span>
              <span>25k</span>
              <span>35k</span>
              <span>45k</span>
              <span>55k</span>
            </div>

            {/* Custom Dual Range Slider */}
            <div className="relative h-8 flex items-center">
              {/* Track Background */}
              <div className="absolute w-full h-1.5 bg-gray-200 rounded-full"></div>
              
              {/* Active Track */}
              <div 
                className="absolute h-1.5 bg-sky-600 rounded-full"
                style={{
                  left: `${((priceRange[0] - 15) / 40) * 100}%`,
                  right: `${100 - ((priceRange[1] - 15) / 40) * 100}%`
                }}
              ></div>

              {/* Min Slider */}
              <input
                type="range"
                min="15"
                max="55"
                step="5"
                value={priceRange[0]}
                onChange={(e) => handleSliderChange(e, 0)}
                className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sky-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-sky-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
              />

              {/* Max Slider */}
              <input
                type="range"
                min="15"
                max="55"
                step="5"
                value={priceRange[1]}
                onChange={(e) => handleSliderChange(e, 1)}
                className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sky-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-sky-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
              />
            </div>

            {/* Selected Range Display */}
            <div className="text-center text-sm font-semibold text-gray-700 pt-1">
              {priceRange[0]}k - {priceRange[1]}k
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Type of Place Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-gradient-to-br from-sky-100 to-sky-50 rounded-xl shadow-sm">
              <Home className="h-4 w-4 text-sky-600" />
            </div>
            <h3 className="font-bold text-gray-800 text-base">Type of place</h3>
          </div>
          <div className="space-y-2.5 pl-1">
            {propertyTypes.map((type) => (
              <label key={type} className="flex items-center cursor-pointer group py-1">
                <input
                  type="checkbox"
                  className="w-4.5 h-4.5 rounded border-2 border-gray-300 text-sky-600 focus:ring-2 focus:ring-sky-500 focus:ring-offset-0 cursor-pointer transition-all"
                  checked={selectedTypes.includes(type)}
                  onChange={() => {
                    setSelectedTypes(prev =>
                      prev.includes(type)
                        ? prev.filter(t => t !== type)
                        : [...prev, type]
                    )
                  }}
                />
                <span className="ml-3 text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Amenities Filter */}
        <div className="space-y-3 pb-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-gradient-to-br from-sky-100 to-sky-50 rounded-xl shadow-sm">
              <Sparkles className="h-4 w-4 text-sky-600" />
            </div>
            <h3 className="font-bold text-gray-800 text-base">Amenities</h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {amenities.map((amenity, idx) => (
              <button
                key={`${amenity}-${idx}`}
                onClick={() => {
                  setSelectedAmenities(prev =>
                    prev.includes(amenity)
                      ? prev.filter(a => a !== amenity)
                      : [...prev, amenity]
                  )
                }}
                className={`px-4 py-2 text-sm font-medium rounded-full border-2 transition-all duration-200 ${
                  selectedAmenities.includes(amenity)
                    ? 'bg-sky-500 border-sky-500 text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>
      </div>

    </Card>
  )
}