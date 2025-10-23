"use client"

import React, { useState } from "react"
import { ImagePlus, Check, ChevronDown, X, Plus, Home, DollarSign, MapPin, FileText, User, Trash2 } from "lucide-react"
import { AgentLayout } from "@/components/layouts/AgentLayout"

export default function ListPropertyPage() {
  const [formData, setFormData] = useState({
    propertyTitle: "",
    propertyType: "",
    listingType: "sale",
    price: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    lotSize: "",
    yearBuilt: "",
    parkingSpaces: "",
    streetAddress: "",
    city: "",
    state: "",
    zipPostal: "",
    country: "Philippines",
    description: "",
    features: [] as string[],
    fullName: "",
    email: "",
    phoneNumber: "",
    availableFrom: "",
    propertyStatus: "available",
    furnished: "",
    petPolicy: "",
    utilities: [] as string[],
  })

  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false)
  const [showFurnishedDropdown, setShowFurnishedDropdown] = useState(false)
  const [showPetDropdown, setShowPetDropdown] = useState(false)
  const [currentFeature, setCurrentFeature] = useState("")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const propertyTypes = ["House", "Apartment", "Condo", "Townhouse", "Land", "Commercial", "Multi-Family", "Villa", "Studio"]
  const furnishedOptions = ["Furnished", "Semi-Furnished", "Unfurnished"]
  const petPolicies = ["Pets Allowed", "No Pets", "Cats Only", "Dogs Only", "With Restrictions"]
  const commonFeatures = [
    "Swimming Pool", "Garden", "Garage", "Balcony", "Terrace", "Gym",
    "Security System", "Fireplace", "Walk-in Closet", "Laundry Room",
    "Home Office", "Storage Room", "Backup Generator", "Solar Panels",
    "Smart Home", "Elevator", "Gated Community", "Near School", "Near Mall"
  ]

  const utilityOptions = ["Water", "Electricity", "Gas", "Internet", "Cable TV", "Trash Collection"]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  const handleCancel = () => {
    console.log("Form cancelled")
  }

  const addFeature = (feature: string) => {
    if (feature && !formData.features.includes(feature)) {
      setFormData({ ...formData, features: [...formData.features, feature] })
      setCurrentFeature("")
    }
  }

  const removeFeature = (feature: string) => {
    setFormData({ ...formData, features: formData.features.filter(f => f !== feature) })
  }

  const toggleUtility = (utility: string) => {
    if (formData.utilities.includes(utility)) {
      setFormData({ ...formData, utilities: formData.utilities.filter(u => u !== utility) })
    } else {
      setFormData({ ...formData, utilities: [...formData.utilities, utility] })
    }
  }


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file))
      setUploadedImages([...uploadedImages, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index))
  }

  return (
    <AgentLayout>
      <div className="p-8">
        <div className="max-w-7xl min-w-[375px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">List New Property</h1>
            <p className="text-slate-600 mt-2">Fill in the details below to list your property</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg sm:p-8 p-4">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Home className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-slate-900">Basic Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">Property Title *</label>
                    <input
                      placeholder="Modern Family Home with Garden"
                      value={formData.propertyTitle}
                      onChange={(e) => setFormData({ ...formData, propertyTitle: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">Property Type *</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                      >
                        <span className="text-slate-700">{formData.propertyType || "Select property type"}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showPropertyDropdown ? "rotate-180" : ""}`} />
                      </button>
                      {showPropertyDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg bg-white shadow-lg z-50 max-h-60 overflow-y-auto">
                          {propertyTypes.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, propertyType: type })
                                setShowPropertyDropdown(false)
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between"
                            >
                              <span className="text-slate-700">{type}</span>
                              {formData.propertyType === type && <Check className="w-4 h-4 text-blue-500" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">Listing Type *</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="sale"
                          checked={formData.listingType === "sale"}
                          onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                          className="w-4 h-4 text-blue-500"
                        />
                        <span className="text-slate-700">For Sale</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="rent"
                          checked={formData.listingType === "rent"}
                          onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                          className="w-4 h-4 text-blue-500"
                        />
                        <span className="text-slate-700">For Rent</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">Property Status</label>
                    <select
                      value={formData.propertyStatus}
                      onChange={(e) => setFormData({ ...formData, propertyStatus: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="available">Available</option>
                      <option value="pending">Pending</option>
                      <option value="sold">Sold</option>
                      <option value="rented">Rented</option>
                    </select>
                  </div>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Pricing & Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-slate-900">Pricing & Property Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      {formData.listingType === "sale" ? "Sale Price (₱) *" : "Monthly Rent (₱) *"}
                    </label>
                    <input
                      placeholder="₱50,000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">Bedrooms *</label>
                    <input
                      type="number"
                      placeholder="2"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">Bathrooms *</label>
                    <input
                      type="number"
                      placeholder="1"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">Square Feet</label>
                    <input
                      type="number"
                      placeholder="1,500"
                      value={formData.squareFeet}
                      onChange={(e) => setFormData({ ...formData, squareFeet: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">Lot Size (sqm)</label>
                    <input
                      type="number"
                      placeholder="200"
                      value={formData.lotSize}
                      onChange={(e) => setFormData({ ...formData, lotSize: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">Year Built</label>
                    <input
                      type="number"
                      placeholder="2020"
                      value={formData.yearBuilt}
                      onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">Parking Spaces</label>
                    <input
                      type="number"
                      placeholder="2"
                      value={formData.parkingSpaces}
                      onChange={(e) => setFormData({ ...formData, parkingSpaces: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {formData.listingType === "rent" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-slate-900 mb-2 block">Available From</label>
                      <input
                        type="date"
                        value={formData.availableFrom}
                        onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 mb-2 block">Furnished Status</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowFurnishedDropdown(!showFurnishedDropdown)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                        >
                          <span className="text-slate-700">{formData.furnished || "Select status"}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${showFurnishedDropdown ? "rotate-180" : ""}`} />
                        </button>
                        {showFurnishedDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg bg-white shadow-lg z-50">
                            {furnishedOptions.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, furnished: option })
                                  setShowFurnishedDropdown(false)
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between"
                              >
                                <span className="text-slate-700">{option}</span>
                                {formData.furnished === option && <Check className="w-4 h-4 text-blue-500" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-slate-200" />

              {/* Location Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-slate-900">Location</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">Street Address *</label>
                    <input
                      placeholder="123 Main Street"
                      value={formData.streetAddress}
                      onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">City *</label>
                    <input
                      placeholder="Manila"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">State/Province</label>
                    <input
                      placeholder="Metro Manila"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">ZIP/Postal *</label>
                    <input
                      placeholder="1006"
                      value={formData.zipPostal}
                      onChange={(e) => setFormData({ ...formData, zipPostal: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">Country</label>
                    <input
                      placeholder="Philippines"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Description Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-slate-900">Property Description</h2>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-900 mb-2 block">Description *</label>
                  <textarea
                    placeholder="Describe your property in detail. Include information about the neighborhood, nearby amenities, recent renovations, and what makes this property special..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Features & Amenities Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Features & Amenities</h2>

                <div>
                  <label className="text-sm font-semibold text-slate-900 mb-2 block">Add Features</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      placeholder="Type custom feature or select from below"
                      value={currentFeature}
                      onChange={(e) => setCurrentFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature(currentFeature))}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => addFeature(currentFeature)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {commonFeatures.map((feature) => (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => addFeature(feature)}
                        disabled={formData.features.includes(feature)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          formData.features.includes(feature)
                            ? "bg-blue-100 text-blue-700 cursor-not-allowed"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>

                  {formData.features.length > 0 && (
                    <div className="border border-slate-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-slate-900 mb-2">Selected Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.features.map((feature) => (
                          <span
                            key={feature}
                            className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm flex items-center gap-2"
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() => removeFeature(feature)}
                              className="hover:bg-blue-600 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-900 mb-2 block">Utilities Included</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {utilityOptions.map((utility) => (
                      <label key={utility} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.utilities.includes(utility)}
                          onChange={() => toggleUtility(utility)}
                          className="w-4 h-4 text-blue-500 rounded"
                        />
                        <span className="text-slate-700">{utility}</span>
                      </label>
                    ))}
                  </div>
                </div>


                {formData.listingType === "rent" && (
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">Pet Policy</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowPetDropdown(!showPetDropdown)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                      >
                        <span className="text-slate-700">{formData.petPolicy || "Select pet policy"}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showPetDropdown ? "rotate-180" : ""}`} />
                      </button>
                      {showPetDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg bg-white shadow-lg z-50">
                          {petPolicies.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, petPolicy: option })
                                setShowPetDropdown(false)
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between"
                            >
                              <span className="text-slate-700">{option}</span>
                              {formData.petPolicy === option && <Check className="w-4 h-4 text-blue-500" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-slate-200" />

              {/* Property Images Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Property Images</h2>
                <p className="text-sm text-slate-600">Upload high-quality images of your property (max 10 images)</p>
                
                <div>
                  <input
                    type="file"
                    id="imageUpload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 p-12 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <ImagePlus className="w-10 h-10 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 font-medium">Click to upload images</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG up to 10MB each</p>
                  </label>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Property ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr className="border-slate-200" />

              {/* Contact Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-slate-900">Contact Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">Full Name *</label>
                    <input
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">Email *</label>
                    <input
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-900 mb-2 block">Phone Number *</label>
                  <input
                    placeholder="+63 912 345 6789"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Form Actions */}
              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-slate-600">* Required fields</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Submit Property
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AgentLayout>
  )
}