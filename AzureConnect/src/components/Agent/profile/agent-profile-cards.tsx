import {
  User,
  Home,
  Bookmark,
  CheckCircle,
  MapPin,
  Pencil,
  X,
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
          "id, property_title, street_address, city, price, property_type, listing_type, media"
        )
        .eq("user_id", session.user.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Error fetching listed properties:", error);
      } else {
        setListedProperties(data || []);
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
    try {
      setSaving(true);

      const { error } = await supabase.auth.updateUser({
        data: {
          about: tempAboutData,
        },
      });

      if (error) {
        console.error("Error saving about data:", error);
        alert("Failed to save changes. Please try again.");
        return;
      }

      setAboutData(tempAboutData);
      setIsEditingAbout(false);
      setNewSpecialization("");
      setNewCertification("");
      alert("About section updated successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save changes. Please try again.");
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
                      <div className="h-40 bg-gradient-to-br from-[#0A4174]/20 to-[#49769F]/30 relative">
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
                      <div className="p-4">
                        <h4 className="font-semibold text-[#0A4174] mb-2">
                          {property.property_title}
                        </h4>
                        <div className="flex items-center gap-2 text-[#49769F] text-sm mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {property.street_address}, {property.city}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xl font-bold text-[#49769F]">
                              ₱{property.price.toLocaleString()}
                            </p>
                            <p className="text-xs text-[#0A4174]/70">
                              For{" "}
                              {property.listing_type === "sale"
                                ? "Sale"
                                : "Rent"}
                            </p>
                          </div>
                          <button className="px-4 py-2 bg-[#F0FFFF] text-[#0A4174] rounded-lg text-sm font-medium hover:bg-[#FFFFFF] transition-colors">
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
      </div>
    </div>
  );
}
