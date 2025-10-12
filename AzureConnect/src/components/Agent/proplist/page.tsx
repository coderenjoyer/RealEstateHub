"use client"

import type React from "react"

import { Sidebar } from "@/components/ui/agentsidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import { ImagePlus, Check, ChevronDown } from "lucide-react"
import { useState } from "react"

export default function ListPropertyPage() {
  const [formData, setFormData] = useState({
    propertyTitle: "",
    propertyType: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    streetAddress: "",
    city: "",
    zipPostal: "",
    description: "",
    features: "",
    fullName: "",
    email: "",
    phoneNumber: "",
  })

  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false)

  const propertyTypes = ["House", "Apartment", "Condo", "Townhouse", "Land"]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("[v0] Form submitted:", formData)
  }

  const handleCancel = () => {
    console.log("[v0] Form cancelled")
  }

  return (
    <div className="flex min-h-screen bg-[#b8d4e6]">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">List new property</h1>
          </div>

          {/* Main Card Container */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Property Title and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label htmlFor="propertyTitle" className="text-sm font-semibold text-slate-900 mb-3 block">
                    Property Title
                  </Label>
                  <Input
                    id="propertyTitle"
                    placeholder="Modern Family Home with Garden"
                    value={formData.propertyTitle}
                    onChange={(e) => setFormData({ ...formData, propertyTitle: e.target.value })}
                    className="bg-white border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="propertyType" className="text-sm font-semibold text-slate-900 mb-3 block">
                    Property Type
                  </Label>
                  <div className="relative w-full">
                    <button
                      type="button"
                      onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white text-left focus:outline-none text-slate-700 flex items-center justify-between"
                    >
                      <span>{formData.propertyType || "Why"}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showPropertyDropdown ? "rotate-180" : ""}`} />
                    </button>
                    {showPropertyDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg bg-white shadow-lg z-50">
                        {propertyTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, propertyType: type })
                              setShowPropertyDropdown(false)
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between transition-colors border-b last:border-b-0 text-slate-700"
                          >
                            <span>• {type}</span>
                            {formData.propertyType === type && (
                              <Check className="w-4 h-4 text-slate-700" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Price, Bedrooms, Bathrooms */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <Label htmlFor="price" className="text-sm font-semibold text-slate-900 mb-3 block">
                    Price (₱)
                  </Label>
                  <Input
                    id="price"
                    placeholder="₱50,000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-white border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="bedrooms" className="text-sm font-semibold text-slate-900 mb-3 block">
                    Bedrooms
                  </Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="2"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="bg-white border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms" className="text-sm font-semibold text-slate-900 mb-3 block">
                    Bathrooms
                  </Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="1"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="bg-white border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Street Address, City, ZIP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <Label htmlFor="streetAddress" className="text-sm font-semibold text-slate-900 mb-3 block">
                    Street Address
                  </Label>
                  <Input
                    id="streetAddress"
                    placeholder="123 Main Street"
                    value={formData.streetAddress}
                    onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                    className="bg-white border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="city" className="text-sm font-semibold text-slate-900 mb-3 block">
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="Manila"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="bg-white border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="zipPostal" className="text-sm font-semibold text-slate-900 mb-3 block">
                    ZIP/Postal
                  </Label>
                  <Input
                    id="zipPostal"
                    placeholder="1006"
                    value={formData.zipPostal}
                    onChange={(e) => setFormData({ ...formData, zipPostal: e.target.value })}
                    className="bg-white border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Property Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-semibold text-slate-900 mb-3 block">
                  Property Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Placeholder Text"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-white border-slate-200 min-h-[100px] resize-none rounded-lg"
                />
              </div>

              {/* Features & Amenities */}
              <div>
                <Label htmlFor="features" className="text-sm font-semibold text-slate-900 mb-3 block">
                  Features & Amenities
                </Label>
                <Input
                  id="features"
                  placeholder="Garage, Garden, Swimming Pool"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="bg-white border-slate-200 rounded-lg"
                />
              </div>

              <hr className="border-slate-200" />

              {/* Property Images */}
              <div>
                <Label className="text-sm font-semibold text-slate-900 mb-3 block">Property Images</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 p-12 flex flex-col items-center justify-center hover:border-slate-400 transition-colors cursor-pointer">
                  <ImagePlus className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">Click to upload images</p>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-semibold text-slate-900 mb-3 block">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Placeholder Text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="bg-white border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-900 mb-3 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Placeholder Text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="text-sm font-semibold text-slate-900 mb-3 block">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  placeholder="Placeholder Text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="bg-white border-slate-200 rounded-lg"
                />
              </div>

              <hr className="border-slate-200" />

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  onClick={handleCancel} 
                  className="px-6 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Submit Property
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}