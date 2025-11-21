import { Card } from "@/components/ui/card";
import { Bookmark, Bed, Bath, Maximize } from "lucide-react";
import { useState } from "react";

interface PropertyCardProps {
  property: {
    id: number;
    name: string;
    address: string;
    price: string;
    beds: number;
    baths: number;
    sqft: number;
    images?: string[];
    propertyType?: string;
  };
  onClick?: () => void;
  onBookmark?: (propertyId: number) => void;
  isBookmarked?: boolean;
}

export function PropertyCard({
  property,
  onClick,
  onBookmark,
  isBookmarked = false,
}: PropertyCardProps) {
  // Default images if none provided
  const defaultImages: string[] = [
    "/how-to-design-a-house.jpg",
    "/luxury-bedroom.jpg",
    "/office space.jpg",
    "/swimming_pool.jpg",
  ];

  const images = property.images && property.images.length > 0 ? property.images : defaultImages;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImageClick = (index: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click when clicking on thumbnail
    setSelectedImageIndex(index);
  };

  const handleBookmarkClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click when clicking on bookmark
    onBookmark?.(property.id);
  };

  const formatPrice = (price: string): string => {
    if (price.includes('₱')) {
      return price;
    }
    
    // Otherwise, parse as numeric price
    const numericPrice = parseInt(price, 10);
    if (isNaN(numericPrice)) return "₱0";
    return `₱${numericPrice.toLocaleString()}`;
  };

  return (
    <Card
      onClick={onClick}
      className="overflow-hidden bg-white rounded-3xl transition-all duration-300 cursor-pointer"
      style={{
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.08)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 50px -10px rgba(0, 0, 0, 0.25), 0 8px 16px -4px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.08)';
      }}
    >
      {/* Property Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={images[selectedImageIndex]}
          alt={property.name}
          className="w-full h-full object-cover"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        {/* Property Type Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-4 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm">
            {property.propertyType || 'Property'}
          </span>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkClick}
          className={`absolute top-4 right-4 p-2 backdrop-blur-sm rounded-xl transition-all duration-200 shadow-sm ${
            isBookmarked
              ? "bg-yellow-400/95 hover:bg-yellow-500"
              : "bg-white/95 hover:bg-white"
          }`}
          title={isBookmarked ? "Remove from favorites" : "Add to favorites"}
        >
          <Bookmark
            className={`h-4 w-4 transition-colors duration-200 ${
              isBookmarked ? "text-yellow-800 fill-yellow-800" : "text-gray-600"
            }`}
          />
        </button>
      </div>

      {/* Thumbnail Images */}
      <div className="flex gap-2 p-3 bg-gray-50">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={(e) => handleImageClick(index, e)}
            className={`flex-1 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
              selectedImageIndex === index
                ? "ring-2 ring-[#49769F] ring-offset-2"
                : "hover:opacity-80"
            }`}
          >
            <img
              src={image}
              alt={`${property.name} view ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Property Details */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-base mb-1">
              {property.name}
            </h3>
            <p className="text-xs text-gray-500">{property.address}</p>
          </div>
          
          {/* Property Price - Right aligned */}
          <div className="text-right">
            <p className="text-xl font-bold text-green-600">
              {formatPrice(property.price)}
            </p>
          </div>
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
        </div>
      </div>
    </Card>
  );
}