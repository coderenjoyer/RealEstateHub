"use client"

import { useState } from "react"
import { Card } from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import { Slider } from "../ui/slider"
import { MapPin, DollarSign, Home, Sparkles } from "lucide-react"

export function PropertyFilters() {
  const [priceRange, setPriceRange] = useState([30])

  const locations = ["Labangon", "Mandaue", "Talisay", "Naga", "More Location"]
  const priceOptions = ["Under 30k", "30k-50k", "More than 50k", "Custom"]
  const propertyTypes = ["Apartment", "Condominium", "Single Family Home", "Bungalow", "Villa"]
  const amenities = ["Garage", "Pool", "Spa", "Gym", "Garden", "Garage"]

  return (
    <Card className="w-80 p-6 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl shrink-0">
      <div className="space-y-6">
        {/* Custom Filter Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Custom Filter</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700">Clear</button>
        </div>

        {/* Location Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="h-4 w-4" />
            <h3 className="font-medium">Location</h3>
          </div>
          <div className="space-y-2">
            {locations.map((location) => (
              <div key={location} className="flex items-center space-x-2">
                <Checkbox id={location} />
                <Label htmlFor={location} className="text-sm text-gray-600 cursor-pointer">
                  {location}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <DollarSign className="h-4 w-4" />
            <h3 className="font-medium">Price Range</h3>
          </div>
          <div className="space-y-2">
            {priceOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox id={option} />
                <Label htmlFor={option} className="text-sm text-gray-600 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
          <div className="pt-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Min</span>
              <span>30k</span>
              <span>50k</span>
              <span>Max</span>
            </div>
            <Slider value={priceRange} onValueChange={setPriceRange} max={100} step={1} className="w-full" />
          </div>
        </div>

        {/* Type of Place Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Home className="h-4 w-4" />
            <h3 className="font-medium">Type of place</h3>
          </div>
          <div className="space-y-2">
            {propertyTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox id={type} />
                <Label htmlFor={type} className="text-sm text-gray-600 cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Sparkles className="h-4 w-4" />
            <h3 className="font-medium">Amenities</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <button
                key={amenity}
                className="px-3 py-1.5 text-sm rounded-full border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
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
