import { MapPin, Phone, Mail, Calendar, Home, Edit3, Briefcase, Award, ArrowLeft, X, Upload, Camera, Image as ImageIcon, User, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import supabase from "../../supabaseClient"
import { useAuth } from "../../AuthContext"

function UserProfilePage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const userId = session?.user?.id;
  const STORAGE_BUCKET = import.meta.env.VITE_STORAGE_BUCKET || "user-media";

  const userMeta = session?.user?.user_metadata as Record<string, any> | undefined;
  const firstName = userMeta?.first_name?.toString()?.trim();
  const lastName = userMeta?.last_name?.toString()?.trim();
  const displayName = (firstName || lastName)
    ? `${firstName ?? ''} ${lastName ?? ''}`.trim()
    : (session?.user?.email?.split('@')[0] ?? 'User');
  const userEmail = session?.user?.email ?? '';
  const userPhone = userMeta?.mobile_number?.toString()?.trim() ?? '';
  
  // Format user join date
  const userCreatedAt = session?.user?.created_at;
  const formatJoinDate = (dateString: string | undefined) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  const memberSince = formatJoinDate(userCreatedAt);
  
  // State management for edit functionality
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<'profile' | 'cover' | 'bio' | 'preferences' | 'location' | null>(null);
  const [profileImage, setProfileImage] = useState("/header.jpeg");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [preferredLocation, setPreferredLocation] = useState<string | null>(null);
  const [budgetRange, setBudgetRange] = useState<string | null>(null);
  const [investmentGoal, setInvestmentGoal] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<string | null>(null);

  // Load user profile from database
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("profile_image_url, cover_image_url, bio, property_type, preferred_location, budget_range, investment_goal, current_location")
        .eq("user_id", userId)
        .maybeSingle();
      if (!isMounted) return;
      if (error) {
        console.error("Failed to load profile:", error);
        return;
      }
      if (data) {
        if (data.profile_image_url) setProfileImage(data.profile_image_url);
        if (data.cover_image_url) setCoverImage(data.cover_image_url);
        if (typeof data.bio === "string") setBio(data.bio);
        if (data.property_type) setPropertyType(data.property_type);
        if (data.preferred_location) setPreferredLocation(data.preferred_location);
        if (data.budget_range) setBudgetRange(data.budget_range);
        if (data.investment_goal) setInvestmentGoal(data.investment_goal);
        if (data.current_location) setUserLocation(data.current_location);
      }
    })();
    return () => { isMounted = false };
  }, [userId]);

  const upsertProfile = async (partial: Record<string, unknown>) => {
    if (!userId) return { error: new Error("No user session") };
    
    // Just try to update - the profile should already exist
    const { error: updateError } = await supabase
      .from("profiles")
      .update(partial)
      .eq("user_id", userId);
    
    if (updateError) {
      console.error("Update error:", updateError);
      return { error: updateError };
    }
    
    return { error: null };
  };

  const uploadImageFromDataUrl = async (dataUrl: string, kind: "profile" | "cover") => {
    if (!userId) return { publicUrl: null as string | null, error: new Error("No user session") };
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const contentType = blob.type || "image/png";
      const ext = contentType.split("/")[1] || "png";
      const path = `${userId}/${kind}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, blob, { upsert: true, contentType });
      if (uploadError) return { publicUrl: null, error: uploadError };
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      return { publicUrl: data.publicUrl, error: null };
    } catch (e: any) {
      return { publicUrl: null, error: e };
    }
  };

  const handleEditClick = (mode: 'profile' | 'cover' | 'bio' | 'preferences' | 'location') => {
    setEditMode(mode);
    setIsEditModalOpen(true);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClickOutside = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setIsDropdownOpen(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = () => {
    (async () => {
      setErrorMessage(null);
      if (!previewImage || !editMode) {
        setIsEditModalOpen(false);
        setPreviewImage(null);
        setEditMode(null);
        return;
      }
      setIsSaving(true);
      if (editMode !== 'profile' && editMode !== 'cover') {
        setIsSaving(false);
        return;
      }
      const { publicUrl, error } = await uploadImageFromDataUrl(previewImage, editMode);
      if (error || !publicUrl) {
        console.error("Image upload failed:", error);
        setIsSaving(false);
        setErrorMessage(`Failed to upload image: ${error?.message ?? 'Unknown error'}`);
        return;
      }
      if (editMode === 'profile') {
        setProfileImage(publicUrl);
        await upsertProfile({ profile_image_url: publicUrl });
      } else {
        setCoverImage(publicUrl);
        await upsertProfile({ cover_image_url: publicUrl });
      }
      setIsSaving(false);
      setIsEditModalOpen(false);
      setPreviewImage(null);
      setEditMode(null);
    })();
  };

  const handleSaveBio = () => {
    (async () => {
      setErrorMessage(null);
      setIsSaving(true);
      const { error } = await upsertProfile({ bio });
      setIsSaving(false);
      if (error) {
        console.error("Failed to save bio:", error);
        setErrorMessage(`Failed to save bio: ${error.message ?? 'Unknown error'} (Code: ${(error as any).code})`);
        return;
      }
      setIsEditModalOpen(false);
      setEditMode(null);
    })();
  };

  const handleSavePreferences = () => {
    (async () => {
      setErrorMessage(null);
      setIsSaving(true);
      const { error } = await upsertProfile({
        property_type: propertyType ?? null,
        preferred_location: preferredLocation ?? null,
        budget_range: budgetRange ?? null,
        investment_goal: investmentGoal ?? null,
      });
      setIsSaving(false);
      if (error) {
        console.error("Failed to save preferences:", error);
        setErrorMessage(`Failed to save preferences: ${error.message ?? 'Unknown error'} (Code: ${(error as any).code})`);
        return;
      }
      setIsEditModalOpen(false);
      setEditMode(null);
    })();
  };  

  const handleSaveLocation = () => {
    (async () => {
      setErrorMessage(null);
      setIsSaving(true);
      const { error } = await upsertProfile({
        current_location: userLocation ?? null,
      });
      setIsSaving(false);
      if (error) {
        console.error("Failed to save location:", error);
        setErrorMessage(`Failed to save location: ${error.message ?? 'Unknown error'} (Code: ${(error as any).code})`);
        return;
      }
      setIsEditModalOpen(false);
      setEditMode(null);
    })();
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setPreviewImage(null);
    setEditMode(null);
  };

  return (
    <div 
      className="min-h-screen bg-[#E8F6F8]"
      onClick={handleClickOutside}
    >
      {/* Hero Background Section */}
      <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden bg-[#49769F]">
        {coverImage && (
          <img 
            src={coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        {/* Cover Photo Edit Button */}
        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-20 w-24 h-24 border-4 border-white rounded-full"></div>
          <div className="absolute top-20 right-40 w-16 h-16 border-4 border-white rounded-full"></div>
        </div>
      </div>

      {/* Back Button */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/user")}
          className="flex items-center gap-1 sm:gap-2 bg-white/90 hover:bg-white text-slate-700 border-slate-300 shadow-md text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Back to Properties</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      {/* Profile Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8">
          {errorMessage && (
            <div className="mb-4 text-sm text-red-600">{errorMessage}</div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 items-start">
            {/* Profile Image */}
            <div className="relative flex-shrink-0 mx-auto sm:mx-0">
              <div className="relative h-32 w-32 sm:h-36 sm:w-36 lg:h-40 lg:w-40 rounded-xl sm:rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden">
                <img src={profileImage} alt="User profile" className="h-full w-full object-cover" />
              </div>
              {/* Edit Profile Badge with Dropdown */}
              <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <button 
                    onClick={toggleDropdown}
                    className="bg-[#49769F] hover:bg-[#49769F]/90 rounded-full p-1.5 sm:p-2 shadow-md border-2 border-white transition-colors duration-200"
                    title="Edit Profile"
                  >
                    <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div 
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleEditClick('profile')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-[#49769F]" />
                        <span className="text-sm font-medium text-gray-700">Edit Profile Picture</span>
                      </button>
                      <button
                        onClick={() => handleEditClick('cover')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <Image className="w-4 h-4 text-[#49769F]" />
                        <span className="text-sm font-medium text-gray-700">Edit Cover Photo</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{displayName}</h1> 
                <p className="text-base sm:text-lg text-slate-600 font-medium">User</p>
              </div>

              {/* Location */}
              <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-600 mb-4 sm:mb-6">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#49769F]" />
                <span className="text-sm font-medium cursor-pointer hover:text-[#49769F] transition-colors" onClick={() => handleEditClick('location')}>
                  {userLocation || 'Add location'}
                </span>
              </div>

              {/* Contact Info */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-center sm:text-left">
                  <Phone className="w-4 h-4 text-[#49769F] flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700">{userPhone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-center sm:text-left">
                  <Mail className="w-4 h-4 text-[#49769F] flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700">{userEmail || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-center sm:text-left">
                  <Calendar className="w-4 h-4 text-[#49769F] flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700">Member since {memberSince}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Profile Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Bio Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">About Me</h2>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 self-start sm:self-auto"
                onClick={() => handleEditClick('bio')}
              >
                <Edit3 className="w-4 h-4" />
                {isSaving && editMode === 'bio' ? 'Saving...' : 'Edit Bio'}
              </Button>
            </div>
            <div className="prose prose-slate max-w-none text-left">
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">{bio}</p>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Property Preferences</h2>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 self-start sm:self-auto"
                onClick={() => handleEditClick('preferences')}
              >
                <Edit3 className="w-4 h-4" />
                {isSaving && editMode === 'preferences' ? 'Saving...' : 'Edit Preferences'}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-[#49769F]/10 rounded-xl border border-[#49769F]/20">
                  <Home className="w-5 h-5 text-[#49769F]" />
                  <div>
                    <p className="font-semibold text-[#49769F]">Property Type</p>
                    <p className="text-sm text-gray-700">{propertyType || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#49769F]/10 rounded-xl border border-[#49769F]/20">
                  <MapPin className="w-5 h-5 text-[#49769F]" />
                  <div>
                    <p className="font-semibold text-[#49769F]">Preferred Location</p>
                    <p className="text-sm text-gray-700">{preferredLocation || 'Not set'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-[#49769F]/10 rounded-xl border border-[#49769F]/20">
                  <Briefcase className="w-5 h-5 text-[#49769F]" />
                  <div>
                    <p className="font-semibold text-[#49769F]">Budget Range</p>
                    <p className="text-sm text-gray-700">{budgetRange || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#49769F]/10 rounded-xl border border-[#49769F]/20">
                  <Award className="w-5 h-5 text-[#49769F]" />
                  <div>
                    <p className="font-semibold text-[#49769F]">Investment Goal</p>
                    <p className="text-sm text-gray-700">{investmentGoal || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
            editMode === 'bio' || editMode === 'preferences' ? 'max-w-2xl' : 'max-w-md'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {editMode === 'profile' && 'Edit Profile Picture'}
                  {editMode === 'cover' && 'Edit Cover Photo'}
                  {editMode === 'bio' && 'Edit Bio'}
                  {editMode === 'location' && 'Edit Location'}
                  {editMode === 'preferences' && 'Edit Property Preferences'}
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Image Upload Modal */}
                {(editMode === 'profile' || editMode === 'cover') && (
                  <>
                    {/* Current Image Preview */}
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className={`relative overflow-hidden rounded-xl border-4 border-white shadow-lg ${
                          editMode === 'profile' ? 'w-32 h-32' : 'w-full h-32'
                        }`}>
                          <img 
                            src={editMode === 'profile' ? profileImage : (coverImage || '/header.jpeg')} 
                            alt="Current" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-[#49769F] rounded-full p-2 shadow-md border-2 border-white">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Current {editMode === 'profile' ? 'Profile Picture' : 'Cover Photo'}</p>
                    </div>

                    {/* Upload Section */}
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#49769F] transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700 mb-1">Click to upload new image</p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </label>
                      </div>

                      {/* Preview New Image */}
                      {previewImage && (
                        <div className="text-center">
                          <div className="relative inline-block">
                            <div className={`relative overflow-hidden rounded-xl border-4 border-[#49769F]/30 shadow-lg ${
                              editMode === 'profile' ? 'w-32 h-32' : 'w-full h-32'
                            }`}>
                              <img 
                                src={previewImage} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-md border-2 border-white">
                              <ImageIcon className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <p className="text-sm text-green-600 mt-2">New {editMode === 'profile' ? 'Profile Picture' : 'Cover Photo'} Preview</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Bio Edit Modal */}
                {editMode === 'bio' && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                        About Me
                      </label>
                      <textarea
                        id="bio"
                        value={bio ?? ''}
                        onChange={(e) => setBio(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#49769F] focus:border-[#49769F] resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Share your interests, experience, and what you're looking for in properties.
                    </p>
                  </div>
                )}

                {/* Preferences Edit Modal */}
                {/* Location Edit Modal */}
                {editMode === 'location' && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="userLocation" className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        id="userLocation"
                        value={userLocation ?? ''}
                        onChange={(e) => setUserLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#49769F] focus:border-[#49769F]"
                        placeholder="e.g., Makati City, Metro Manila"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Enter your city or area for better property recommendations.
                    </p>
                  </div>
                )}

                {editMode === 'preferences' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                          Property Type
                        </label>
                        <input
                          type="text"
                          id="propertyType"
                          value={propertyType ?? ''}
                          onChange={(e) => setPropertyType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#49769F] focus:border-[#49769F]"
                          placeholder="e.g., Condominium, Townhouse"
                        />
                      </div>
                      <div>
                        <label htmlFor="preferredLocation" className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Location
                        </label>
                        <input
                          type="text"
                          id="preferredLocation"
                          value={preferredLocation ?? ''}
                          onChange={(e) => setPreferredLocation(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#49769F] focus:border-[#49769F]"
                          placeholder="e.g., Makati, BGC, Ortigas"
                        />
                      </div>
                      <div>
                        <label htmlFor="budgetRange" className="block text-sm font-medium text-gray-700 mb-2">
                          Budget Range
                        </label>
                        <input
                          type="text"
                          id="budgetRange"
                          value={budgetRange ?? ''}
                          onChange={(e) => setBudgetRange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#49769F] focus:border-[#49769F]"
                          placeholder="e.g., ₱3M - ₱8M"
                        />
                      </div>
                      <div>
                        <label htmlFor="investmentGoal" className="block text-sm font-medium text-gray-700 mb-2">
                          Investment Goal
                        </label>
                        <input
                          type="text"
                          id="investmentGoal"
                          value={investmentGoal ?? ''}
                          onChange={(e) => setInvestmentGoal(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#49769F] focus:border-[#49769F]"
                          placeholder="e.g., Long-term rental income"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Update your property preferences to get better recommendations.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={
                      editMode === 'bio' ? handleSaveBio :
                      editMode === 'preferences' ? handleSavePreferences :
                      editMode === 'location' ? handleSaveLocation :
                      handleSaveImage
                    }
                    disabled={((editMode === 'profile' || editMode === 'cover') && !previewImage) || isSaving}
                    className="flex-1 bg-[#49769F] hover:bg-[#49769F]/90"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfilePage