import { useBookmark } from '@/contexts/BookmarkContext'
import { PropertyCard } from './property-card'
import { Heart, Home } from 'lucide-react'
import { useState, useEffect } from 'react'
import supabase from '@/supabaseClient'
import { useAuth } from '@/AuthContext'

interface Property {
  id: number
  property_title: string
  street_address: string
  city: string
  price: number
  bedrooms: number
  bathrooms: number
  square_feet: number | null
  property_type: string
  listing_type: string
  media?: any
  user_id: string
}

export default function FavoritesPage() {
  const { bookmarkedProperties, toggleBookmark, isBookmarked, loading: bookmarksLoading } = useBookmark()
  const { session } = useAuth()
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch favorite properties from database
  useEffect(() => {
    if (session?.user?.id && bookmarkedProperties.length > 0) {
      fetchFavoriteProperties()
    } else {
      setFavoriteProperties([])
      setLoading(false)
    }
  }, [bookmarkedProperties, session?.user?.id])

  const fetchFavoriteProperties = async () => {
    try {
      setLoading(true)

      // Fetch properties that are in the bookmarked list
      const { data, error } = await supabase
        .from('listed_properties')
        .select('*')
        .in('id', bookmarkedProperties)
        .eq('is_deleted', false)
        .eq('is_public', true)

      if (error) {
        console.error('Error fetching favorite properties:', error)
        return
      }

      setFavoriteProperties(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookmark = (propertyId: number) => {
    toggleBookmark(propertyId)
  }

  // Transform database property to card format
  const transformProperty = (property: Property) => {
    // Get images from media array
    const images = property.media && property.media.length > 0
      ? property.media.map((item: any) => 
          supabase.storage.from('property-media').getPublicUrl(item.bucket_path).data.publicUrl
        )
      : undefined

    return {
      id: property.id,
      name: property.property_title,
      address: `${property.street_address}, ${property.city}`,
      price: `₱${property.price.toLocaleString()}/${property.listing_type === 'sale' ? 'total' : 'month'}`,
      beds: property.bedrooms,
      baths: property.bathrooms,
      sqft: property.square_feet || 0,
      rating: "4.5",
      images: images,
      propertyType: property.property_type
    }
  }

  return (
    <div className="min-h-screen bg-[#F0FFFF] p-4 sm:p-6 lg:p-8">
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

        {/* Loading State */}
        {loading || bookmarksLoading ? (
          <div className="flex items-center justify-center h-[calc(100vh-300px)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#49769F] mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your favorites...</p>
            </div>
          </div>
        ) : favoriteProperties.length > 0 ? (
          /* Favorites Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={transformProperty(property)}
                isBookmarked={isBookmarked(property.id)}
                onBookmark={handleBookmark}
                onClick={() => {
                  console.log('Property clicked:', property.property_title)
                }}
              />
            ))}
          </div>
        ) : (
          /* Empty State for Favorites */
          <div className="flex items-center justify-center h-[calc(100vh-300px)]">
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg max-w-md px-8">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No favorites yet</h3>
              <p className="text-slate-600 mb-6">
                Start exploring properties and click the bookmark icon to save your favorites here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
