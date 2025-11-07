import { MapPin, Star, Phone, Mail, Calendar, Award, TrendingUp, User, Image, X, Upload, Camera, Pencil, Loader2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import supabase from "../../supabaseClient"
import { useAuth } from "../../AuthContext"

export function AgentProfileHero() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const STORAGE_BUCKET = import.meta.env.VITE_STORAGE_BUCKET || "user-media"

  // Get user metadata
  const userMeta = session?.user?.user_metadata as Record<string, any> | undefined
  const firstName = userMeta?.first_name?.toString()?.trim()
  const lastName = userMeta?.last_name?.toString()?.trim()
  const displayName = (firstName || lastName)
    ? `${firstName ?? ''} ${lastName ?? ''}`.trim()
    : (session?.user?.email?.split('@')[0] ?? 'Agent')
  const userEmail = session?.user?.email ?? ''
  const userPhone = userMeta?.mobile_number?.toString()?.trim() ?? ''

  // State management
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editMode, setEditMode] = useState<'profile' | 'cover' | null>(null)
  const [profileImage, setProfileImage] = useState("/header.jpeg")
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Agent-specific data
  const [agentData, setAgentData] = useState({
    propertiesSold: 127,
    yearsExperience: 8,
    rating: 4.9,
    location: "Binondo, Manila, 1006 Metro Manila",
    memberSince: "Jan 2017"
  })

  // Load agent profile from database
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }
      
      try {
        const { data, error } = await supabase
          .from("agent_profiles")
          .select("profile_image_url, cover_image_url, properties_sold, years_experience, rating, location, member_since")
          .eq("user_id", userId)
          .maybeSingle()
        
        if (!isMounted) return
        
        if (error) {
          console.error("Failed to load agent profile:", error)
          setIsLoading(false)
          return
        }
        
        if (data) {
          if (data.profile_image_url) setProfileImage(data.profile_image_url)
          if (data.cover_image_url) setCoverImage(data.cover_image_url)
          
          setAgentData({
            propertiesSold: data.properties_sold ?? 127,
            yearsExperience: data.years_experience ?? 8,
            rating: data.rating ?? 4.9,
            location: data.location ?? "Binondo, Manila, 1006 Metro Manila",
            memberSince: data.member_since ?? "Jan 2017"
          })
        }
        setIsLoading(false)
      } catch (err) {
        console.error("Error loading profile:", err)
        setIsLoading(false)
      }
    })()
    
    return () => { isMounted = false }
  }, [userId])

  // Upsert agent profile
  const upsertAgentProfile = async (partial: Record<string, unknown>) => {
    if (!userId) return { error: new Error("No user session") }
    const payload = { user_id: userId, ...partial }
    const { error } = await supabase
      .from("agent_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select("id")
      .single()
    return { error }
  }

  // Upload image to Supabase Storage
  const uploadImageFromDataUrl = async (dataUrl: string, kind: "profile" | "cover") => {
    if (!userId) return { publicUrl: null as string | null, error: new Error("No user session") }
    
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const contentType = blob.type || "image/png"
      const ext = contentType.split("/")[1] || "png"
      const path = `agents/${userId}/${kind}-${Date.now()}.${ext}`
      
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, blob, { upsert: true, contentType })
      
      if (uploadError) return { publicUrl: null, error: uploadError }
      
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
      return { publicUrl: data.publicUrl, error: null }
    } catch (e: any) {
      return { publicUrl: null, error: e }
    }
  }

  const handleEditClick = (mode: 'profile' | 'cover') => {
    setEditMode(mode)
    setIsEditModalOpen(true)
    setIsDropdownOpen(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleClickOutside = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setIsDropdownOpen(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreviewImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveImage = () => {
    (async () => {
      setErrorMessage(null)
      if (!previewImage || !editMode) {
        setIsEditModalOpen(false)
        setPreviewImage(null)
        setEditMode(null)
        return
      }
      
      setIsSaving(true)
      
      if (editMode !== 'profile' && editMode !== 'cover') {
        setIsSaving(false)
        return
      }
      
      const { publicUrl, error } = await uploadImageFromDataUrl(previewImage, editMode)
      
      if (error || !publicUrl) {
        console.error("Image upload failed:", error)
        setIsSaving(false)
        setErrorMessage(`Failed to upload image: ${error?.message ?? 'Unknown error'}`)
        return
      }
      
      if (editMode === 'profile') {
        setProfileImage(publicUrl)
        await upsertAgentProfile({ profile_image_url: publicUrl })
      } else {
        setCoverImage(publicUrl)
        await upsertAgentProfile({ cover_image_url: publicUrl })
      }
      
      setIsSaving(false)
      setIsEditModalOpen(false)
      setPreviewImage(null)
      setEditMode(null)
    })()
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setPreviewImage(null)
    setEditMode(null)
    setErrorMessage(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-sky-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading agent profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-[#b8d4e6]" onClick={handleClickOutside}>
      {/* Hero Background Section */}
      <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-blue-500 via-blue-400 to-sky-300">
        {coverImage && (
          <img 
            src={coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-20 w-24 h-24 border-4 border-white rounded-full"></div>
          <div className="absolute top-20 right-40 w-16 h-16 border-4 border-white rounded-full"></div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="relative max-w-11xl mx-auto px-1 -mt-20">
        <div className="bg-white rounded-3xl shadow-xl sm:p-8 p-4 min-w-[375px]">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              <div className="relative h-40 w-40 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden">
                <img src={profileImage} alt="Agent profile" className="h-full w-full object-cover" />
              </div>
              {/* Pencil Edit Badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <button 
                    onClick={toggleDropdown}
                    className="bg-blue-500 hover:bg-blue-600 rounded-full p-2 shadow-md border-2 border-white transition-colors duration-200"
                    title="Edit Profile"
                  >
                    <Pencil className="w-5 h-5 text-white" />
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
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Edit Profile Picture</span>
                      </button>
                      <button
                        onClick={() => handleEditClick('cover')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <Image className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Edit Cover Photo</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{displayName}</h1>
                  <p className="text-lg text-slate-600 font-medium">Senior Real Estate Agent</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-slate-600 mb-6">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">{agentData.location}</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Properties Sold</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">{agentData.propertiesSold}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-semibold text-green-900 uppercase tracking-wide">Years Experience</p>
                  </div>
                  <p className="text-3xl font-bold text-green-700">{agentData.yearsExperience}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-purple-600" />
                    <p className="text-xs font-semibold text-purple-900 uppercase tracking-wide">Rating</p>
                  </div>
                  <p className="text-3xl font-bold text-purple-700">{agentData.rating}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-center sm:text-left">
                  <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700">{userPhone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-center sm:text-left">
                  <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700">{userEmail}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-center sm:text-left">
                  <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700">Member since {agentData.memberSince}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {editMode === 'profile' && 'Edit Profile Picture'}
                  {editMode === 'cover' && 'Edit Cover Photo'}
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSaving}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
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
                    <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 shadow-md border-2 border-white">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Current {editMode === 'profile' ? 'Profile Picture' : 'Cover Photo'}</p>
                </div>

                {/* Upload Section */}
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={isSaving}
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
                        <div className={`relative overflow-hidden rounded-xl border-4 border-blue-200 shadow-lg ${
                          editMode === 'profile' ? 'w-32 h-32' : 'w-full h-32'
                        }`}>
                          <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-md border-2 border-white">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <p className="text-sm text-green-600 mt-2">New {editMode === 'profile' ? 'Profile Picture' : 'Cover Photo'} Preview</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveImage}
                    disabled={!previewImage || isSaving}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}