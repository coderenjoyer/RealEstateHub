import { MapPin, Star, Phone, Mail, Calendar, Award, TrendingUp, User, Image, X, Upload, Camera, Pencil } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import supabase from "../../../supabaseClient"
import { useAuth } from "../../../AuthContext"

export function AgentProfileHero() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLocationEditMode, setIsLocationEditMode] = useState(false)
  const [editMode, setEditMode] = useState<'profile' | 'cover' | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [agentData, setAgentData] = useState<any>(null)
  const [location, setLocation] = useState("Binondo, Manila, 1006 Metro Manila")
  const [tempLocation, setTempLocation] = useState("")
  const [memberSince, setMemberSince] = useState("Jan 2017")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [savingLocation, setSavingLocation] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { session } = useAuth()
  const userId = session?.user?.id

  // Fetch agent data and images on component mount
  useEffect(() => {
    if (userId) {
      fetchAgentData()
    }
  }, [userId])

  const fetchAgentData = async () => {
    try {
      setLoading(true)
      
      // Get user data from auth
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      
      // Set agent data
      setAgentData({
        name: `${userData.user?.user_metadata?.first_name || ''} ${userData.user?.user_metadata?.last_name || ''}`.trim() || userData.user?.email,
        email: userData.user?.email,
        role: userData.user?.user_metadata?.role || 'agent',
        phone: userData.user?.user_metadata?.mobile_number || '+63 912 345 6789'
      })
      
      // Load location from user metadata
      const savedLocation = userData.user?.user_metadata?.location
      if (savedLocation) {
        setLocation(savedLocation)
      }
      
      // Format member since date from user creation
      if (userData.user?.created_at) {
        const createdDate = new Date(userData.user.created_at)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const formattedDate = `${monthNames[createdDate.getMonth()]} ${createdDate.getFullYear()}`
        setMemberSince(formattedDate)
      }
      
      // Try to get existing profile images from storage
      await loadImagesFromStorage()
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching agent data:', error)
      setLoading(false)
    }
  }

  const loadImagesFromStorage = async () => {
    if (!userId) return
    
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime()
      
      // Get profile image URL
      const { data: profileImageData } = supabase.storage.from('user-media').getPublicUrl(`${userId}/profile.jpg`)
      if (profileImageData?.publicUrl) {
        // Check if the image actually exists by trying to fetch it
        const response = await fetch(profileImageData.publicUrl, { method: 'HEAD' })
        if (response.ok) {
          setProfileImage(`${profileImageData.publicUrl}?t=${timestamp}`)
        } else {
          setProfileImage("/header.jpeg") // fallback image
        }
      } else {
        setProfileImage("/header.jpeg") // fallback image
      }
      
      // Get cover image URL
      const { data: coverImageData } = supabase.storage.from('user-media').getPublicUrl(`${userId}/cover.jpg`)
      if (coverImageData?.publicUrl) {
        // Check if the image actually exists by trying to fetch it
        const response = await fetch(coverImageData.publicUrl, { method: 'HEAD' })
        if (response.ok) {
          setCoverImage(`${coverImageData.publicUrl}?t=${timestamp}`)
        }
      }
    } catch (error) {
      console.error('Error loading images from storage:', error)
      setProfileImage("/header.jpeg") // fallback image
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
      // Validate file type
      if (!file.type.match('image.*')) {
        alert('Please select an image file (JPEG, PNG, etc.)')
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size too large. Please select an image under 10MB.')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          setPreviewImage(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleSaveImage = async () => {
    if (!previewImage || !editMode || !userId) return
    
    try {
      setUploading(true)
      
      // Convert base64 to blob
      const response = await fetch(previewImage)
      const blob = await response.blob()
      
      // Determine file name and path
      const fileName = editMode === 'profile' ? 'profile.jpg' : 'cover.jpg'
      const filePath = `${userId}/${fileName}`
      
      console.log('Uploading image to:', filePath)
      
      // Upload to Supabase Storage with correct bucket name
      const { data, error: uploadError } = await supabase.storage
        .from('user-media')
        .upload(filePath, blob, {
          upsert: true, // overwrite if exists
          contentType: blob.type
        })
      
      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }
      
      console.log('Upload successful:', data)
      
      // Get the public URL of the uploaded image with cache-busting timestamp
      const timestamp = new Date().getTime()
      const { data: imageData } = supabase.storage.from('user-media').getPublicUrl(filePath)
      const imageUrlWithTimestamp = `${imageData.publicUrl}?t=${timestamp}`
      console.log('Public URL:', imageUrlWithTimestamp)
      
      // Update the state with the new image
      if (editMode === 'profile') {
        setProfileImage(imageUrlWithTimestamp)
      } else {
        setCoverImage(imageUrlWithTimestamp)
      }
      
      // Close modal and reset
      setIsEditModalOpen(false)
      setPreviewImage(null)
      setEditMode(null)
      
      alert('Image uploaded successfully!')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      alert(`Failed to upload image: ${error.message || 'Please try again.'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setPreviewImage(null)
    setEditMode(null)
  }

  const handleLocationEdit = () => {
    setTempLocation(location)
    setIsLocationEditMode(true)
  }

  const handleLocationSave = async () => {
    try {
      setSavingLocation(true)
      
      const { error } = await supabase.auth.updateUser({
        data: {
          location: tempLocation
        }
      })
      
      if (error) {
        console.error('Error saving location:', error)
        alert('Failed to save location. Please try again.')
        return
      }
      
      setLocation(tempLocation)
      setIsLocationEditMode(false)
      alert('Location updated successfully!')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save location. Please try again.')
    } finally {
      setSavingLocation(false)
    }
  }

  const handleLocationCancel = () => {
    setIsLocationEditMode(false)
    setTempLocation("")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              <div className="relative h-40 w-40 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden">
                <img src={profileImage || "/header.jpeg"} alt="Agent profile" className="h-full w-full object-cover" />
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
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{agentData?.name || "Agent Name"}</h1>
                  <p className="text-lg text-slate-600 font-medium">Real Estate Agent</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-slate-600 mb-6">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                {isLocationEditMode ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={tempLocation}
                      onChange={(e) => setTempLocation(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter location"
                      autoFocus
                    />
                    <button
                      onClick={handleLocationSave}
                      disabled={savingLocation || !tempLocation.trim()}
                      className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingLocation ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleLocationCancel}
                      disabled={savingLocation}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 group">
                    <span className="text-sm font-medium">{location}</span>
                    <button
                      onClick={handleLocationEdit}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-50 rounded transition-all"
                      title="Edit location"
                    >
                      <Pencil className="w-4 h-4 text-blue-500" />
                    </button>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-center sm:text-left">
                  <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700">{agentData?.phone || "+63 912 345 6789"}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-center sm:text-left">
                  <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700">{agentData?.email || "agent@example.com"}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-center sm:text-left">
                  <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700">Member since {memberSince}</span>
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
                        src={editMode === 'profile' ? (profileImage || "/header.jpeg") : (coverImage || "/header.jpeg")} 
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
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700 mb-1">Click to upload new image</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
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
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveImage}
                    disabled={!previewImage || uploading}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : 'Save Changes'}
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