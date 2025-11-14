"use client"

import { useState, useEffect } from "react"
import { Search, ChevronRight, X, Home, MapPin, Bed, Bath, Trash2 } from "lucide-react"
import supabase from "@/supabaseClient"
import { useAuth } from "@/AuthContext"

interface Property {
  id: number
  property_title: string
  street_address: string
  city: string
  state: string | null
  price: number
  bedrooms: number
  bathrooms: number
  property_status: string
  description: string
  square_feet: number | null
  parking_spaces: number | null
  year_built: number | null
  property_type: string
  features: string[] | null
  listing_type: string
  media?: any
}

export function PropertiesTable() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [deactivateConfirmId, setDeactivateConfirmId] = useState<number | null>(null)
  const { session } = useAuth()

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      
      if (!session?.user?.id) {
        console.log("No authenticated user")
        return
      }

      // Fetch from listed_properties (approved listings)
      const { data, error } = await supabase
        .from('listed_properties')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching properties:', error)
        return
      }

      setProperties(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.property_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = selectedFilter === "all" ? true :
                         selectedFilter === "vacant" ? property.property_status === "available" :
                         selectedFilter === "pending" ? property.property_status === "pending" :
                         true
    
    return matchesSearch && matchesFilter
  })

  const openModal = (property: any) => {
    setSelectedProperty(property)
    setSelectedImageIndex(0)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProperty(null)
    setSelectedImageIndex(0)
  }

  const handleDeactivateListing = async (propertyId: number) => {
    try {
      const { error } = await supabase
        .from('listed_properties')
        .update({ is_deleted: true })
        .eq('id', propertyId)
        .eq('user_id', session?.user?.id) // Ensure agent can only deactivate their own listings

      if (error) {
        console.error('Error deactivating listing:', error)
        alert('Failed to deactivate listing')
        return
      }

      // Refresh the properties list
      await fetchProperties()
      setDeactivateConfirmId(null)
      
      // Close modal if the deactivated property was open
      if (selectedProperty?.id === propertyId) {
        closeModal()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to deactivate listing')
    }
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <p className="text-slate-500">Loading properties...</p>
                </td>
              </tr>
            ) : filteredProperties.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <p className="text-slate-500">No properties found</p>
                </td>
              </tr>
            ) : (
              filteredProperties.map((property) => (
                <tr
                  key={property.id}
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {property.property_title}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {property.street_address}, {property.city}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    ₱{property.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {property.bedrooms}BR/{property.bathrooms}BA
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      property.property_status === "available" 
                        ? "bg-green-100 text-green-800" 
                        : property.property_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {property.property_status.charAt(0).toUpperCase() + property.property_status.slice(1)}
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
                  <td className="px-6 py-4 text-sm">
                    <button 
                      onClick={() => setDeactivateConfirmId(property.id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                      title="Deactivate Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>



      {/* Property Details Side Panel */}
      {isModalOpen && selectedProperty && (() => {
        // Get images from media array
        const propertyImages = selectedProperty.media && selectedProperty.media.length > 0
          ? selectedProperty.media.map((item: any) => 
              supabase.storage.from('property-media').getPublicUrl(item.bucket_path).data.publicUrl
            )
          : []
        
        const currentImage = propertyImages.length > 0 ? propertyImages[selectedImageIndex] : null

        return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-end p-8" onClick={closeModal}>
          <div className="w-[500px] h-[calc(100vh-4rem)] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            {/* Header with Image Gallery */}
            <div className="relative">
              {/* Main Image */}
              <div className="h-48 bg-gradient-to-br from-rose-300 via-pink-200 to-rose-200 relative">
                {currentImage && (
                  <img 
                    src={currentImage} 
                    alt={selectedProperty.property_title}
                    className="w-full h-full object-cover"
                  />
                )}
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
                    {selectedProperty.property_type}
                  </span>
                </div>

                {/* House Illustration - only show if no image */}
                {!currentImage && (
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
                )}
              </div>

              {/* Thumbnail Gallery */}
              <div className="px-6 py-4 flex gap-3 overflow-x-auto">
                {propertyImages.length > 0 ? (
                  propertyImages.map((imageUrl: string, index: number) => (
                    <div 
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer transition-all ${
                        index === selectedImageIndex 
                          ? 'border-2 border-sky-500 opacity-100' 
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={imageUrl} 
                        alt={`${selectedProperty.property_title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-sky-500">
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                      <Home className="w-6 h-6 text-slate-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Property Title and Location */}
            <div className="px-6 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProperty.property_title}</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <p className="text-sm">{selectedProperty.street_address}, {selectedProperty.city}</p>
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
                      <span className="text-lg font-bold text-gray-900">{selectedProperty.square_feet || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Price</h3>
                  <p className="text-2xl font-bold text-sky-600">₱{selectedProperty.price?.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">For {selectedProperty.listing_type === 'sale' ? 'Sale' : 'Rent'}</p>
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
                    {selectedProperty.features && selectedProperty.features.length > 0 ? (
                      selectedProperty.features.map((feature: string, index: number) => (
                        <span key={index} className="px-3 py-1.5 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
                          {feature}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No amenities listed</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        )
      })()}

      {/* Deactivate Confirmation Modal */}
      {deactivateConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setDeactivateConfirmId(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <Trash2 className="w-6 h-6" />
                <h3 className="text-xl font-bold text-gray-900">Deactivate Listing</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to deactivate this listing? It will be removed from public view and your listings table. You can contact an admin to reactivate it later.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeactivateConfirmId(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeactivateListing(deactivateConfirmId)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}