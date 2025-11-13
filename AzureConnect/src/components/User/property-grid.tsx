"use client";

import { useState, useEffect } from "react";
import { PropertyCard } from "@/components/User/property-card";
import { PropertyDetailsPanel } from "@/components/User/propertry-details";
import { useBookmark } from "@/contexts/BookmarkContext";
import { Heart, Home } from "lucide-react";
import supabase from "@/supabaseClient";

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

interface PropertyGridProps {
  activeTab: string;
  onContactAgent?: (agentId: number, agentName: string) => void;
}

export function PropertyGrid({ activeTab, onContactAgent }: PropertyGridProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const { toggleBookmark, isBookmarked, bookmarkedProperties } = useBookmark();

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)

      // Fetch all available properties from listed_properties table
      const { data, error } = await supabase
        .from('listed_properties')
        .select('*')
        .eq('is_deleted', false)
        .eq('property_status', 'available')
        .eq('is_public', true)
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

  const handleBookmark = (propertyId: number) => {
    toggleBookmark(propertyId);
  };

  // Filter properties based on active tab
  const filteredProperties =
    activeTab === "Favorites"
      ? properties.filter((property) =>
          bookmarkedProperties.includes(property.id)
        )
      : properties;

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
      rating: "4.5", // Default rating for now
      images: images,
      propertyType: property.property_type
    }
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Scrollable Property Cards Container */}
        <div className="flex-1 overflow-y-auto pr-2 pt-[90px] lg:pt-[110px] scrollbar-hide">
          {loading ? (
            /* Loading State */
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading properties...</p>
              </div>
            </div>
          ) : activeTab === "Favorites" && filteredProperties.length === 0 ? (
            /* Empty State for Favorites */
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg max-w-md px-8">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-12 h-12 text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No favorites yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Start exploring properties and click the bookmark icon to save
                  your favorites here.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Home className="w-4 h-4" />
                  <span>{filteredProperties.length} Favorited Properties</span>
                </div>
              </div>
            </div>
          ) : filteredProperties.length === 0 ? (
            /* Empty State for No Properties */
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg max-w-md px-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Home className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No properties available
                </h3>
                <p className="text-slate-600">
                  Check back later for new listings.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={transformProperty(property)}
                  isBookmarked={isBookmarked(property.id)}
                  onBookmark={(propertyId) => handleBookmark(propertyId)}
                  onClick={() => setSelectedProperty(property)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedProperty && (
        <PropertyDetailsPanel
          property={transformProperty(selectedProperty)}
          onClose={() => setSelectedProperty(null)}
          onContactAgent={onContactAgent}
        />
      )}
    </>
  );
}
