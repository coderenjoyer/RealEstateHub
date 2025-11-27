import {
  User,
  Home,
  Bookmark,
  CheckCircle,
  MapPin,
  Pencil,
  X,
  Bed,
  Bath,
  Maximize,
} from "lucide-react";
import { useState, useEffect } from "react";
import supabase from "../../../supabaseClient";
import { useAuth } from "../../../AuthContext";

interface RecentProperty {
  id: number;
  property_title: string;
  street_address: string;
  city: string;
  price: number;
  property_status: string;
  created_at: string;
  media?: any;
}

interface ListedProperty {
  id: number;
  property_title: string;
  street_address: string;
  city: string;
  price: number;
  property_type: string;
  listing_type: string;
  property_status?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  description?: string | null;
  square_feet?: number | null;
  parking_spaces?: number | null;
  year_built?: number | null;
  features?: string[] | null;
  lot_size?: number | null;
  available_from?: string | null;
  furnished?: string | null;
  pet_policy?: string | null;
  about_property?: string | null;
  utilities?: string[] | null;
  nearby_places?: any[] | null;
  zip_postal?: string | null;
  country?: string | null;
  state?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  user_id?: string | null;
  media?: any;
}

export function AgentProfileCards() {
  const { session } = useAuth();
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeListings, setActiveListings] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>(
    []
  );
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [listedProperties, setListedProperties] = useState<ListedProperty[]>(
    []
  );
  const [loadingListed, setLoadingListed] = useState(true);
  const [selectedProperty, setSelectedProperty] =
    useState<ListedProperty | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "about">("overview");

  // About Me states
  const [aboutData, setAboutData] = useState({
    bio: "",
    specializations: [""],
    languages: "",
    certifications: [""],
  });

  // Temporary editing states
  const [tempAboutData, setTempAboutData] = useState(aboutData);
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchAboutData();
    fetchPropertyStats();
    fetchRecentProperties();
    fetchListedProperties();
  }, []);

  const fetchAboutData = async () => {
    try {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error) throw error;

      // Try to fetch from profiles table first
      if (userData?.user?.id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('bio, specializations, languages, certifications')
          .eq('user_id', userData.user.id)
          .single();

        if (profileData && !profileError) {
          const aboutData = {
            bio: profileData.bio || "",
            specializations: (profileData.specializations && profileData.specializations.length > 0) ? profileData.specializations : [""],
            languages: profileData.languages || "",
            certifications: (profileData.certifications && profileData.certifications.length > 0) ? profileData.certifications : [""],
          };
          setAboutData(aboutData);
          setTempAboutData(aboutData);
          return;
        }
      }

      // Fallback to auth metadata if not in profiles table
      const savedAbout = userData.user?.user_metadata?.about;
      if (savedAbout) {
        setAboutData(savedAbout);
        setTempAboutData(savedAbout);
      }
    } catch (error) {
      console.error("Error fetching about data:", error);
    }
  };

  const fetchPropertyStats = async () => {
    try {
      setLoadingStats(true);

      if (!session?.user?.id) {
        return;
      }

      // Fetch active listings count from listed_properties (approved properties)
      const { count, error } = await supabase
        .from("listed_properties")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .eq("is_deleted", false)
        .eq("property_status", "available");

      if (error) {
        console.error("Error fetching active listings:", error);
      } else {
        setActiveListings(count || 0);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecentProperties = async () => {
    try {
      setLoadingRecent(true);

      if (!session?.user?.id) {
        return;
      }

      // Fetch recent properties from listed_properties (approved properties) - last 3
      const { data, error } = await supabase
        .from("listed_properties")
        .select(
          "id, property_title, street_address, city, price, property_status, created_at, media"
        )
        .eq("user_id", session.user.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching recent properties:", error);
      } else {
        setRecentProperties(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingRecent(false);
    }
  };

  const fetchListedProperties = async () => {
    try {
      setLoadingListed(true);

      if (!session?.user?.id) {
        return;
      }

      // Fetch 4 most recent properties from listed_properties (approved properties)
      const { data, error } = await supabase
        .from("listed_properties")
        .select(
          "id, property_title, street_address, city, price, property_type, listing_type, property_status, bedrooms, bathrooms, description, square_feet, parking_spaces, year_built, features, media, lot_size, available_from, furnished, pet_policy, about_property, utilities, nearby_places, zip_postal, country, state, full_name, email, phone_number, user_id"
        )
        .eq("user_id", session.user.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Error fetching listed properties:", error);
      } else {
        const normalized =
          data?.map((item: any) => ({
            ...item,
            features: Array.isArray(item.features)
              ? item.features
              : item.features
              ? [item.features]
              : [],
            utilities: Array.isArray(item.utilities)
              ? item.utilities
              : item.utilities
              ? [item.utilities]
              : [],
            nearby_places: Array.isArray(item.nearby_places)
              ? item.nearby_places
              : item.nearby_places
              ? [item.nearby_places]
              : [],
          })) || [];
        setListedProperties(normalized);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingListed(false);
    }
  };

  const handleEditAbout = () => {
    setTempAboutData(aboutData);
    setIsEditingAbout(true);
  };

  const handleCancelEdit = () => {
    setTempAboutData(aboutData);
    setNewSpecialization("");
    setNewCertification("");
    setIsEditingAbout(false);
  };

  const handleSaveAbout = async () => {
    setShowConfirmModal(true);
  };

  const confirmSaveAbout = async () => {
    try {
      setSaving(true);
      setShowConfirmModal(false);

      // Save to auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          about: tempAboutData,
        },
      });

      if (authError) {
        console.error("Error saving to auth:", authError);
      }

      // Also save to profiles table for easy retrieval
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          bio: tempAboutData.bio,
          specializations: tempAboutData.specializations,
          languages: tempAboutData.languages,
          certifications: tempAboutData.certifications,
        })
        .eq('user_id', session?.user?.id);

      if (profileError) {
        console.error("Error saving to profiles table:", profileError);
        return;
      }

      setAboutData(tempAboutData);
      setIsEditingAbout(false);
      setNewSpecialization("");
      setNewCertification("");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const addSpecialization = () => {
    if (newSpecialization.trim()) {
      setTempAboutData({
        ...tempAboutData,
        specializations: [
          ...tempAboutData.specializations,
          newSpecialization.trim(),
        ],
      });
      setNewSpecialization("");
    }
  };

  const removeSpecialization = (index: number) => {
    setTempAboutData({
      ...tempAboutData,
      specializations: tempAboutData.specializations.filter(
        (_, i) => i !== index
      ),
    });
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setTempAboutData({
        ...tempAboutData,
        certifications: [
          ...tempAboutData.certifications,
          newCertification.trim(),
        ],
      });
      setNewCertification("");
    }
  };

  const handleViewDetails = (property: ListedProperty) => {
    setSelectedProperty(property);
    setIsDetailsModalOpen(true);
    setSelectedImageIndex(0);
    setActiveTab("overview");
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedProperty(null);
  };

  const removeCertification = (index: number) => {
    setTempAboutData({
      ...tempAboutData,
      certifications: tempAboutData.certifications.filter(
        (_, i) => i !== index
      ),
    });
  };

  return (
    <div className="bg-[#BDD8E9] px-4 sm:px-8 py-8">
      <div className="max-w-7xl min-w-[375px] mx-auto space-y-6">
        {/* Top Row - About Me and Property Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* About Me Card */}
          <div className="bg-[#FFFFFF] rounded-2xl shadow-md overflow-hidden">
            <div className="bg-[#49769F] text-[#F0FFFF] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FFFFFF]/20 rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">About Me</h3>
              </div>
              {!isEditingAbout && (
                <button
                  onClick={handleEditAbout}
                  className="p-2 bg-[#FFFFFF]/20 hover:bg-[#FFFFFF]/40 rounded-lg transition-colors"
                  title="Edit About Me"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="sm:p-6 p-4 space-y-4 text-[#0A4174]">
              {/* Bio */}
              <div>
                {isEditingAbout ? (
                  <textarea
                    value={tempAboutData.bio}
                    onChange={(e) =>
                      setTempAboutData({
                        ...tempAboutData,
                        bio: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-[#49769F]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49769F] text-[#0A4174] leading-relaxed resize-none bg-[#F0FFFF]"
                    rows={4}
                    placeholder="Write your bio..."
                  />
                ) : (
                  <p className="text-[#0A4174] leading-relaxed">
                    {aboutData.bio}
                  </p>
                )}
              </div>

              {/* Specializations */}
              <div className="space-y-3">
                <h4 className="font-semibold text-[#0A4174]">
                  Specializations:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(isEditingAbout
                    ? tempAboutData.specializations
                    : aboutData.specializations
                  ).map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#49769F]/15 text-[#0A4174] rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {spec}
                      {isEditingAbout && (
                        <button
                          onClick={() => removeSpecialization(index)}
                          className="hover:bg-[#49769F]/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditingAbout && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && addSpecialization()
                      }
                      className="flex-1 px-3 py-1.5 text-sm border border-[#49769F]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49769F] bg-[#F0FFFF]"
                      placeholder="Add specialization..."
                    />
                    <button
                      onClick={addSpecialization}
                      className="px-3 py-1.5 bg-[#49769F] text-[#F0FFFF] text-sm font-medium rounded-lg hover:bg-[#0A4174] transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Languages */}
              <div className="space-y-3">
                <h4 className="font-semibold text-[#0A4174]">Languages:</h4>
                {isEditingAbout ? (
                  <input
                    type="text"
                    value={tempAboutData.languages}
                    onChange={(e) =>
                      setTempAboutData({
                        ...tempAboutData,
                        languages: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 text-sm border border-[#49769F]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49769F] bg-[#F0FFFF]"
                    placeholder="e.g., English, Filipino, Mandarin Chinese"
                  />
                ) : (
                  <p className="text-[#49769F] text-sm">
                    {aboutData.languages}
                  </p>
                )}
              </div>

              {/* Certifications */}
              <div className="space-y-3">
                <h4 className="font-semibold text-[#0A4174]">
                  Certifications:
                </h4>
                <ul className="space-y-1 text-sm text-[#49769F]">
                  {(isEditingAbout
                    ? tempAboutData.certifications
                    : aboutData.certifications
                  ).map((cert, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#49769F] flex-shrink-0" />
                      <span className="flex-1">{cert}</span>
                      {isEditingAbout && (
                        <button
                          onClick={() => removeCertification(index)}
                          className="hover:bg-[#F0FFFF] rounded p-1"
                        >
                          <X className="w-3 h-3 text-[#49769F]" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                {isEditingAbout && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && addCertification()
                      }
                      className="flex-1 px-3 py-1.5 text-sm border border-[#49769F]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49769F] bg-[#F0FFFF]"
                      placeholder="Add certification..."
                    />
                    <button
                      onClick={addCertification}
                      className="px-3 py-1.5 bg-[#49769F] text-[#F0FFFF] text-sm font-medium rounded-lg hover:bg-[#0A4174] transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Edit Actions */}
              {isEditingAbout && (
                <div className="flex gap-3 pt-4 border-t border-[#F0FFFF]">
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex-1 px-4 py-2 border border-[#49769F]/30 text-[#49769F] rounded-lg hover:bg-[#F0FFFF] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAbout}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-[#49769F] hover:bg-[#0A4174] text-[#F0FFFF] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Property Summary Card */}
          <div className="bg-[#FFFFFF] rounded-2xl shadow-md overflow-hidden">
            <div className="bg-[#49769F] text-[#F0FFFF] px-6 py-4 flex items-center gap-3">
              <div className="p-2 bg-[#FFFFFF]/20 rounded-lg">
                <Home className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Property Summary</h3>
            </div>
            <div className="sm:p-6 p-4 text-[#0A4174]">
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="bg-gradient-to-br from-[#F0FFFF] to-[#FFFFFF] rounded-xl p-4 border border-[#49769F]/30">
                  <p className="text-sm text-[#0A4174] font-semibold mb-1">
                    Active Listings
                  </p>
                  <p className="text-3xl font-bold text-[#49769F]">
                    {loadingStats ? "..." : activeListings}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-[#0A4174]">
                  Recent Activity
                </h4>
                <div className="space-y-2">
                  {loadingRecent ? (
                    <div className="p-4 text-center text-[#49769F]">
                      <p className="text-sm">Loading recent properties...</p>
                    </div>
                  ) : recentProperties.length === 0 ? (
                    <div className="p-4 text-center text-[#49769F]">
                      <p className="text-sm">No recent properties found</p>
                    </div>
                  ) : (
                    recentProperties.map((property) => {
                      // Get first image from media array if available
                      const firstImage =
                        property.media && property.media.length > 0
                          ? property.media[0].bucket_path
                          : null;

                      // Get public URL if image exists from property-media bucket
                      const imageUrl = firstImage
                        ? supabase.storage
                            .from("property-media")
                            .getPublicUrl(firstImage).data.publicUrl
                        : "/cozy-suburban-house.png";

                      return (
                        <div
                          key={property.id}
                          className="flex items-center gap-3 p-3 bg-[#F0FFFF] rounded-lg hover:bg-[#FFFFFF] transition-colors"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#49769F]/10">
                            <img
                              src={imageUrl}
                              alt={property.property_title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[#0A4174] text-sm truncate">
                              {property.property_title}
                            </p>
                            <p className="text-xs text-[#49769F]">
                              {property.street_address}, {property.city}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#49769F] text-sm">
                              ₱{property.price.toLocaleString()}
                            </p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                property.property_status === "available"
                                  ? "bg-[#49769F]/15 text-[#0A4174]"
                                  : property.property_status === "sold"
                                  ? "bg-[#0A4174]/10 text-[#0A4174]"
                                  : property.property_status === "rented"
                                  ? "bg-[#49769F]/15 text-[#0A4174]"
                                  : "bg-[#FFFFFF]/40 text-[#49769F]"
                              }`}
                            >
                              {property.property_status
                                .charAt(0)
                                .toUpperCase() +
                                property.property_status.slice(1)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Listed Properties */}
        <div className="bg-[#FFFFFF] rounded-2xl shadow-md overflow-hidden">
          <div className="bg-[#49769F] text-[#F0FFFF] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFFFFF]/20 rounded-lg">
                <Bookmark className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Agent Listed Properties</h3>
            </div>
            <span className="text-sm bg-[#FFFFFF]/20 px-3 py-1 rounded-full">
              {loadingListed ? "..." : listedProperties.length} properties
            </span>
          </div>
          <div className="p-6">
            {loadingListed ? (
              <div className="p-8 text-center text-[#49769F]">
                <p className="text-sm">Loading properties...</p>
              </div>
            ) : listedProperties.length === 0 ? (
              <div className="p-8 text-center text-[#49769F]">
                <p className="text-sm">No properties listed yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listedProperties.map((property) => {
                  // Get first image from media array if available
                  const firstImage =
                    property.media && property.media.length > 0
                      ? property.media[0].bucket_path
                      : null;

                  // Get public URL if image exists from property-media bucket
                  const imageUrl = firstImage
                    ? supabase.storage
                        .from("property-media")
                        .getPublicUrl(firstImage).data.publicUrl
                    : null;

                  return (
                    <div
                      key={property.id}
                      className="border border-[#F0FFFF] rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-[#FFFFFF]"
                    >
                      <div className="h-32 sm:h-40 bg-gradient-to-br from-[#0A4174]/20 to-[#49769F]/30 relative">
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt={property.property_title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 bg-[#F0FFFF]/90 backdrop-blur-sm rounded-full text-xs font-semibold text-[#0A4174]">
                            {property.property_type}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4">
                        <h4 className="text-sm sm:text-base font-semibold text-[#0A4174] mb-2">
                          {property.property_title}
                        </h4>
                        <div className="flex items-center gap-2 text-[#49769F] text-xs sm:text-sm mb-2 sm:mb-3">
                          <MapPin className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                          <span>
                            {property.street_address}, {property.city}
                          </span>
                        </div>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className="text-lg sm:text-xl font-bold text-[#49769F]">
                              ₱{property.price.toLocaleString()}
                            </p>
                            <p className="text-xs text-[#0A4174]/70">
                              For{" "}
                              {property.listing_type === "sale"
                                ? "Sale"
                                : "Rent"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleViewDetails(property)}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F0FFFF] text-[#0A4174] rounded-lg text-xs sm:text-sm font-medium hover:bg-[#FFFFFF] transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Property Details Modal */}
        {isDetailsModalOpen && selectedProperty && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeDetailsModal}
          >
            <div
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const propertyImages =
                  selectedProperty.media && selectedProperty.media.length > 0
                    ? selectedProperty.media.map(
                        (item: any) =>
                          supabase.storage
                            .from("property-media")
                            .getPublicUrl(item.bucket_path).data.publicUrl
                      )
                    : ["/cozy-suburban-house.png"];
                const currentImage =
                  propertyImages[selectedImageIndex] || propertyImages[0];

                return (
                  <>
                    <div className="relative">
                      <div className="h-48 sm:h-56 bg-slate-100">
                        <img
                          src={currentImage}
                          alt={selectedProperty.property_title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={closeDetailsModal}
                          className="absolute top-4 left-4 p-2 bg-white/95 backdrop-blur-sm rounded-xl hover:bg-white transition-all shadow-md z-10"
                        >
                          <X className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="absolute top-4 right-4 flex gap-2">
                          {selectedProperty.property_type && (
                            <span className="px-3 py-1.5 bg-white/95 rounded-full text-xs font-semibold text-[#0A4174] shadow-sm">
                              {selectedProperty.property_type}
                            </span>
                          )}
                          <span className="px-3 py-1.5 bg-white/95 rounded-full text-xs font-semibold text-[#0A4174] shadow-sm">
                            {selectedProperty.listing_type === "sale"
                              ? "For Sale"
                              : "For Rent"}
                          </span>
                        </div>
                      </div>
                      {propertyImages.length > 1 && (
                        <div className="px-6 py-4 flex gap-3 overflow-x-auto bg-white">
                          {propertyImages.map((image, index) => (
                            <button
                              key={image}
                              onClick={() => setSelectedImageIndex(index)}
                              className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                                selectedImageIndex === index
                                  ? "border-[#49769F] opacity-100"
                                  : "border-transparent opacity-60 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={image}
                                alt={`${selectedProperty.property_title} view ${
                                  index + 1
                                }`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="px-6 py-4 border-b border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <h3 className="text-2xl font-bold text-[#0A4174]">
                            {selectedProperty.property_title}
                          </h3>
                          <div className="flex items-center text-sm text-[#49769F] gap-2 mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {selectedProperty.street_address},{" "}
                              {selectedProperty.city}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-[#49769F]">
                            ₱{selectedProperty.price.toLocaleString()}
                          </p>
                          {selectedProperty.property_status && (
                            <span className="inline-flex px-3 py-1 text-xs font-semibold bg-[#F0FFFF] text-[#0A4174] rounded-full">
                              {selectedProperty.property_status
                                .charAt(0)
                                .toUpperCase() +
                                selectedProperty.property_status.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 flex gap-6 border-b border-slate-100">
                      <button
                        onClick={() => setActiveTab("overview")}
                        className={`pb-3 font-semibold text-sm transition-all ${
                          activeTab === "overview"
                            ? "text-[#0A4174] border-b-2 border-[#49769F]"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setActiveTab("about")}
                        className={`pb-3 font-semibold text-sm transition-all ${
                          activeTab === "about"
                            ? "text-[#0A4174] border-b-2 border-[#49769F]"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        About
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                      {activeTab === "overview" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-[#0A4174]">
                            <div className="flex items-center gap-2 bg-[#F0FFFF] rounded-xl px-3 py-2">
                              <Bed className="w-4 h-4 text-[#49769F]" />
                              <div>
                                <p className="font-semibold text-[#0A4174]">
                                  {selectedProperty.bedrooms ?? "—"}
                                </p>
                                <p className="text-xs text-[#49769F]">
                                  Bedrooms
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-[#F0FFFF] rounded-xl px-3 py-2">
                              <Bath className="w-4 h-4 text-[#49769F]" />
                              <div>
                                <p className="font-semibold text-[#0A4174]">
                                  {selectedProperty.bathrooms ?? "—"}
                                </p>
                                <p className="text-xs text-[#49769F]">
                                  Bathrooms
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-[#F0FFFF] rounded-xl px-3 py-2">
                              <Maximize className="w-4 h-4 text-[#49769F]" />
                              <div>
                                <p className="font-semibold text-[#0A4174]">
                                  {selectedProperty.square_feet
                                    ? `${selectedProperty.square_feet.toLocaleString()} sq ft`
                                    : "—"}
                                </p>
                                <p className="text-xs text-[#49769F]">
                                  Floor Area
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#F8FBFD] rounded-2xl p-4">
                            <h3 className="font-semibold text-[#0A4174] mb-2">
                              Description
                            </h3>
                            <p className="text-sm text-[#49769F] leading-relaxed">
                              {selectedProperty.description ||
                                "No description available."}
                            </p>
                          </div>

                          {selectedProperty.features &&
                            selectedProperty.features.length > 0 && (
                              <div className="bg-[#F8FBFD] rounded-2xl p-4">
                                <h3 className="font-semibold text-[#0A4174] mb-3">
                                  Features
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {selectedProperty.features.map(
                                    (feature, index) => (
                                      <span
                                        key={`${feature}-${index}`}
                                        className="px-3 py-1 text-xs bg-[#49769F]/10 text-[#0A4174] rounded-full"
                                      >
                                        {feature}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {(selectedProperty.parking_spaces ||
                            selectedProperty.year_built ||
                            selectedProperty.lot_size ||
                            selectedProperty.furnished ||
                            selectedProperty.pet_policy) && (
                            <div className="bg-[#F8FBFD] rounded-2xl p-4 space-y-2 text-sm text-[#0A4174]">
                              <h3 className="font-semibold text-[#0A4174] mb-2">
                                Additional Details
                              </h3>
                              {selectedProperty.parking_spaces !== null &&
                                selectedProperty.parking_spaces !== undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-[#49769F]">
                                      Parking Spaces
                                    </span>
                                    <span className="font-semibold">
                                      {selectedProperty.parking_spaces}
                                    </span>
                                  </div>
                                )}
                              {selectedProperty.year_built && (
                                <div className="flex justify-between">
                                  <span className="text-[#49769F]">
                                    Year Built
                                  </span>
                                  <span className="font-semibold">
                                    {selectedProperty.year_built}
                                  </span>
                                </div>
                              )}
                              {selectedProperty.lot_size && (
                                <div className="flex justify-between">
                                  <span className="text-[#49769F]">
                                    Lot Size
                                  </span>
                                  <span className="font-semibold">
                                    {selectedProperty.lot_size} sqm
                                  </span>
                                </div>
                              )}
                              {selectedProperty.furnished && (
                                <div className="flex justify-between">
                                  <span className="text-[#49769F]">
                                    Furnished
                                  </span>
                                  <span className="font-semibold">
                                    {selectedProperty.furnished}
                                  </span>
                                </div>
                              )}
                              {selectedProperty.pet_policy && (
                                <div className="flex justify-between">
                                  <span className="text-[#49769F]">
                                    Pet Policy
                                  </span>
                                  <span className="font-semibold">
                                    {selectedProperty.pet_policy}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "about" && (
                        <div className="space-y-4">
                          {selectedProperty.about_property && (
                            <div className="bg-[#F8FBFD] rounded-2xl p-4">
                              <h3 className="font-semibold text-[#0A4174] mb-2">
                                About This Property
                              </h3>
                              <p className="text-sm text-[#49769F] leading-relaxed">
                                {selectedProperty.about_property}
                              </p>
                            </div>
                          )}

                          {(selectedProperty.full_name ||
                            selectedProperty.email ||
                            selectedProperty.phone_number) && (
                            <div className="bg-[#F8FBFD] rounded-2xl p-4 space-y-2 text-sm">
                              <h3 className="font-semibold text-[#0A4174] mb-2">
                                Contact Information
                              </h3>
                              {selectedProperty.full_name && (
                                <div className="flex justify-between">
                                  <span className="text-[#49769F]">Name</span>
                                  <span className="font-semibold text-[#0A4174]">
                                    {selectedProperty.full_name}
                                  </span>
                                </div>
                              )}
                              {selectedProperty.email && (
                                <div className="flex justify-between">
                                  <span className="text-[#49769F]">Email</span>
                                  <span className="font-semibold text-[#0A4174]">
                                    {selectedProperty.email}
                                  </span>
                                </div>
                              )}
                              {selectedProperty.phone_number && (
                                <div className="flex justify-between">
                                  <span className="text-[#49769F]">Phone</span>
                                  <span className="font-semibold text-[#0A4174]">
                                    {selectedProperty.phone_number}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {selectedProperty.nearby_places &&
                            selectedProperty.nearby_places.length > 0 && (
                              <div className="bg-[#F8FBFD] rounded-2xl p-4 space-y-2">
                                <h3 className="font-semibold text-[#0A4174] mb-2">
                                  Nearby Places
                                </h3>
                                {selectedProperty.nearby_places.map(
                                  (place: any, index: number) => (
                                    <div
                                      key={`${place?.name}-${index}`}
                                      className="flex justify-between text-sm"
                                    >
                                      <span className="text-[#49769F]">
                                        {place?.name || "Point of Interest"}
                                      </span>
                                      <span className="font-semibold text-[#0A4174]">
                                        {place?.distance_km
                                          ? `${place.distance_km} km`
                                          : ""}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            )}

                          {selectedProperty.utilities &&
                            selectedProperty.utilities.length > 0 && (
                              <div className="bg-[#F8FBFD] rounded-2xl p-4">
                                <h3 className="font-semibold text-[#0A4174] mb-2">
                                  Utilities
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {selectedProperty.utilities.map(
                                    (utility, index) => (
                                      <span
                                        key={`${utility}-${index}`}
                                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium"
                                      >
                                        {utility}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-auto border border-gray-100 animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Confirm Changes
                </h3>
                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Are you sure you want to save these changes to your about section?
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={saving}
                  className="flex-1 px-5 py-3 text-sm sm:text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSaveAbout}
                  disabled={saving}
                  className="flex-1 px-5 py-3 text-sm sm:text-base font-semibold text-white bg-[#49769F] hover:bg-[#0A4174] rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#49769F]/30"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {saving ? "Saving..." : "Confirm Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}