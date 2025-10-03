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
  }
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
      {/* Property Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-300 via-pink-200 to-blue-200">
        {/* Villa Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
          Villa
        </div>

        {/* Bookmark Button */}
        <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors">
          <Bookmark className="h-4 w-4 text-gray-600" />
        </button>

        {/* House Illustration */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          <div className="relative w-full h-32">
            {/* Simple house illustration */}
            <svg viewBox="0 0 200 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* House body */}
              <path d="M40 100V60L100 30L160 60V100H40Z" fill="#2C3E50" stroke="#1A252F" strokeWidth="2" />
              {/* Roof */}
              <path
                d="M30 60L100 20L170 60L160 65L100 30L40 65L30 60Z"
                fill="#34495E"
                stroke="#1A252F"
                strokeWidth="2"
              />
              {/* Windows */}
              <rect x="60" y="70" width="20" height="20" fill="#FDB813" />
              <rect x="120" y="70" width="20" height="20" fill="#FDB813" />
              {/* Door */}
              <rect x="90" y="75" width="20" height="25" fill="#8B4513" />
            </svg>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900">{property.name}</h3>
          <p className="text-xs text-gray-500 mt-1">{property.address}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span className="text-xs">{property.beds}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span className="text-xs">{property.baths}</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              <span className="text-xs">{property.sqft}</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-900">{property.price}</p>
        </div>
      </div>
    </Card>
  )
}
