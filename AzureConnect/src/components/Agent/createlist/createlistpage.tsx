"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ImagePlus,
  Check,
  ChevronDown,
  X,
  Plus,
  Home,
  DollarSign,
  MapPin,
  FileText,
  User,
  Trash2,
  Eye,
  Edit,
} from "lucide-react";
import { AgentLayout } from "@/components/layouts/AgentLayout";
import supabase from "@/supabaseClient";
import { useAuth } from "@/AuthContext";

export default function ListPropertyPage() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const userRole = session?.user?.user_metadata?.role;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    propertyTitle: "",
    propertyType: "",
    listingType: "sale",
    price: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    lotSize: "",
    yearBuilt: "",
    parkingSpaces: "",
    streetAddress: "",
    city: "",
    state: "",
    zipPostal: "",
    country: "Philippines",
    description: "",
    aboutProperty: "",
    features: [] as string[],
    fullName: "",
    email: "",
    phoneNumber: "",
    availableFrom: "",
    propertyStatus: "pending",
    furnished: "",
    petPolicy: "",
    utilities: [] as string[],
    nearby: [] as { name: string; description: string; distanceKm: string }[],
  });

  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showFurnishedDropdown, setShowFurnishedDropdown] = useState(false);
  const [showPetDropdown, setShowPetDropdown] = useState(false);
  const [currentFeature, setCurrentFeature] = useState("");
  const [uploadedImages, setUploadedImages] = useState<(File | null)[]>([
    null,
    null,
  ]);
  const [uploadedImagePreviews, setUploadedImagePreviews] = useState<
    (string | null)[]
  >([null, null]);
  const [nearbyName, setNearbyName] = useState("");
  const [nearbyDescription, setNearbyDescription] = useState("");
  const [nearbyDistanceKm, setNearbyDistanceKm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isAgent, setIsAgent] = useState<boolean | null>(null);

  const propertyTypes = [
    "House",
    "Apartment",
    "Condo",
    "Townhouse",
    "Land",
    "Commercial",
    "Multi-Family",
    "Villa",
    "Studio",
  ];
  const furnishedOptions = ["Furnished", "Semi-Furnished", "Unfurnished"];
  const petPolicies = [
    "Pets Allowed",
    "No Pets",
    "Cats Only",
    "Dogs Only",
    "With Restrictions",
  ];
  const commonFeatures = [
    "Swimming Pool",
    "Garden",
    "Garage",
    "Balcony",
    "Terrace",
    "Gym",
    "Security System",
    "Fireplace",
    "Walk-in Closet",
    "Laundry Room",
    "Home Office",
    "Storage Room",
    "Backup Generator",
    "Solar Panels",
    "Smart Home",
    "Elevator",
    "Gated Community",
    "Near School",
    "Near Mall",
  ];

  const utilityOptions = [
    "Water",
    "Electricity",
    "Gas",
    "Internet",
    "Cable TV",
    "Trash Collection",
  ];

  useEffect(() => {
    // Check if user has agent role
    console.log("=== Role Verification Debug ===");
    console.log("User ID:", userId);
    console.log("User Role:", userRole);
    console.log("Full User Metadata:", session?.user?.user_metadata);
    console.log("Is Agent?:", userRole === "agent");
    console.log("===============================");

    if (userRole) {
      setIsAgent(userRole === "agent");
    }
  }, [userRole, session]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("=== Submit Handler Debug ===");
    console.log("User ID:", userId);
    console.log("User Role:", userRole);
    console.log("Is Agent Check:", userRole === "agent");
    console.log("===========================");

    if (!userId) {
      setSubmitError("You must be logged in to list a property");
      return;
    }

    // Check if user has agent role
    if (userRole !== "agent") {
      console.error("Role check failed. Current role:", userRole);
      setSubmitError("Only users with agent role can list properties");
      return;
    }

    // Validate image upload (2-4 images required)
    const validImagesCount = uploadedImages.filter(
      (img) => img !== null
    ).length;
    if (validImagesCount < 2) {
      setSubmitError("Please upload at least 2 images of the property");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (validImagesCount > 4) {
      setSubmitError("Maximum 4 images allowed");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Refresh session to ensure JWT is up to date
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !currentSession) {
        throw new Error("Session expired. Please log in again.");
      }

      // Verify role from fresh session
      const currentRole = currentSession.user?.user_metadata?.role;
      if (currentRole !== "agent") {
        throw new Error("Only users with agent role can list properties");
      }

      // Upload images first
      const mediaData = await uploadPropertyImages();

      // Prepare property data for database insertion into listing_approvals
      const propertyData = {
        user_id: currentSession.user.id,
        property_title: formData.propertyTitle,
        property_type: formData.propertyType,
        listing_type: formData.listingType,
        price: parseFloat(formData.price.replace(/[^0-9.-]+/g, "")) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        square_feet: parseInt(formData.squareFeet) || null,
        lot_size: parseFloat(formData.lotSize) || null,
        year_built: parseInt(formData.yearBuilt) || null,
        parking_spaces: parseInt(formData.parkingSpaces) || null,
        available_from: formData.availableFrom || null,
        furnished: formData.furnished || null,
        pet_policy: formData.petPolicy || null,
        street_address: formData.streetAddress,
        city: formData.city,
        state: formData.state || null,
        zip_postal: formData.zipPostal,
        country: formData.country,
        description: formData.description,
        about_property: formData.aboutProperty || null,
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        features: formData.features,
        utilities: formData.utilities,
        nearby_places: formData.nearby,
        media: mediaData,
        approval_status: "pending",
      };

      // Insert property into listing_approvals table
      const { data, error } = await supabase
        .from("listing_approvals")
        .insert(propertyData);

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      setSubmitSuccess(true);

      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);

      // Reset form
      setFormData({
        propertyTitle: "",
        propertyType: "",
        listingType: "sale",
        price: "",
        bedrooms: "",
        bathrooms: "",
        squareFeet: "",
        lotSize: "",
        yearBuilt: "",
        parkingSpaces: "",
        streetAddress: "",
        city: "",
        state: "",
        zipPostal: "",
        country: "Philippines",
        description: "",
        aboutProperty: "",
        features: [],
        fullName: "",
        email: "",
        phoneNumber: "",
        availableFrom: "",
        propertyStatus: "pending",
        furnished: "",
        petPolicy: "",
        utilities: [],
        nearby: [],
      });
      // Reset images to initial state (2 empty boxes)
      setUploadedImagePreviews([null, null]);
      setUploadedImages([null, null]);
    } catch (error: any) {
      console.error("Error submitting property:", error);
      setSubmitError(
        error.message || "Failed to submit property. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadPropertyImages = async () => {
    if (!userId) return [];

    const mediaData = [];

    // Filter out null images and process only valid files
    const validImages = uploadedImages.filter((img) => img !== null) as File[];

    for (let i = 0; i < validImages.length; i++) {
      const file = validImages[i];
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${userId}/property-${Date.now()}-${i}.${fileExtension}`;

      try {
        // Upload file to Supabase Storage (using property-media bucket)
        const { error: uploadError } = await supabase.storage
          .from("property-media")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: imageData } = supabase.storage
          .from("property-media")
          .getPublicUrl(fileName);

        mediaData.push({
          file_name: file.name,
          bucket_path: fileName,
          mime_type: file.type,
          size: file.size,
          order: i,
          public_url: imageData.publicUrl,
        });
      } catch (error) {
        console.error(`Error uploading image ${i}:`, error);
        throw error;
      }
    }

    return mediaData;
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      propertyTitle: "",
      propertyType: "",
      listingType: "sale",
      price: "",
      bedrooms: "",
      bathrooms: "",
      squareFeet: "",
      lotSize: "",
      yearBuilt: "",
      parkingSpaces: "",
      streetAddress: "",
      city: "",
      state: "",
      zipPostal: "",
      country: "Philippines",
      description: "",
      aboutProperty: "",
      features: [],
      fullName: "",
      email: "",
      phoneNumber: "",
      availableFrom: "",
      propertyStatus: "available",
      furnished: "",
      petPolicy: "",
      utilities: [],
      nearby: [],
    })
    // Reset images to initial state (2 empty boxes)
    setUploadedImagePreviews([null, null])
    setUploadedImages([null, null])
    setSubmitError(null)
    setSubmitSuccess(false)
  };

  const addFeature = (feature: string) => {
    if (feature && !formData.features.includes(feature)) {
      setFormData({ ...formData, features: [...formData.features, feature] });
      setCurrentFeature("");
    }
  };

  const removeFeature = (feature: string) => {
    setFormData({
      ...formData,
      features: formData.features.filter((f) => f !== feature),
    });
  };

  const toggleUtility = (utility: string) => {
    if (formData.utilities.includes(utility)) {
      setFormData({
        ...formData,
        utilities: formData.utilities.filter((u) => u !== utility),
      });
    } else {
      setFormData({ ...formData, utilities: [...formData.utilities, utility] });
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Create a copy of the current arrays
      const newImages = [...uploadedImages];
      const newPreviews = [...uploadedImagePreviews];

      // Set the file and preview at the specified index
      newImages[index] = file;
      newPreviews[index] = URL.createObjectURL(file);

      // Manage box visibility:
      // - Always keep at least 2 boxes
      // - Only show box 3 when both initial boxes are filled
      // - Only show box 4 when box 3 is filled
      const firstTwoBoxesFilled =
        newImages[0] !== null && newImages[1] !== null;
      const box3Filled = newImages[2] !== null;

      // Adjust boxes based on current state
      if (firstTwoBoxesFilled && !box3Filled) {
        // Keep exactly 3 boxes when first two are filled but box 3 is empty
        if (newImages.length > 3) {
          newImages.length = 3;
          newPreviews.length = 3;
        } else if (newImages.length < 3) {
          newImages.push(null);
          newPreviews.push(null);
        }
      } else if (firstTwoBoxesFilled && box3Filled) {
        // Keep exactly 4 boxes when first two and box 3 are filled
        if (newImages.length < 4) {
          newImages.push(null);
          newPreviews.push(null);
        }
      } else if (!firstTwoBoxesFilled) {
        // Keep exactly 2 boxes when first two are not both filled
        if (newImages.length > 2) {
          newImages.length = 2;
          newPreviews.length = 2;
        }
      }

      setUploadedImages(newImages);
      setUploadedImagePreviews(newPreviews);
    }
  };

  const triggerFileInput = (index: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => handleImageUpload(e as any, index);
    input.click();
  };

  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    const newPreviews = [...uploadedImagePreviews];

    // Remove the image and preview at the specified index
    newImages[index] = null;
    newPreviews[index] = null;

    // Ensure we always have at least 2 boxes
    while (newImages.length < 2) {
      newImages.push(null);
      newPreviews.push(null);
    }

    // Manage box visibility after removal:
    // - Always keep at least 2 boxes
    // - Only show box 3 when both initial boxes are filled
    // - Only show box 4 when box 3 is filled
    const firstTwoBoxesFilled = newImages[0] !== null && newImages[1] !== null;
    const box3Filled = newImages[2] !== null;

    // Adjust boxes based on current state after removal
    if (firstTwoBoxesFilled && !box3Filled) {
      // Keep exactly 3 boxes when first two are filled but box 3 is empty
      if (newImages.length > 3) {
        newImages.length = 3;
        newPreviews.length = 3;
      }
    } else if (firstTwoBoxesFilled && box3Filled) {
      // Keep exactly 4 boxes when first two and box 3 are filled
      // (No change needed here)
    } else if (!firstTwoBoxesFilled) {
      // Even if first two boxes are not both filled, keep existing boxes
      // Don't trim boxes just because one of the first two is empty
      // This prevents boxes 3 and 4 from disappearing when deleting image 2
    }

    setUploadedImages(newImages);
    setUploadedImagePreviews(newPreviews);
  };

  const editImage = (index: number) => {
    triggerFileInput(index);
  };

  const viewImage = (url: string) => {
    window.open(url, "_blank");
  };

  const addNearby = () => {
    if (!nearbyName || !nearbyDistanceKm) return;
    const newItem = {
      name: nearbyName,
      description: nearbyDescription,
      distanceKm: nearbyDistanceKm,
    };
    setFormData({ ...formData, nearby: [...formData.nearby, newItem] });
    setNearbyName("");
    setNearbyDescription("");
    setNearbyDistanceKm("");
  };

  const removeNearby = (index: number) => {
    setFormData({
      ...formData,
      nearby: formData.nearby.filter((_, i) => i !== index),
    });
  };

  // Show loading state while checking role
  if (isAgent === null) {
    return (
      <AgentLayout>
        <div className="p-8">
          <div className="max-w-7xl min-w-[375px] mx-auto">
            <div className="bg-white rounded-3xl shadow-lg sm:p-8 p-4">
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-slate-600">Checking permissions...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AgentLayout>
    );
  }

  // Show error if user is not an agent
  if (isAgent === false) {
    return (
      <AgentLayout>
        <div className="p-8">
          <div className="max-w-7xl min-w-[375px] mx-auto">
            <div className="bg-white rounded-3xl shadow-lg sm:p-8 p-4">
              <div className="text-center py-12">
                <div className="mx-auto bg-red-100 text-red-600 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <X className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Access Denied
                </h2>
                <p className="text-slate-600 mb-6">
                  Only users with the agent role can list properties. Please
                  contact an administrator if you believe this is an error.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </AgentLayout>
    );
  }

  return (
    <AgentLayout>
      <div className="p-8">
        <div className="max-w-7xl min-w-[375px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              List New Property
            </h1>
            <p className="text-slate-600 mt-2">
              Fill in the details below to list your property
            </p>
          </div>

          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    Property submitted successfully!
                  </p>
                  <p className="text-sm mt-1">
                    Your property listing has been submitted for admin approval.
                    You will be notified once it's reviewed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {submitError && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {submitError}
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-lg sm:p-8 p-4">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Home className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-slate-900">
                    Basic Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Property Title *
                    </label>
                    <input
                      placeholder="Modern Family Home with Garden"
                      value={formData.propertyTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          propertyTitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Property Type *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setShowPropertyDropdown(!showPropertyDropdown)
                        }
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                      >
                        <span className="text-slate-700">
                          {formData.propertyType || "Select property type"}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            showPropertyDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {showPropertyDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg bg-white shadow-lg z-50 max-h-60 overflow-y-auto">
                          {propertyTypes.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  propertyType: type,
                                });
                                setShowPropertyDropdown(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between"
                            >
                              <span className="text-slate-700">{type}</span>
                              {formData.propertyType === type && (
                                <Check className="w-4 h-4 text-blue-500" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Listing Type *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="sale"
                          checked={formData.listingType === "sale"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              listingType: e.target.value,
                            })
                          }
                          className="w-4 h-4 text-blue-500"
                        />
                        <span className="text-slate-700">For Sale</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="rent"
                          checked={formData.listingType === "rent"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              listingType: e.target.value,
                            })
                          }
                          className="w-4 h-4 text-blue-500"
                        />
                        <span className="text-slate-700">For Rent</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Property Status
                    </label>
                    <div className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600">
                      Pending Admin Approval
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      All new listings require admin approval before being
                      published
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Pricing & Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-slate-900">
                    Pricing & Property Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      {formData.listingType === "sale"
                        ? "Sale Price (₱) *"
                        : "Monthly Rent (₱) *"}
                    </label>
                    <input
                      placeholder="₱50,000"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Bedrooms *
                    </label>
                    <input
                      type="number"
                      placeholder="2"
                      value={formData.bedrooms}
                      onChange={(e) =>
                        setFormData({ ...formData, bedrooms: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Bathrooms *
                    </label>
                    <input
                      type="number"
                      placeholder="1"
                      value={formData.bathrooms}
                      onChange={(e) =>
                        setFormData({ ...formData, bathrooms: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Square Feet
                    </label>
                    <input
                      type="number"
                      placeholder="1,500"
                      value={formData.squareFeet}
                      onChange={(e) =>
                        setFormData({ ...formData, squareFeet: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Lot Size (sqm)
                    </label>
                    <input
                      type="number"
                      placeholder="200"
                      value={formData.lotSize}
                      onChange={(e) =>
                        setFormData({ ...formData, lotSize: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Year Built
                    </label>
                    <input
                      type="number"
                      placeholder="2020"
                      value={formData.yearBuilt}
                      onChange={(e) =>
                        setFormData({ ...formData, yearBuilt: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Parking Spaces
                    </label>
                    <input
                      type="number"
                      placeholder="2"
                      value={formData.parkingSpaces}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          parkingSpaces: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {formData.listingType === "rent" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-slate-900 mb-2 block">
                        Available From
                      </label>
                      <input
                        type="date"
                        value={formData.availableFrom}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            availableFrom: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 mb-2 block">
                        Furnished Status
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setShowFurnishedDropdown(!showFurnishedDropdown)
                          }
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                        >
                          <span className="text-slate-700">
                            {formData.furnished || "Select status"}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              showFurnishedDropdown ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {showFurnishedDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg bg-white shadow-lg z-50">
                            {furnishedOptions.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    furnished: option,
                                  });
                                  setShowFurnishedDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between"
                              >
                                <span className="text-slate-700">{option}</span>
                                {formData.furnished === option && (
                                  <Check className="w-4 h-4 text-blue-500" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-slate-200" />

              {/* Location Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-slate-900">Location</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Street Address *
                    </label>
                    <input
                      placeholder="123 Main Street"
                      value={formData.streetAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          streetAddress: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      City *
                    </label>
                    <input
                      placeholder="Manila"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      State/Province
                    </label>
                    <input
                      placeholder="Metro Manila"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      ZIP/Postal *
                    </label>
                    <input
                      placeholder="1006"
                      value={formData.zipPostal}
                      onChange={(e) =>
                        setFormData({ ...formData, zipPostal: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Country
                    </label>
                    <input
                      placeholder="Philippines"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Description Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-slate-900">
                    Property Description
                  </h2>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-900 mb-2 block">
                    Description *
                  </label>
                  <textarea
                    placeholder="Describe your property in detail. Include information about the neighborhood, nearby amenities, recent renovations, and what makes this property special..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* About This Property Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-slate-900">
                    About This Property
                  </h2>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-900 mb-2 block">
                    About this property
                  </label>
                  <textarea
                    placeholder="Share unique highlights, history, renovations, or special rules..."
                    value={formData.aboutProperty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        aboutProperty: e.target.value,
                      })
                    }
                    rows={5}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Nearby Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-slate-900">Nearby</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Place
                    </label>
                    <input
                      placeholder="School, mall, park..."
                      value={nearbyName}
                      onChange={(e) => setNearbyName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Description
                    </label>
                    <input
                      placeholder="Brief details about this place"
                      value={nearbyDescription}
                      onChange={(e) => setNearbyDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Distance (km) *
                    </label>
                    <input
                      type="number"
                      placeholder="1.2"
                      value={nearbyDistanceKm}
                      onChange={(e) => setNearbyDistanceKm(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={addNearby}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Nearby
                  </button>
                </div>

                {formData.nearby.length > 0 && (
                  <div className="border border-slate-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-slate-900 mb-2">
                      Added Nearby Places:
                    </p>
                    <div className="space-y-2">
                      {formData.nearby.map((n, index) => (
                        <div
                          key={`${n.name}-${index}`}
                          className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
                        >
                          <div className="text-sm text-slate-800">
                            <span className="font-semibold">{n.name}</span>
                            {n.description && (
                              <span className="text-slate-600">
                                {" "}
                                — {n.description}
                              </span>
                            )}
                            <span className="ml-2 text-blue-600">
                              {n.distanceKm} km
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNearby(index)}
                            className="text-slate-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-slate-200" />

              {/* Features & Amenities Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Features & Amenities
                </h2>

                <div>
                  <label className="text-sm font-semibold text-slate-900 mb-2 block">
                    Add Features
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      placeholder="Type custom feature or select from below"
                      value={currentFeature}
                      onChange={(e) => setCurrentFeature(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addFeature(currentFeature))
                      }
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => addFeature(currentFeature)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {commonFeatures.map((feature) => (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => addFeature(feature)}
                        disabled={formData.features.includes(feature)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          formData.features.includes(feature)
                            ? "bg-blue-100 text-blue-700 cursor-not-allowed"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>

                  {formData.features.length > 0 && (
                    <div className="border border-slate-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-slate-900 mb-2">
                        Selected Features:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.features.map((feature) => (
                          <span
                            key={feature}
                            className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm flex items-center gap-2"
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() => removeFeature(feature)}
                              className="hover:bg-blue-600 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-900 mb-2 block">
                    Utilities Included
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {utilityOptions.map((utility) => (
                      <label
                        key={utility}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.utilities.includes(utility)}
                          onChange={() => toggleUtility(utility)}
                          className="w-4 h-4 text-blue-500 rounded"
                        />
                        <span className="text-slate-700">{utility}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.listingType === "rent" && (
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Pet Policy
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowPetDropdown(!showPetDropdown)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                      >
                        <span className="text-slate-700">
                          {formData.petPolicy || "Select pet policy"}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            showPetDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {showPetDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg bg-white shadow-lg z-50">
                          {petPolicies.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, petPolicy: option });
                                setShowPetDropdown(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between"
                            >
                              <span className="text-slate-700">{option}</span>
                              {formData.petPolicy === option && (
                                <Check className="w-4 h-4 text-blue-500" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-slate-200" />

              {/* Property Images Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Property Images
                </h2>
                <p className="text-sm text-slate-600">
                  Upload high-quality images of your property (2-4 images
                  required) *
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer aspect-square"
                      onClick={() => !preview && triggerFileInput(index)}
                    >
                      {preview ? (
                        <>
                          <img
                            src={preview}
                            alt={`Property ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute top-2 left-0 right-0 flex justify-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewImage(preview);
                              }}
                              className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                editImage(index);
                              }}
                              className="bg-amber-500 text-white p-1 rounded hover:bg-amber-600"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="w-8 h-8 text-slate-400 mb-2" />
                          <p className="text-xs text-slate-600 text-center px-2">
                            Click to upload image {index + 1}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Image counter */}
                <div className="text-sm text-slate-600">
                  Images uploaded:{" "}
                  {uploadedImages.filter((img) => img !== null).length} / 4
                  (Minimum 2 required)
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Contact Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-slate-900">
                    Contact Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Full Name *
                    </label>
                    <input
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                      Email *
                    </label>
                    <input
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-900 mb-2 block">
                    Phone Number *
                  </label>
                  <input
                    placeholder="+63 912 345 6789"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Form Actions */}
              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-slate-600">* Required fields</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Property"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AgentLayout>
  );
}
