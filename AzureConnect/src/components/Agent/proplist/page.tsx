"use client"

import type React from "react"

import { Sidebar } from "@/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImagePlus } from "lucide-react"
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("[v0] Form submitted:", formData)
    // Handle form submission
  }

  const handleCancel = () => {
    console.log("[v0] Form cancelled")
    // Handle cancel action
  }

  return (
    <div className="flex min-h-screen bg-[#e8f4f8]">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-5xl">
          <h1 className="text-2xl font-semibold mb-6 text-gray-900">List new property</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Title and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <Label htmlFor="propertyTitle" className="text-sm font-medium text-gray-900 mb-2 block">
                  Property Title
                </Label>
                <Input
                  id="propertyTitle"
                  placeholder="Modern Family Home with Garden"
                  value={formData.propertyTitle}
                  onChange={(e) => setFormData({ ...formData, propertyTitle: e.target.value })}
                  className="bg-white border-gray-200"
                />
              </div>

              <div className="md:col-span-1">
                <Label htmlFor="propertyType" className="text-sm font-medium text-gray-900 mb-2 block">
                  Property Type
                </Label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price, Bedrooms, Bathrooms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="price" className="text-sm font-medium text-gray-900 mb-2 block">
                  Price (₱)
                </Label>
                <Input
                  id="price"
                  placeholder="₱50,000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-white border-gray-200"
                />
              </div>

              <div>
                <Label htmlFor="bedrooms" className="text-sm font-medium text-gray-900 mb-2 block">
                  Bedrooms
                </Label>
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="2"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="bg-white border-gray-200"
                />
              </div>

              <div>
                <Label htmlFor="bathrooms" className="text-sm font-medium text-gray-900 mb-2 block">
                  Bathrooms
                </Label>
                <Input
                  id="bathrooms"
                  type="number"
                  placeholder="1"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="bg-white border-gray-200"
                />
              </div>
            </div>

            {/* Street Address, City, ZIP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="streetAddress" className="text-sm font-medium text-gray-900 mb-2 block">
                  Street Address
                </Label>
                <Input
                  id="streetAddress"
                  placeholder="123 Main Street"
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  className="bg-white border-gray-200"
                />
              </div>

              <div>
                <Label htmlFor="city" className="text-sm font-medium text-gray-900 mb-2 block">
                  City
                </Label>
                <Input
                  id="city"
                  placeholder="New York"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-white border-gray-200"
                />
              </div>

              <div>
                <Label htmlFor="zipPostal" className="text-sm font-medium text-gray-900 mb-2 block">
                  ZIP/Postal
                </Label>
                <Input
                  id="zipPostal"
                  placeholder="10001"
                  value={formData.zipPostal}
                  onChange={(e) => setFormData({ ...formData, zipPostal: e.target.value })}
                  className="bg-white border-gray-200"
                />
              </div>
            </div>

            {/* Property Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-900 mb-2 block">
                Property Description
              </Label>
              <Textarea
                id="description"
                placeholder="Placeholder Text"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-white border-gray-200 min-h-[120px] resize-none"
              />
            </div>

            {/* Features & Amenities */}
            <div>
              <Label htmlFor="features" className="text-sm font-medium text-gray-900 mb-2 block">
                Features & Amenities
              </Label>
              <Input
                id="features"
                placeholder="Garage, Garden, Swimming Pool"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="bg-white border-gray-200"
              />
            </div>

            {/* Property Images */}
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">Property Images</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-12 flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                <ImagePlus className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload images</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-900 mb-2 block">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  placeholder="Placeholder Text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="bg-white border-gray-200"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-900 mb-2 block">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Placeholder Text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white border-gray-200"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-900 mb-2 block">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                placeholder="Placeholder Text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="bg-white border-gray-200"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel} className="px-8 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0f4c75] hover:bg-[#0d3f5f] text-white px-8">
                Submit Property
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
