import { useState } from "react"
import { X, Star, MapPin, Bed, Bath, Maximize } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PropertyDetailsPanelProps {
  property: {
    id: number
    name: string
    address: string
    price: string
    beds: number
    baths: number
    sqft: number
    rating: string
  }
  onClose: () => void
}

export function PropertyDetailsPanel({ property, onClose }: PropertyDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "reviews" | "about">("overview")

  const reviews = [
    {
      id: 1,
      text: "Spdnckd dkrf vdkxn. The management here really understood our needs during move in very accommodating during move process.",
      rating: 5,
      author: "Mark L."
    },
    {
      id: 2,
      text: "Spdnckd dkrf vdkxn. The management here really understood our needs during move in very accommodating during process.",
      rating: 5,
      author: "Sarah M."
    },
    {
      id: 3,
      text: "Spdnckd dkrf vdkxn. The management here really understood our needs during move in very accommodating during move process.",
      rating: 4,
      author: "James K."
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-end p-8" onClick={onClose}>
      <Card className="w-[500px] h-[calc(100vh-4rem)] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
        
        {/* Header with Image Gallery */}
        <div className="relative">
          {/* Main Image */}
          <div className="h-48 bg-gradient-to-br from-rose-300 via-pink-200 to-rose-200 relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 bg-white/95 backdrop-blur-sm rounded-xl hover:bg-white transition-all shadow-md z-10"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Villa Badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="px-4 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm">
                Villa
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
              <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=200&fit=crop" alt="Property" className="w-full h-full object-cover" />
            </div>
            <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
              <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop" alt="Property" className="w-full h-full object-cover" />
            </div>
            <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
              <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=200&fit=crop" alt="Property" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Property Title and Location */}
        <div className="px-6 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{property.name}</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <p className="text-sm">{property.address}</p>
          </div>
          
          {/* Contact Agent Button */}
          <Button className="w-full mt-4 bg-sky-500 hover:bg-sky-600 text-white rounded-full py-6 font-semibold shadow-lg shadow-sky-500/30">
            Contact Agent ➜
          </Button>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 font-semibold text-sm transition-all ${
              activeTab === "overview"
                ? "text-gray-900 border-b-2 border-sky-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 font-semibold text-sm transition-all ${
              activeTab === "reviews"
                ? "text-gray-900 border-b-2 border-sky-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Reviews
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`pb-3 font-semibold text-sm transition-all ${
              activeTab === "about"
                ? "text-gray-900 border-b-2 border-sky-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            About
          </button>
        </div>

        {/* Tab Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl">
                    <Bed className="h-5 w-5 text-sky-600" />
                    <span className="text-sm font-medium text-gray-600">Bedrooms</span>
                    <span className="text-lg font-bold text-gray-900">{property.beds}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl">
                    <Bath className="h-5 w-5 text-sky-600" />
                    <span className="text-sm font-medium text-gray-600">Bathrooms</span>
                    <span className="text-lg font-bold text-gray-900">{property.baths}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl">
                    <Maximize className="h-5 w-5 text-sky-600" />
                    <span className="text-sm font-medium text-gray-600">Sq Ft</span>
                    <span className="text-lg font-bold text-gray-900">{property.sqft}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Price</h3>
                <p className="text-2xl font-bold text-sky-600">{property.price}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Beautiful villa located in a prime location with modern amenities and spacious rooms. 
                  Perfect for families looking for comfort and convenience. Features include a modern kitchen, 
                  large living area, and well-maintained garden.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {["Parking", "Garden", "Pool", "Gym", "Security"].map((amenity) => (
                    <span key={amenity} className="px-3 py-1.5 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-sky-50 rounded-2xl p-4">
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.text}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">{review.author}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">About This Property</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Aurelia Heights represents modern luxury living at its finest. Built in 2020, this property 
                  offers state-of-the-art facilities and premium finishes throughout.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The development features 24/7 security, beautifully landscaped grounds, and is conveniently 
                  located near schools, shopping centers, and major transport links.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Nearby</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Shopping Mall</span>
                    <span className="font-medium text-gray-900">0.5 km</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Schools</span>
                    <span className="font-medium text-gray-900">1.2 km</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Hospital</span>
                    <span className="font-medium text-gray-900">2.0 km</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Public Transport</span>
                    <span className="font-medium text-gray-900">0.3 km</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}