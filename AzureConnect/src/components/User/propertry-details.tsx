import { useState, useEffect } from "react";
import { X, Star, MapPin, Bed, Bath, Maximize } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import supabase from "@/supabaseClient";

interface PropertyDetailsPanelProps {
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
  propertyId: number;
  onClose: () => void;
  onContactAgent?: (agentId: string, agentName: string, agentAvatar?: string | null) => void;
}

interface PropertyDetails {
  id: number;
  property_title: string;
  property_type: string;
  listing_type: string;
  property_status: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number | null;
  lot_size: number | null;
  year_built: number | null;
  parking_spaces: number | null;
  available_from: string | null;
  furnished: string | null;
  pet_policy: string | null;
  street_address: string;
  city: string;
  state: string | null;
  zip_postal: string;
  country: string;
  description: string;
  about_property: string | null;
  full_name: string;
  email: string;
  phone_number: string;
  features: string[] | null;
  utilities: string[] | null;
  nearby_places: any[] | null;
  media: any[] | null;
  user_id: string;
  created_at: string;
}

interface AgentInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
}

export function PropertyDetailsPanel({
  property,
  propertyId,
  onClose,
  onContactAgent,
}: PropertyDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "about">(
    "overview"
  );
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch property details from database
  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);

      // Fetch property details
      const { data: propertyData, error: propertyError } = await supabase
        .from('listed_properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (propertyError) {
        return;
      }

      setPropertyDetails(propertyData);

      // Fetch agent information using the contact info from the property
      if (propertyData?.user_id) {
        
        // Use the contact information already in the property listing
        const agentName = propertyData.full_name || 'Property Agent';
        const agentEmail = propertyData.email || '';
        const agentPhone = propertyData.phone_number || '';
        
        // Get agent avatar from storage
        const { data: avatarData } = supabase.storage
          .from('user-media')
          .getPublicUrl(`${propertyData.user_id}/profile.jpg`);

        setAgentInfo({
          id: propertyData.user_id,
          name: agentName,
          email: agentEmail,
          phone: agentPhone,
          avatar: avatarData?.publicUrl || null,
        });
      }
    } catch (error) {
      // Error fetching property details
    } finally {
      setLoading(false);
    }
  };

  // Default images if none provided
  const defaultImages = [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
  ];

  // Get images from database media or use defaults
  const getImages = () => {
    if (propertyDetails?.media && propertyDetails.media.length > 0) {
      return propertyDetails.media.map((item: any) => 
        supabase.storage.from('property-media').getPublicUrl(item.bucket_path).data.publicUrl
      );
    }
    return property.images || defaultImages;
  };

  const images = getImages();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleContactAgentClick = () => {
    if (agentInfo && onContactAgent) {
      onContactAgent(agentInfo.id, agentInfo.name, agentInfo.avatar);
      // Close the property details panel after contacting agent
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-end p-8"
      onClick={onClose}
    >
      <Card
        className="w-[500px] h-[calc(100vh-4rem)] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Image Gallery */}
        <div className="relative">
          {/* Main Image */}
          <div className="h-48 relative overflow-hidden">
            <img
              src={images[selectedImageIndex]}
              alt={property.name}
              className="w-full h-full object-cover"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 bg-white/95 backdrop-blur-sm rounded-xl hover:bg-white transition-all shadow-md z-10"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Property Type Badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="px-4 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm">
                {loading ? "Loading..." : (propertyDetails?.property_type || property.propertyType || "Property")}
              </span>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          <div className="px-6 py-4 flex gap-3">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleImageClick(index)}
                className={`w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 ${
                  selectedImageIndex === index
                    ? "border-2 border-[#49769F] opacity-100"
                    : "opacity-60 hover:opacity-100 border-2 border-transparent"
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
        </div>

        {/* Property Title and Location */}
        <div className="px-6 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {property.name}
          </h2>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <p className="text-sm">{property.address}</p>
          </div>

          {/* Agent Information Display */}
          {agentInfo && (
            <div className="mt-4 bg-[#49769F]/5 rounded-2xl p-4 border border-[#49769F]/20">
              <div className="flex items-center gap-3">
                {/* Agent Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-[#49769F] flex items-center justify-center text-white font-semibold text-base overflow-hidden border-2 border-white shadow-md">
                    {agentInfo.avatar ? (
                      <img 
                        src={agentInfo.avatar} 
                        alt={agentInfo.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.textContent = agentInfo.name.substring(0, 2).toUpperCase();
                        }}
                      />
                    ) : (
                      agentInfo.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white" />
                </div>

                {/* Agent Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {agentInfo.name}
                  </h3>
                  <p className="text-xs text-gray-500">Property Agent</p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Agent Button */}
          <Button
            onClick={handleContactAgentClick}
            className={`w-full mt-4 rounded-full py-6 font-medium text-sm transition-all duration-200 ${
              agentInfo
                ? "bg-[#49769F] hover:bg-[#49769F]/90 text-white shadow-lg shadow-[#49769F]/30 cursor-pointer hover:scale-[1.02]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!agentInfo || loading}
          >
            {loading ? "Loading..." : (agentInfo ? "Contact Agent ➜" : "No Agent Available")}
          </Button>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 font-semibold text-sm transition-all ${
              activeTab === "overview"
                ? "text-gray-900 border-b-2 border-[#49769F]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`pb-3 font-semibold text-sm transition-all ${
              activeTab === "about"
                ? "text-gray-900 border-b-2 border-[#49769F]"
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
                <h3 className="font-semibold text-gray-900 mb-3">
                  Property Details
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl">
                    <Bed className="h-5 w-5 text-[#49769F]" />
                    <span className="text-sm font-medium text-gray-600">
                      Bedrooms
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {property.beds}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl">
                    <Bath className="h-5 w-5 text-[#49769F]" />
                    <span className="text-sm font-medium text-gray-600">
                      Bathrooms
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {property.baths}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl">
                    <Maximize className="h-5 w-5 text-[#49769F]" />
                    <span className="text-sm font-medium text-gray-600">
                      Sq Ft
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {property.sqft}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Price</h3>
                <p className="text-2xl font-bold text-[#49769F]">
                  {property.price}
                </p>
                {propertyDetails && (
                  <p className="text-xs text-gray-500 mt-1">
                    {propertyDetails.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {loading ? "Loading description..." : (propertyDetails?.description || "No description available.")}
                </p>
              </div>

              {propertyDetails?.features && propertyDetails.features.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {propertyDetails.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1.5 bg-[#49769F]/10 text-[#49769F] rounded-full text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {propertyDetails?.parking_spaces !== null && propertyDetails?.parking_spaces !== undefined && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Additional Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    {propertyDetails?.parking_spaces > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Parking Spaces</span>
                        <span className="font-medium text-gray-900">{propertyDetails?.parking_spaces}</span>
                      </div>
                    )}
                    {propertyDetails?.year_built && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Year Built</span>
                        <span className="font-medium text-gray-900">{propertyDetails?.year_built}</span>
                      </div>
                    )}
                    {propertyDetails?.lot_size && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Lot Size</span>
                        <span className="font-medium text-gray-900">{propertyDetails?.lot_size} sqm</span>
                      </div>
                    )}
                    {propertyDetails?.furnished && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Furnished</span>
                        <span className="font-medium text-gray-900">{propertyDetails?.furnished}</span>
                      </div>
                    )}
                    {propertyDetails?.pet_policy && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pet Policy</span>
                        <span className="font-medium text-gray-900">{propertyDetails?.pet_policy}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-4">
              {propertyDetails?.about_property && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    About This Property
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {propertyDetails.about_property}
                  </p>
                </div>
              )}

              {agentInfo && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Agent Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Name</span>
                      <span className="font-medium text-gray-900">{agentInfo.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium text-gray-900">{agentInfo.email}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-medium text-gray-900">{agentInfo.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {propertyDetails?.nearby_places && propertyDetails.nearby_places.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Nearby Places</h3>
                  <div className="space-y-2">
                    {propertyDetails.nearby_places.map((place: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{place.name}</span>
                        <span className="font-medium text-gray-900">{place.distance_km} km</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {propertyDetails?.utilities && propertyDetails.utilities.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Utilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {propertyDetails.utilities.map((utility: string) => (
                      <span
                        key={utility}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                      >
                        {utility}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
