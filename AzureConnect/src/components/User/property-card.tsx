import { Card } from "@/components/ui/card"
import { Bookmark, Bed, Bath, Maximize } from "lucide-react"

interface PropertyCardProps {
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
  onClick?: () => void
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  return (
    <Card 
      onClick={onClick}
      className="overflow-hidden bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* Property Image with Gradient */}
      <div className="relative h-48">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-300 via-pink-200 to-sky-200"></div>
        
        {/* Villa Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-4 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm">
            Villa
          </span>
        </div>

        {/* Bookmark Button */}
        <button className="absolute top-4 right-4 p-2 bg-white/95 backdrop-blur-sm rounded-xl hover:bg-white transition-colors shadow-sm">
          <Bookmark className="h-4 w-4 text-gray-600" />
        </button>

        {/* House Illustration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 280 120" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Main House Body */}
            <path d="M60 120V75L140 40L220 75V120H60Z" fill="#1e293b" />
            {/* Roof */}
            <path d="M45 75L140 25L235 75L220 80L140 40L60 80L45 75Z" fill="#334155" />
            {/* Roof Detail */}
            <ellipse cx="140" cy="50" rx="15" ry="8" fill="#475569" />
            {/* Windows */}
            <rect x="85" y="85" width="28" height="25" rx="2" fill="#fbbf24" />
            <rect x="167" y="85" width="28" height="25" rx="2" fill="#fbbf24" />
            {/* Window Panes */}
            <line x1="99" y1="85" x2="99" y2="110" stroke="#1e293b" strokeWidth="2" />
            <line x1="85" y1="97.5" x2="113" y2="97.5" stroke="#1e293b" strokeWidth="2" />
            <line x1="181" y1="85" x2="181" y2="110" stroke="#1e293b" strokeWidth="2" />
            <line x1="167" y1="97.5" x2="195" y2="97.5" stroke="#1e293b" strokeWidth="2" />
            {/* Door */}
            <rect x="125" y="90" width="30" height="30" rx="2" fill="#78350f" />
            <circle cx="148" cy="105" r="2" fill="#fbbf24" />
          </svg>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-base mb-1">{property.name}</h3>
          <p className="text-xs text-gray-500">{property.address}</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Bed className="h-4 w-4" />
              <span className="text-sm font-medium">{property.beds}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Bath className="h-4 w-4" />
              <span className="text-sm font-medium">{property.baths}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Maximize className="h-4 w-4" />
              <span className="text-sm font-medium">{property.sqft}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-orange-400 text-sm">★</span>
            <span className="text-sm font-semibold text-gray-900">{property.rating}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}