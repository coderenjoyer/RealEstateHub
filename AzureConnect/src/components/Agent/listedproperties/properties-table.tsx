"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronRight,
  X,
  Home,
  Bed,
  Bath,
  Trash2,
  UserPlus,
  Send,
  Pencil,
} from "lucide-react";
import supabase from "@/supabaseClient";
import { useAuth } from "@/AuthContext";
import { UpdatePropertyConfirmationModal } from "@/components/ui/update-property-confirmation-modal";

interface Property {
  id: number;
  property_title: string;
  street_address: string;
  city: string;
  state: string | null;
  price: number;
  bedrooms: number;
  bathrooms: number;
  property_status?: string; // For listed_properties
  approval_status?: string; // For listing_approvals
  description: string;
  square_feet: number | null;
  parking_spaces: number | null;
  year_built: number | null;
  property_type: string;
  features: string[] | null;
  listing_type: string;
  media?: any;
  is_pending?: boolean; // Helper flag to identify pending properties
  rent_end_date?: string | null; // Date when rentee will vacate
}

export function PropertiesTable() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [deactivateConfirmId, setDeactivateConfirmId] = useState<number | null>(
    null
  );
  const { session } = useAuth();
  const [transferModalProperty, setTransferModalProperty] =
    useState<Property | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferNotes, setTransferNotes] = useState("");
  const [rentEndDate, setRentEndDate] = useState(""); // New state for rent end date
  const [ownerSearchTerm, setOwnerSearchTerm] = useState("");
  const [ownerResults, setOwnerResults] = useState<any[]>([]);
  const [ownerSearchLoading, setOwnerSearchLoading] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);
  const [transferLoading, setTransferLoading] = useState(false);
  // Add edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Property>>({});
  const [updateConfirmModalOpen, setUpdateConfirmModalOpen] = useState(false);
  const [isUpdateProcessing, setIsUpdateProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "about">("overview");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);

      if (!session?.user?.id) {
        console.log("No authenticated user");
        return;
      }

      // Fetch from listed_properties (approved listings)
      const { data: listedData, error: listedError } = await supabase
        .from("listed_properties")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (listedError) {
        console.error("Error fetching listed properties:", listedError);
      }

      // Fetch from listing_approvals (pending submissions)
      const { data: pendingData, error: pendingError } = await supabase
        .from("listing_approvals")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("approval_status", "pending")
        .order("submitted_at", { ascending: false });

      if (pendingError) {
        console.error("Error fetching pending properties:", pendingError);
      }

      // Normalize pending properties to match Property interface
      const normalizedPending = (pendingData || []).map((item: any) => ({
        ...item,
        property_status: "pending", // Set property_status for consistency
        approval_status: item.approval_status,
        is_pending: true,
        // Ensure features is an array
        features: Array.isArray(item.features)
          ? item.features
          : item.features
          ? [item.features]
          : null,
      }));

      // Combine both arrays
      const allProperties = [
        ...normalizedPending,
        ...(listedData || []).map((item: any) => ({
          ...item,
          is_pending: false,
          // Ensure features is an array
          features: Array.isArray(item.features)
            ? item.features
            : item.features
            ? [item.features]
            : null,
        })),
      ];

      setProperties(allProperties);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.property_title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all"
        ? true
        : selectedFilter === "vacant"
        ? property.property_status === "available"
        : selectedFilter === "pending"
        ? property.is_pending === true || property.approval_status === "pending"
        : true;

    return matchesSearch && matchesFilter;
  });

  const openModal = (property: any) => {
    setSelectedProperty(property);
    setSelectedImageIndex(0);
    setIsModalOpen(true);
  };

  // Add function to open edit modal
  const openEditModal = (property: Property) => {
    setEditingProperty(property);
    setEditFormData({
      property_title: property.property_title,
      street_address: property.street_address,
      city: property.city,
      state: property.state,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      property_status: property.property_status,
      description: property.description,
      square_feet: property.square_feet,
      parking_spaces: property.parking_spaces,
      year_built: property.year_built,
      property_type: property.property_type,
      features: property.features ? [...property.features] : [],
      listing_type: property.listing_type,
    });
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
    setSelectedImageIndex(0);
  };

  // Add function to close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProperty(null);
    setEditFormData({});
  };

  const handleDeactivateListing = async (propertyId: number) => {
    try {
      // Get property details first to send notification
      const property = properties.find((p) => p.id === propertyId);

      const { error } = await supabase
        .from("listed_properties")
        .update({ is_deleted: true })
        .eq("id", propertyId)
        .eq("user_id", session?.user?.id); // Ensure agent can only deactivate their own listings

      if (error) {
        console.error("Error deactivating listing:", error);
        alert("Failed to deactivate listing");
        return;
      }

      // Send notification to owner if this is a rental that expired
      if (property && property.listing_type === "rent") {
        const { data: ownershipData } = await supabase
          .from("property_ownerships")
          .select("owner_id")
          .eq("property_id", propertyId)
          .single();

        if (ownershipData?.owner_id) {
          const { error: notificationError } = await supabase
            .from("notifications")
            .insert({
              user_id: ownershipData.owner_id,
              title: "Rental Period Ended",
              message: `Your rental period for ${property.property_title} has ended. The property has been deactivated.`,
              type: "maintenance",
              related_property_id: propertyId,
              related_agent_id: session?.user?.id,
              read: false,
            });

          if (notificationError) {
            console.error(
              "Error creating rental end notification:",
              notificationError
            );
          }
        }
      }

      // Refresh the properties list
      await fetchProperties();
      setDeactivateConfirmId(null);

      // Close modal if the deactivated property was open
      if (selectedProperty?.id === propertyId) {
        closeModal();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to deactivate listing");
    }
  };

  // Add function to handle property updates
  const handleUpdatePropertyClick = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateConfirmModalOpen(true);
  };

  // Add function to confirm and execute property updates
  const handleUpdateProperty = async () => {
    if (!editingProperty || !session?.user?.id) return;

    setIsUpdateProcessing(true);
    try {
      const { error } = await supabase
        .from("listed_properties")
        .update({
          property_title: editFormData.property_title,
          street_address: editFormData.street_address,
          city: editFormData.city,
          state: editFormData.state,
          price: editFormData.price,
          bedrooms: editFormData.bedrooms,
          bathrooms: editFormData.bathrooms,
          property_status: editFormData.property_status,
          description: editFormData.description,
          square_feet: editFormData.square_feet,
          parking_spaces: editFormData.parking_spaces,
          year_built: editFormData.year_built,
          property_type: editFormData.property_type,
          features: editFormData.features,
          listing_type: editFormData.listing_type,
        })
        .eq("id", editingProperty.id)
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error updating property:", error);
        return;
      }

      // Refresh the properties list
      await fetchProperties();
      setUpdateConfirmModalOpen(false);
      closeEditModal();
    } catch (error) {
      console.error("Error:", error);
      setUpdateConfirmModalOpen(false);
    } finally {
      setIsUpdateProcessing(false);
    }
  };

  const openTransferModal = (property: Property) => {
    setTransferModalProperty(property);
    setTransferNotes("");
    setRentEndDate("");
    setOwnerSearchTerm("");
    setOwnerResults([]);
    setSelectedOwner(null);
    setOwnerSearchLoading(false);
    setTransferError(null);
    setTransferSuccess(null);
    setIsTransferModalOpen(true);
  };

  const closeTransferModal = () => {
    setIsTransferModalOpen(false);
    setTransferModalProperty(null);
    setTransferNotes("");
    setRentEndDate("");
    setTransferError(null);
    setTransferSuccess(null);
    setTransferLoading(false);
    setOwnerSearchTerm("");
    setOwnerResults([]);
    setSelectedOwner(null);
    setOwnerSearchLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const searchOwners = async () => {
      if (!isTransferModalOpen) return;
      const term = ownerSearchTerm.trim();

      if (term.length < 2) {
        setOwnerResults([]);
        setOwnerSearchLoading(false);
        return;
      }

      setOwnerSearchLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_all_users", {
          user_role: "user",
        });

        if (!isMounted) return;

        if (error) {
          console.error("Owner search failed:", error);
          setOwnerResults([]);
        } else {
          const lowerTerm = term.toLowerCase();
          const filtered = (data || [])
            .filter((owner: any) => {
              const fullName = `${owner.first_name ?? ""} ${
                owner.last_name ?? ""
              }`
                .trim()
                .toLowerCase();
              const email = owner.email?.toLowerCase() || "";
              return fullName.includes(lowerTerm) || email.includes(lowerTerm);
            })
            .slice(0, 5);
          setOwnerResults(filtered);
        }
      } catch (ownerError) {
        console.error("Owner search error:", ownerError);
        if (isMounted) setOwnerResults([]);
      } finally {
        if (isMounted) setOwnerSearchLoading(false);
      }
    };

    const timeout = setTimeout(searchOwners, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [ownerSearchTerm, isTransferModalOpen]);

  const handleTransferOwnership = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!transferModalProperty) return;
    if (!selectedOwner) {
      setTransferError("Please select an owner from the search results.");
      return;
    }
    if (!session?.user?.id) {
      setTransferError("You must be signed in to transfer a listing.");
      return;
    }

    setTransferLoading(true);
    setTransferError(null);
    setTransferSuccess(null);

    try {
      if (selectedOwner.id === session.user.id) {
        throw new Error("You already own this property.");
      }

      const ownershipPayload = {
        property_id: transferModalProperty.id,
        owner_id: selectedOwner.id,
        agent_id: session.user.id,
        owner_email: selectedOwner.email,
        owner_name:
          `${selectedOwner.first_name ?? ""} ${
            selectedOwner.last_name ?? ""
          }`.trim() || selectedOwner.email,
        maintenance_status: "pending",
        notes: transferNotes.trim() || null,
        rent_end_date: rentEndDate || null, // Add rent end date to payload
      };

      const { error: ownershipError } = await supabase
        .from("property_ownerships")
        .upsert(ownershipPayload, { onConflict: "property_id" });

      if (ownershipError) {
        throw ownershipError;
      }

      const newStatus =
        transferModalProperty.listing_type === "sale" ? "sold" : "rented";

      const { error: listingUpdateError } = await supabase
        .from("listed_properties")
        .update({
          is_public: false,
          property_status: newStatus,
        })
        .eq("id", transferModalProperty.id)
        .eq("user_id", session.user.id);

      if (listingUpdateError) {
        throw listingUpdateError;
      }

      // Create notification for renter when rental period is set
      if (transferModalProperty.listing_type === "rent" && rentEndDate) {
        const rentalEndDateObj = new Date(rentEndDate);
        const notificationMessage = `Your rental period for ${
          transferModalProperty.property_title
        } will end on ${rentalEndDateObj.toLocaleDateString()}`;

        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: selectedOwner.id,
            title: "Rental Period Ending",
            message: notificationMessage,
            type: "maintenance",
            related_property_id: transferModalProperty.id,
            related_agent_id: session.user.id,
            read: false,
          });

        if (notificationError) {
          console.error(
            "Error creating rental notification:",
            notificationError
          );
        }
      }

      setTransferSuccess(
        transferModalProperty.listing_type === "rent"
          ? "Property marked as rented successfully. The renter now sees it in their maintenance."
          : "Ownership transferred successfully. The homeowner now sees it in maintenance."
      );
      await fetchProperties();
      setTimeout(() => {
        closeTransferModal();
      }, 2000);
    } catch (error: any) {
      console.error("Transfer error:", error);
      setTransferError(
        error?.message || "Unable to transfer ownership right now."
      );
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden min-w-[375px]">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Properties
          </h2>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#49769F] focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Filter Dropdown */}
        <div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#49769F] hover:border-slate-400 transition text-sm sm:text-base"
          >
            <option value="all">All Properties</option>
            <option value="vacant">Approved</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700">
                Property
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700">
                Location
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700">
                Price
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700">
                Rooms
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700">
                Status
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700">
                Description
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <p className="text-slate-500">Loading properties...</p>
                </td>
              </tr>
            ) : filteredProperties.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <p className="text-slate-500">No properties found</p>
                </td>
              </tr>
            ) : (
              filteredProperties.map((property) => (
                <tr
                  key={property.id}
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-slate-900">
                    {property.property_title}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">
                    {property.street_address}, {property.city}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">
                    ₱{property.price.toLocaleString()}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">
                    {property.bedrooms}BR/{property.bathrooms}BA
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                    <span
                      className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        property.is_pending ||
                        property.approval_status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : property.property_status === "available"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {property.is_pending ||
                      property.approval_status === "pending"
                        ? "Pending"
                        : property.property_status
                        ? property.property_status.charAt(0).toUpperCase() +
                          property.property_status.slice(1)
                        : "Unknown"}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                    {property.is_pending ||
                    property.approval_status === "pending" ? (
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium text-xs sm:text-sm bg-yellow-100 text-yellow-800">
                        Awaiting Approval
                      </span>
                    ) : property.property_status === "sold" ||
                      property.property_status === "rented" ? (
                      <span
                        className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium text-xs sm:text-sm ${
                          property.property_status === "sold"
                            ? "bg-red-100 text-red-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {property.property_status === "sold"
                          ? "Sold"
                          : "Rented"}
                      </span>
                    ) : (
                      <button
                        onClick={() => openModal(property)}
                        className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#49769F]/10 text-[#49769F] font-medium hover:bg-[#49769F]/20 transition-colors text-xs sm:text-sm"
                      >
                        Review
                        <ChevronRight className="w-3 sm:w-4 h-3 sm:h-4" />
                      </button>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <button
                        onClick={() => openEditModal(property)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#49769F]/10 text-[#49769F] font-medium text-xs hover:bg-[#49769F]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit Property"
                        disabled={
                          property.is_pending ||
                          property.approval_status === "pending" ||
                          property.property_status === "sold" ||
                          property.property_status === "rented"
                        }
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                      {!property.is_pending &&
                        property.approval_status !== "pending" &&
                        property.property_status !== "sold" &&
                        property.property_status !== "rented" && (
                          <button
                            onClick={() => openTransferModal(property)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 font-medium text-xs hover:bg-emerald-100 transition-colors"
                            title={
                              property.listing_type === "rent"
                                ? "Mark as Rented"
                                : "Transfer Ownership"
                            }
                          >
                            <UserPlus className="w-3 h-3" />
                            {property.listing_type === "rent"
                              ? "Rented"
                              : "Transfer"}
                          </button>
                        )}
                      {!property.is_pending &&
                        property.approval_status !== "pending" && (
                          <button
                            onClick={() => setDeactivateConfirmId(property.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 font-medium text-xs hover:bg-red-100 transition-colors"
                            title="Deactivate Listing"
                          >
                            <Trash2 className="w-3 h-3" />
                            Deactivate
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Property Details Side Panel */}
      {isModalOpen &&
        selectedProperty &&
        (() => {
          // Get images from media array
          const propertyImages =
            selectedProperty.media && selectedProperty.media.length > 0
              ? selectedProperty.media.map(
                  (item: any) =>
                    supabase.storage
                      .from("property-media")
                      .getPublicUrl(item.bucket_path).data.publicUrl
                )
              : [];

          const currentImage =
            propertyImages.length > 0
              ? propertyImages[selectedImageIndex]
              : null;

          return (
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center sm:items-start justify-center sm:justify-end p-4 sm:p-8"
              onClick={closeModal}
            >
              <div
                className="w-full sm:w-[500px] h-full sm:h-[calc(100vh-4rem)] max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with Image Gallery */}
                <div className="relative">
                  {/* Main Image */}
                  <div className="h-36 sm:h-48 bg-gradient-to-br from-rose-300 via-pink-200 to-rose-200 relative">
                    {currentImage && (
                      <img
                        src={currentImage}
                        alt={selectedProperty.property_title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {/* Close Button */}
                    <button
                      onClick={closeModal}
                      className="absolute top-4 left-4 p-2 bg-white/95 backdrop-blur-sm rounded-xl hover:bg-white transition-all shadow-md z-10"
                    >
                      <X className="h-5 w-5 text-gray-600" />
                    </button>

                    {/* Property Type Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="px-4 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm">
                        {selectedProperty.property_type}
                      </span>
                    </div>

                    {/* House Illustration - only show if no image */}
                    {!currentImage && (
                      <div className="absolute bottom-0 left-0 right-0">
                        <svg
                          viewBox="0 0 280 120"
                          className="w-full h-auto"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M60 120V75L140 40L220 75V120H60Z"
                            fill="#be123c"
                          />
                          <path
                            d="M45 75L140 25L235 75L220 80L140 40L60 80L45 75Z"
                            fill="#9f1239"
                          />
                          <ellipse
                            cx="140"
                            cy="50"
                            rx="15"
                            ry="8"
                            fill="#881337"
                          />
                          <rect
                            x="85"
                            y="85"
                            width="28"
                            height="25"
                            rx="2"
                            fill="#fbbf24"
                          />
                          <rect
                            x="167"
                            y="85"
                            width="28"
                            height="25"
                            rx="2"
                            fill="#fbbf24"
                          />
                          <line
                            x1="99"
                            y1="85"
                            x2="99"
                            y2="110"
                            stroke="#be123c"
                            strokeWidth="2"
                          />
                          <line
                            x1="85"
                            y1="97.5"
                            x2="113"
                            y2="97.5"
                            stroke="#be123c"
                            strokeWidth="2"
                          />
                          <line
                            x1="181"
                            y1="85"
                            x2="181"
                            y2="110"
                            stroke="#be123c"
                            strokeWidth="2"
                          />
                          <line
                            x1="167"
                            y1="97.5"
                            x2="195"
                            y2="97.5"
                            stroke="#be123c"
                            strokeWidth="2"
                          />
                          <rect
                            x="125"
                            y="90"
                            width="30"
                            height="30"
                            rx="2"
                            fill="#78350f"
                          />
                          <circle cx="148" cy="105" r="2" fill="#fbbf24" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="px-4 sm:px-6 py-3 sm:py-4 flex gap-2 sm:gap-3 overflow-x-auto">
                    {propertyImages.length > 0 ? (
                      propertyImages.map((imageUrl: string, index: number) => (
                        <div
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`w-16 sm:w-24 h-14 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 cursor-pointer transition-all ${
                            index === selectedImageIndex
                              ? "border-2 border-[#49769F] opacity-100"
                              : "opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={imageUrl}
                            alt={`${selectedProperty.property_title} ${
                              index + 1
                            }`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="w-16 sm:w-24 h-14 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 border-2 border-[#49769F]">
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                          <Home className="w-5 sm:w-6 h-5 sm:h-6 text-[#49769F]" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="px-4 sm:px-6 flex gap-4 sm:gap-6 border-b border-slate-100 flex-shrink-0 overflow-x-auto">
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

                {/* Tab Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
                  {activeTab === "overview" && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-2xl p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
                          Property Details
                        </h3>
                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                          <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl">
                            <Bed className="h-4 sm:h-5 w-4 sm:w-5 text-[#49769F]" />
                            <span className="text-xs sm:text-sm font-medium text-gray-600">
                              Bedrooms
                            </span>
                            <span className="text-base sm:text-lg font-bold text-gray-900">
                              {selectedProperty.bedrooms}
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl">
                            <Bath className="h-4 sm:h-5 w-4 sm:w-5 text-[#49769F]" />
                            <span className="text-xs sm:text-sm font-medium text-gray-600">
                              Bathrooms
                            </span>
                            <span className="text-base sm:text-lg font-bold text-gray-900">
                              {selectedProperty.bathrooms}
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl">
                            <Home className="h-4 sm:h-5 w-4 sm:w-5 text-[#49769F]" />
                            <span className="text-xs sm:text-sm font-medium text-gray-600">
                              Sq Ft
                            </span>
                            <span className="text-base sm:text-lg font-bold text-gray-900">
                              {selectedProperty.square_feet || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                          Price
                        </h3>
                        <p className="text-xl sm:text-2xl font-bold text-[#49769F]">
                          ₱{selectedProperty.price?.toLocaleString()}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          For{" "}
                          {selectedProperty.listing_type === "sale"
                            ? "Sale"
                            : "Rent"}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                          Description
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {selectedProperty.description}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
                          Amenities
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedProperty.features &&
                          selectedProperty.features.length > 0 ? (
                            selectedProperty.features.map(
                              (feature: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-3 py-1.5 bg-[#49769F]/20 text-[#49769F] rounded-full text-xs font-medium"
                                >
                                  {feature}
                                </span>
                              )
                            )
                          ) : (
                            <p className="text-sm text-gray-500">
                              No amenities listed
                            </p>
                          )}
                        </div>
                      </div>

                      {(selectedProperty.parking_spaces !== null &&
                        selectedProperty.parking_spaces !== undefined) ||
                      selectedProperty.year_built ||
                      selectedProperty.lot_size ||
                      selectedProperty.furnished ||
                      selectedProperty.pet_policy ? (
                        <div className="bg-gray-50 rounded-2xl p-3 sm:p-4 space-y-2 text-sm text-[#0A4174]">
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
                      ) : null}
                    </div>
                  )}

                  {activeTab === "about" && (
                    <div className="space-y-4">
                      {selectedProperty.about_property && (
                        <div className="bg-gray-50 rounded-2xl p-4">
                          <h3 className="font-semibold text-gray-900 mb-3">
                            About This Property
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {selectedProperty.about_property}
                          </p>
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-2xl p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Contact Information
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Name</span>
                            <span className="font-medium text-gray-900">
                              {selectedProperty.full_name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Email</span>
                            <span className="font-medium text-gray-900">
                              {selectedProperty.email}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Phone</span>
                            <span className="font-medium text-gray-900">
                              {selectedProperty.phone_number}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedProperty.nearby_places &&
                        selectedProperty.nearby_places.length > 0 && (
                          <div className="bg-gray-50 rounded-2xl p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">
                              Nearby Places
                            </h3>
                            <div className="space-y-2">
                              {selectedProperty.nearby_places.map(
                                (place: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center text-sm"
                                  >
                                    <span className="text-gray-600">
                                      {place.name}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {place.distance_km} km
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {selectedProperty.utilities &&
                        selectedProperty.utilities.length > 0 && (
                          <div className="bg-gray-50 rounded-2xl p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">
                              Utilities
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedProperty.utilities.map(
                                (utility: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium"
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
              </div>
            </div>
          );
        })()}

      {/* Update Property Confirmation Modal */}
      <UpdatePropertyConfirmationModal
        open={updateConfirmModalOpen}
        onConfirm={handleUpdateProperty}
        onCancel={() => setUpdateConfirmModalOpen(false)}
        isProcessing={isUpdateProcessing}
        propertyTitle={editingProperty?.property_title}
      />

      {/* Deactivate Confirmation Modal */}
      {deactivateConfirmId && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setDeactivateConfirmId(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <Trash2 className="w-5 sm:w-6 h-5 sm:h-6" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Deactivate Listing
                </h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Are you sure you want to deactivate this listing? It will be
                removed from public view and your listings table.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeactivateConfirmId(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeactivateListing(deactivateConfirmId)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {isTransferModalOpen && transferModalProperty && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeTransferModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                  {transferModalProperty.listing_type === "rent"
                    ? "Mark as Rented"
                    : "Transfer Ownership"}
                </h3>
                <p className="text-sm text-slate-500">
                  {transferModalProperty.listing_type === "rent"
                    ? `Set rental period for ${transferModalProperty.property_title}`
                    : `Send ${transferModalProperty.property_title} to a homeowner`}
                </p>
              </div>
              <button
                onClick={closeTransferModal}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form
              className="px-4 sm:px-6 py-4 sm:py-6 space-y-4"
              onSubmit={handleTransferOwnership}
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {transferModalProperty.listing_type === "rent"
                    ? "Rentee Name/Email"
                    : "Select Homeowner"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={ownerSearchTerm}
                    onChange={(e) => setOwnerSearchTerm(e.target.value)}
                    placeholder={
                      transferModalProperty.listing_type === "rent"
                        ? "Search rentee by name or email"
                        : "Search by name or email"
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {ownerSearchLoading && (
                    <div className="absolute right-3 top-2 text-xs text-slate-400">
                      Searching...
                    </div>
                  )}
                </div>
                {ownerResults.length > 0 && (
                  <div className="mt-2 border border-slate-200 rounded-lg divide-y divide-slate-200 max-h-48 overflow-y-auto">
                    {ownerResults.map((owner) => {
                      const fullName = `${owner.first_name ?? ""} ${
                        owner.last_name ?? ""
                      }`.trim();
                      return (
                        <button
                          key={owner.id}
                          type="button"
                          onClick={() => {
                            setSelectedOwner(owner);
                            setOwnerResults([]);
                            setOwnerSearchTerm(fullName || owner.email);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-emerald-50 transition-colors ${
                            selectedOwner?.id === owner.id
                              ? "bg-emerald-50"
                              : ""
                          }`}
                        >
                          <p className="font-medium text-slate-900">
                            {fullName ||
                              owner.email?.split("@")[0] ||
                              "Unnamed User"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {owner.email}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedOwner && (
                  <p className="text-xs text-emerald-600 mt-1">
                    Selected{" "}
                    {transferModalProperty.listing_type === "rent"
                      ? "rentee"
                      : "owner"}
                    :{" "}
                    {`${selectedOwner.first_name ?? ""} ${
                      selectedOwner.last_name ?? ""
                    }`.trim() || selectedOwner.email}
                  </p>
                )}
              </div>

              {transferModalProperty.listing_type === "rent" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Rental End Date
                  </label>
                  <input
                    type="date"
                    value={rentEndDate}
                    onChange={(e) => setRentEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    The date when the rentee will vacate the property
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {transferModalProperty.listing_type === "rent"
                    ? "Additional Notes"
                    : "Notes for the Owner"}
                </label>
                <textarea
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  rows={3}
                  placeholder={
                    transferModalProperty.listing_type === "rent"
                      ? "Include rental agreement details, house rules, etc."
                      : "Include reminders, warranty information, etc."
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {transferError && (
                <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">
                  {transferError}
                </div>
              )}

              {transferSuccess && (
                <div className="rounded-lg bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">
                  {transferSuccess}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeTransferModal}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                  disabled={transferLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-70"
                  disabled={transferLoading}
                >
                  <Send className="w-4 h-4" />
                  {transferLoading
                    ? transferModalProperty.listing_type === "rent"
                      ? "Marking..."
                      : "Transferring..."
                    : transferModalProperty.listing_type === "rent"
                    ? "Mark as Rented"
                    : "Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {isEditModalOpen && editingProperty && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeEditModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                  Edit Property
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 truncate">
                  Update details for {editingProperty.property_title}
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form
              className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6"
              onSubmit={handleUpdatePropertyClick}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Property Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.property_title || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        property_title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49769F]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Property Type
                  </label>
                  <select
                    value={editFormData.property_type || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        property_type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49769F]"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Condo">Condo</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Land">Land</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Multi-Family">Multi-Family</option>
                    <option value="Villa">Villa</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Listing Type
                  </label>
                  <select
                    value={editFormData.listing_type || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        listing_type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49769F]"
                    required
                  >
                    <option value="">Select Listing Type</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Price (₱)
                  </label>
                  <input
                    type="number"
                    value={editFormData.price || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        price: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49769F]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    value={editFormData.bedrooms || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        bedrooms: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49769F]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    value={editFormData.bathrooms || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        bathrooms: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49769F]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Square Feet
                  </label>
                  <input
                    type="number"
                    value={editFormData.square_feet || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        square_feet: Number(e.target.value) || null,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49769F]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editFormData.city || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, city: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49769F]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editFormData.description || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49769F]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#49769F] text-white rounded-lg hover:bg-[#49769F]/90 transition-colors"
                >
                  Update Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
