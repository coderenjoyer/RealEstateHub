import { User, Home, Bookmark, CheckCircle, TrendingUp, Users, MapPin, Star, Pencil, X } from "lucide-react"
import { useState, useEffect } from "react"
import supabase from "../../../supabaseClient"
import { useAuth } from "../../../AuthContext"

interface RecentProperty {
  id: number
  property_title: string
  street_address: string
  city: string
  price: number
  property_status: string
  created_at: string
  media?: any
}

interface ListedProperty {
  id: number
  property_title: string
  street_address: string
  city: string
  price: number
  property_type: string
  listing_type: string
  media?: any
}

const achievements = [
  { label: "Top Performer 2024", icon: TrendingUp, color: "blue" },
  { label: "Customer Choice Award", icon: Star, color: "yellow" },
  { label: "100+ Happy Clients", icon: Users, color: "green" },
  { label: "Licensed Professional", icon: CheckCircle, color: "purple" }
]

export function AgentProfileCards() {
  const { session } = useAuth()
  const [isEditingAbout, setIsEditingAbout] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeListings, setActiveListings] = useState(0)
  const [loadingStats, setLoadingStats] = useState(true)
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [listedProperties, setListedProperties] = useState<ListedProperty[]>([])
  const [loadingListed, setLoadingListed] = useState(true)
  
  // About Me states
  const [aboutData, setAboutData] = useState({
    bio: "I'm a dedicated real estate professional with over 8 years of experience in the Metro Manila property market. My passion is helping families find their dream homes and investors discover lucrative opportunities.",
    specializations: ["Residential Sales", "Property Investment", "Luxury Homes", "Commercial Properties"],
    languages: "English, Filipino, Mandarin Chinese",
    certifications: ["Licensed Real Estate Broker (PRC)", "Certified Property Consultant"]
  })
  
  // Temporary editing states
  const [tempAboutData, setTempAboutData] = useState(aboutData)
  const [newSpecialization, setNewSpecialization] = useState("")
  const [newCertification, setNewCertification] = useState("")

  useEffect(() => {
    fetchAboutData()
    fetchPropertyStats()
    fetchRecentProperties()
    fetchListedProperties()
  }, [])

  const fetchAboutData = async () => {
    try {
      const { data: userData, error } = await supabase.auth.getUser()
      if (error) throw error

      const savedAbout = userData.user?.user_metadata?.about
      if (savedAbout) {
        setAboutData(savedAbout)
        setTempAboutData(savedAbout)
      }
    } catch (error) {
      console.error('Error fetching about data:', error)
    }
  }

  const fetchPropertyStats = async () => {
    try {
      setLoadingStats(true)
      
      if (!session?.user?.id) {
        return
      }

      // Fetch active listings count
      const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_deleted', false)
        .eq('property_status', 'available')

      if (error) {
        console.error('Error fetching active listings:', error)
      } else {
        setActiveListings(count || 0)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchRecentProperties = async () => {
    try {
      setLoadingRecent(true)
      
      if (!session?.user?.id) {
        return
      }

      // Fetch recent properties (last 3)
      const { data, error } = await supabase
        .from('properties')
        .select('id, property_title, street_address, city, price, property_status, created_at, media')
        .eq('user_id', session.user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) {
        console.error('Error fetching recent properties:', error)
      } else {
        setRecentProperties(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoadingRecent(false)
    }
  }

  const fetchListedProperties = async () => {
    try {
      setLoadingListed(true)
      
      if (!session?.user?.id) {
        return
      }

      // Fetch 4 most recent listed properties
      const { data, error } = await supabase
        .from('properties')
        .select('id, property_title, street_address, city, price, property_type, listing_type, media')
        .eq('user_id', session.user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(4)

      if (error) {
        console.error('Error fetching listed properties:', error)
      } else {
        setListedProperties(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoadingListed(false)
    }
  }

  const handleEditAbout = () => {
    setTempAboutData(aboutData)
    setIsEditingAbout(true)
  }

  const handleCancelEdit = () => {
    setTempAboutData(aboutData)
    setNewSpecialization("")
    setNewCertification("")
    setIsEditingAbout(false)
  }

  const handleSaveAbout = async () => {
    try {
      setSaving(true)

      const { error } = await supabase.auth.updateUser({
        data: {
          about: tempAboutData
        }
      })

      if (error) {
        console.error('Error saving about data:', error)
        alert('Failed to save changes. Please try again.')
        return
      }

      setAboutData(tempAboutData)
      setIsEditingAbout(false)
      setNewSpecialization("")
      setNewCertification("")
      alert('About section updated successfully!')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const addSpecialization = () => {
    if (newSpecialization.trim()) {
      setTempAboutData({
        ...tempAboutData,
        specializations: [...tempAboutData.specializations, newSpecialization.trim()]
      })
      setNewSpecialization("")
    }
  }

  const removeSpecialization = (index: number) => {
    setTempAboutData({
      ...tempAboutData,
      specializations: tempAboutData.specializations.filter((_, i) => i !== index)
    })
  }

  const addCertification = () => {
    if (newCertification.trim()) {
      setTempAboutData({
        ...tempAboutData,
        certifications: [...tempAboutData.certifications, newCertification.trim()]
      })
      setNewCertification("")
    }
  }

  const removeCertification = (index: number) => {
    setTempAboutData({
      ...tempAboutData,
      certifications: tempAboutData.certifications.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="bg-[#b8d4e6] px-4 sm:px-8 py-8">
      <div className="max-w-7xl min-w-[375px] mx-auto space-y-6">
        {/* Top Row - About Me and Property Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* About Me Card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">About Me</h3>
              </div>
              {!isEditingAbout && (
                <button
                  onClick={handleEditAbout}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title="Edit About Me"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="sm:p-6 p-4 space-y-4">
              {/* Bio */}
              <div>
                {isEditingAbout ? (
                  <textarea
                    value={tempAboutData.bio}
                    onChange={(e) => setTempAboutData({ ...tempAboutData, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 leading-relaxed resize-none"
                    rows={4}
                    placeholder="Write your bio..."
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed">
                    {aboutData.bio}
                  </p>
                )}
              </div>

              {/* Specializations */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Specializations:</h4>
                <div className="flex flex-wrap gap-2">
                  {(isEditingAbout ? tempAboutData.specializations : aboutData.specializations).map((spec, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                      {spec}
                      {isEditingAbout && (
                        <button
                          onClick={() => removeSpecialization(index)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
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
                      onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
                      className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add specialization..."
                    />
                    <button
                      onClick={addSpecialization}
                      className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Languages */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Languages:</h4>
                {isEditingAbout ? (
                  <input
                    type="text"
                    value={tempAboutData.languages}
                    onChange={(e) => setTempAboutData({ ...tempAboutData, languages: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., English, Filipino, Mandarin Chinese"
                  />
                ) : (
                  <p className="text-slate-600 text-sm">{aboutData.languages}</p>
                )}
              </div>

              {/* Certifications */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Certifications:</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  {(isEditingAbout ? tempAboutData.certifications : aboutData.certifications).map((cert, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="flex-1">{cert}</span>
                      {isEditingAbout && (
                        <button
                          onClick={() => removeCertification(index)}
                          className="hover:bg-slate-100 rounded p-1"
                        >
                          <X className="w-3 h-3 text-slate-500" />
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
                      onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                      className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add certification..."
                    />
                    <button
                      onClick={addCertification}
                      className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Edit Actions */}
              {isEditingAbout && (
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAbout}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Property Summary Card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Home className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Property Summary</h3>
            </div>
            <div className="sm:p-6 p-4">
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-blue-900 font-semibold mb-1">Active Listings</p>
                  <p className="text-3xl font-bold text-blue-600">{loadingStats ? '...' : activeListings}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Recent Activity</h4>
                <div className="space-y-2">
                  {loadingRecent ? (
                    <div className="p-4 text-center text-slate-500">
                      <p className="text-sm">Loading recent properties...</p>
                    </div>
                  ) : recentProperties.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">
                      <p className="text-sm">No recent properties found</p>
                    </div>
                  ) : (
                    recentProperties.map((property) => {
                      // Get first image from media array if available
                      const firstImage = property.media && property.media.length > 0 
                        ? property.media[0].bucket_path 
                        : null
                      
                      // Get public URL if image exists from property-media bucket
                      const imageUrl = firstImage 
                        ? supabase.storage.from('property-media').getPublicUrl(firstImage).data.publicUrl
                        : '/cozy-suburban-house.png'

                      return (
                        <div key={property.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                            <img src={imageUrl} alt={property.property_title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 text-sm truncate">{property.property_title}</p>
                            <p className="text-xs text-slate-500">{property.street_address}, {property.city}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-blue-600 text-sm">₱{property.price.toLocaleString()}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              property.property_status === "available" 
                                ? "bg-blue-100 text-blue-700" 
                                : property.property_status === "sold"
                                ? "bg-green-100 text-green-700"
                                : property.property_status === "rented"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {property.property_status.charAt(0).toUpperCase() + property.property_status.slice(1)}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Listed Properties */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Bookmark className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Agent Listed Properties</h3>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              {loadingListed ? '...' : listedProperties.length} properties
            </span>
          </div>
          <div className="p-6">
            {loadingListed ? (
              <div className="p-8 text-center text-slate-500">
                <p className="text-sm">Loading properties...</p>
              </div>
            ) : listedProperties.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p className="text-sm">No properties listed yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listedProperties.map((property) => {
                  // Get first image from media array if available
                  const firstImage = property.media && property.media.length > 0 
                    ? property.media[0].bucket_path 
                    : null
                  
                  // Get public URL if image exists from property-media bucket
                  const imageUrl = firstImage 
                    ? supabase.storage.from('property-media').getPublicUrl(firstImage).data.publicUrl
                    : null

                  return (
                    <div key={property.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-40 bg-gradient-to-br from-slate-200 to-slate-300 relative">
                        {imageUrl && (
                          <img src={imageUrl} alt={property.property_title} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-700">
                            {property.property_type}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-slate-900 mb-2">{property.property_title}</h4>
                        <div className="flex items-center gap-2 text-slate-600 text-sm mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>{property.street_address}, {property.city}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xl font-bold text-blue-600">₱{property.price.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">For {property.listing_type === 'sale' ? 'Sale' : 'Rent'}</p>
                          </div>
                          <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Client Reviews Section */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">Client Testimonials</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-semibold">
                    MR
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Maria Rodriguez</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  "John helped us find our dream home in just 2 weeks! His professionalism and market knowledge made the entire process smooth and stress-free. Highly recommended!"
                </p>
                <p className="text-xs text-slate-500 mt-2">October 2024</p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-semibold">
                    DT
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">David Tan</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  "Excellent service! John's expertise in commercial properties helped me make a great investment. He was always available to answer questions and provided valuable insights."
                </p>
                <p className="text-xs text-slate-500 mt-2">September 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}