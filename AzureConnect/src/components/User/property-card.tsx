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
      {/* Property Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src="/how-to-design-a-house.jpg" 
          alt={property.name}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
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