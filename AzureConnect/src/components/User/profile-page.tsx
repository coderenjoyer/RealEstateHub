import { MapPin, Phone, Mail, Calendar, Heart, Home, Star, Edit3, Globe, Briefcase, GraduationCap, Award, Users, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

function UserProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-gradient-to-br from-sky-300/95 via-blue-200/95 to-blue-300/95">
      {/* Hero Background Section */}
      <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-blue-500 via-blue-400 to-sky-300">
        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-20 w-24 h-24 border-4 border-white rounded-full"></div>
          <div className="absolute top-20 right-40 w-16 h-16 border-4 border-white rounded-full"></div>
        </div>
      </div>

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/user")}
          className="flex items-center gap-2 bg-white/90 hover:bg-white text-slate-700 border-slate-300 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </Button>
      </div>

      {/* Profile Section */}
      <div className="relative max-w-10xl mx-auto px-[500px] -mt-20">
        <div className="bg-white rounded-3xl shadow-xl sm:p-8 p-4 min-w-[375px]">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              <div className="relative h-40 w-40 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden">
                <img src="/header.jpeg" alt="User profile" className="h-full w-full object-cover" />
              </div>
              {/* Heart Badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                <div className="bg-pink-400 rounded-full p-2 shadow-md border-2 border-white">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">John </h1>
                  <p className="text-lg text-slate-600 font-medium">Property Enthusiast</p>
                </div>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6">
                  Edit Profile
                </Button>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-slate-600 mb-6">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Makati City, Metro Manila</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Saved Properties</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">24</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-semibold text-green-900 uppercase tracking-wide">Properties Viewed</p>
                  </div>
                  <p className="text-3xl font-bold text-green-700">156</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-purple-600" />
                    <p className="text-xs font-semibold text-purple-900 uppercase tracking-wide">Reviews Made</p>
                  </div>
                  <p className="text-3xl font-bold text-purple-700">18</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <p className="text-xs font-semibold text-yellow-900 uppercase tracking-wide">Avg Rating Given</p>
                  </div>
                  <p className="text-3xl font-bold text-yellow-700">4.2</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700">+63 917 123 4567</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700">sarah.johnson@email.com</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700">Member since Mar 2023</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Profile Sections */}
      <div className="max-w-10xl mx-auto px-[500px] mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bio Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">About Me</h2>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Edit Bio
                </Button>
              </div>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed mb-4">
                  I'm a passionate real estate enthusiast with over 5 years of experience in property investment and development. 
                  My journey in real estate began when I purchased my first condominium unit in Makati, and since then, 
                  I've been fascinated by the dynamic Philippine property market.
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  I specialize in residential properties, particularly condominiums and townhouses in Metro Manila. 
                  I enjoy helping others navigate the complex world of property investment and have successfully 
                  guided numerous friends and family members through their property purchases.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  When I'm not exploring new properties, you can find me reading about market trends, 
                  attending real estate seminars, or enjoying the vibrant city life of Manila.
                </p>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mt-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Property Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <Home className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-900">Property Type</p>
                      <p className="text-sm text-blue-700">Condominium, Townhouse</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Preferred Location</p>
                      <p className="text-sm text-green-700">Makati, BGC, Ortigas</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-semibold text-purple-900">Budget Range</p>
                      <p className="text-sm text-purple-700">₱3M - ₱8M</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <Award className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-semibold text-orange-900">Investment Goal</p>
                      <p className="text-sm text-orange-700">Long-term rental income</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Activity Summary */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Viewed luxury condo in BGC</p>
                    <p className="text-xs text-slate-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Saved townhouse in Makati</p>
                    <p className="text-xs text-slate-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Rated condo 5 stars</p>
                    <p className="text-xs text-slate-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Profile Views</span>
                  <span className="font-semibold text-slate-900">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Connections</span>
                  <span className="font-semibold text-slate-900">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Recommendations</span>
                  <span className="font-semibold text-slate-900">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Last Active</span>
                  <span className="font-semibold text-slate-900">2 hours ago</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage
