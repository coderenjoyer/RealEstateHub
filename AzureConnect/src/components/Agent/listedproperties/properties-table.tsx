"use client"

import { useState } from "react"
import { Search, ChevronRight, X, Home, MapPin, Bed, Bath } from "lucide-react"

const properties = [
  {
    id: 1,
    property: "Balay ni Spiderman",
    location: "123 Main Street, Manila",
    price: "₱2,500,000",
    rooms: "3BR/2BA",
    status: "Approved",
    description: "Modern family home with garden, perfect for families. Features include swimming pool, garage, and security system.",
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: "1,500 sq ft",
    parking: 2,
    yearBuilt: 2020,
    propertyType: "House",
    features: ["Swimming Pool", "Garden", "Garage", "Security System"]
  },
  {
    id: 2,
    property: "Balay ni Batman",
    location: "456 Oak Avenue, Quezon City",
    price: "₱1,800,000",
    rooms: "2BR/1BA",
    status: "Pending Approval",
    description: "Cozy apartment in the heart of the city. Recently renovated with modern amenities and great views.",
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: "800 sq ft",
    parking: 1,
    yearBuilt: 2018,
    propertyType: "Apartment",
    features: ["Balcony", "Modern Kitchen", "Elevator"]
  },
]


export function PropertiesTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (property: any) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProperty(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden min-w-[375px]">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Properties</h2>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Dropdown */}
        <div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-slate-400 transition"
          >
            <option value="all">All Properties</option>
            <option value="vacant">Approved</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Property
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Location
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Price
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Rooms
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr
                key={property.id}
                className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {property.property}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {property.location}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {property.price}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {property.rooms}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    property.status === "Approved" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {property.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button 
                    onClick={() => openModal(property)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors"
                  >
                    Review
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State Message */}
      {properties.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-slate-500">No properties found</p>
        </div>
      )}

      {/* Property Details Side Panel */}
      {isModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-end p-8" onClick={closeModal}>
          <div className="w-[500px] h-[calc(100vh-4rem)] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            {/* Header with Image Gallery */}
            <div className="relative">
              {/* Main Image */}
              <div className="h-48 bg-gradient-to-br from-rose-300 via-pink-200 to-rose-200 relative">
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 left-4 p-2 bg-white/95 backdrop-blur-sm rounded-xl hover:bg-white transition-all shadow-md z-10"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>

                {/* Property Type Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-4 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm">
                    {selectedProperty.propertyType}
                  </span>
                </div>

                {/* House Illustration */}
                <div className="absolute bottom-0 left-0 right-0">
                  <svg viewBox="0 0 280 120" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M60 120V75L140 40L220 75V120H60Z" fill="#be123c" />
                    <path d="M45 75L140 25L235 75L220 80L140 40L60 80L45 75Z" fill="#9f1239" />
                    <ellipse cx="140" cy="50" rx="15" ry="8" fill="#881337" />
                    <rect x="85" y="85" width="28" height="25" rx="2" fill="#fbbf24" />
                    <rect x="167" y="85" width="28" height="25" rx="2" fill="#fbbf24" />
                    <line x1="99" y1="85" x2="99" y2="110" stroke="#be123c" strokeWidth="2" />
                    <line x1="85" y1="97.5" x2="113" y2="97.5" stroke="#be123c" strokeWidth="2" />
                    <line x1="181" y1="85" x2="181" y2="110" stroke="#be123c" strokeWidth="2" />
                    <line x1="167" y1="97.5" x2="195" y2="97.5" stroke="#be123c" strokeWidth="2" />
                    <rect x="125" y="90" width="30" height="30" rx="2" fill="#78350f" />
                    <circle cx="148" cy="105" r="2" fill="#fbbf24" />
                  </svg>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="px-6 py-4 flex gap-3">
                <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-sky-500">
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <Home className="w-6 h-6 text-slate-400" />
                  </div>
                </div>
                <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <Home className="w-6 h-6 text-slate-400" />
                  </div>
                </div>
                <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <Home className="w-6 h-6 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Property Title and Location */}
            <div className="px-6 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProperty.property}</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <p className="text-sm">{selectedProperty.location}</p>
              </div>
              
            </div>


            {/* Tab Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl">
                      <Bed className="h-5 w-5 text-sky-600" />
                      <span className="text-sm font-medium text-gray-600">Bedrooms</span>
                      <span className="text-lg font-bold text-gray-900">{selectedProperty.bedrooms}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl">
                      <Bath className="h-5 w-5 text-sky-600" />
                      <span className="text-sm font-medium text-gray-600">Bathrooms</span>
                      <span className="text-lg font-bold text-gray-900">{selectedProperty.bathrooms}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl">
                      <Home className="h-5 w-5 text-sky-600" />
                      <span className="text-sm font-medium text-gray-600">Sq Ft</span>
                      <span className="text-lg font-bold text-gray-900">{selectedProperty.squareFeet}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Price</h3>
                  <p className="text-2xl font-bold text-sky-600">{selectedProperty.price}</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedProperty.description}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.features.map((feature: string, index: number) => (
                      <span key={index} className="px-3 py-1.5 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}