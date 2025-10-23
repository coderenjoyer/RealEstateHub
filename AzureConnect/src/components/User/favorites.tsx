import { useBookmark } from '@/contexts/BookmarkContext'
import { PropertyCard } from './property-card'
import { Heart, Home } from 'lucide-react'

// Sample properties data - in a real app, this would come from an API
const sampleProperties = [
  {
    id: 1,
    name: "Aurelia Heights",
    address: "123 Skyline Drive, Cebu City",
    price: "₱100,000/month",
    beds: 3,
    baths: 2,
    sqft: 1200,
    rating: "4.55",
    images: ["/how-to-design-a-house.jpg", "/luxury-bedroom.jpg"]
  },
  {
    id: 2,
    name: "Oceanview Residences",
    address: "456 Coastal Road, Mandaue City",
    price: "₱85,000/month",
    beds: 2,
    baths: 2,
    sqft: 950,
    rating: "4.32",
    images: ["/office space.jpg", "/swimming_pool.jpg"]
  },
  {
    id: 3,
    name: "Garden Villa Estate",
    address: "789 Green Valley, Talisay City",
    price: "₱120,000/month",
    beds: 4,
    baths: 3,
    sqft: 1500,
    rating: "4.78",
    images: ["/luxury-bedroom.jpg", "/office space.jpg"]
  },
  {
    id: 4,
    name: "Modern Loft Apartments",
    address: "321 Business District, Cebu City",
    price: "₱75,000/month",
    beds: 1,
    baths: 1,
    sqft: 650,
    rating: "4.21",
    images: ["/how-to-design-a-house.jpg", "/swimming_pool.jpg"]
  },
  {
    id: 5,
    name: "Luxury Penthouse",
    address: "555 High Rise Avenue, Cebu City",
    price: "₱200,000/month",
    beds: 5,
    baths: 4,
    sqft: 2000,
    rating: "4.95",
    images: ["/luxury-bedroom.jpg", "/office space.jpg"]
  }
]

export function FavoritesPage() {
  const { bookmarkedProperties, toggleBookmark, isBookmarked } = useBookmark()
  
  // Show all properties, but highlight the bookmarked ones
  const favoriteProperties = sampleProperties.filter(property => 
    bookmarkedProperties.includes(property.id)
  )

  const handleBookmark = (propertyId: number, isBookmarked: boolean) => {
    toggleBookmark(propertyId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300/95 via-blue-200/95 to-blue-300/95 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Heart className="w-6 h-6 text-yellow-600 fill-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Favorites</h1>
              <p className="text-slate-600">Properties you've saved for later</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span>{favoriteProperties.length} Favorited Properties</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>Saved Properties</span>
            </div>
          </div>
        </div>

        {/* Favorites Only */}
        {favoriteProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isBookmarked={isBookmarked(property.id)}
                onBookmark={handleBookmark}
                onClick={() => {
                  console.log('Property clicked:', property.name)
                }}
              />
            ))}
          </div>
        ) : (
          /* Empty State for Favorites */
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No favorites yet</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Start exploring properties and click the bookmark icon to save your favorites here.
            </p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Browse Properties
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
