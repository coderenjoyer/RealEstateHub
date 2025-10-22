import { User, Home, Bookmark, CheckCircle, TrendingUp, Users, MapPin, Star } from "lucide-react"

const recentProperties = [
  {
    id: 1,
    title: "Modern Family Villa",
    location: "Quezon City, Metro Manila",
    price: "₱8,500,000",
    status: "Sold",
    image: "/cozy-suburban-house.png",
    date: "Oct 15, 2024"
  },
  {
    id: 2,
    title: "Luxury Condominium",
    location: "Makati, Metro Manila",
    price: "₱12,000,000",
    status: "Listed",
    image: "/cozy-suburban-house.png",
    date: "Oct 10, 2024"
  },
  {
    id: 3,
    title: "Cozy Studio Apartment",
    location: "Pasig City, Metro Manila",
    price: "₱3,200,000",
    status: "Under Negotiation",
    image: "/cozy-suburban-house.png",
    date: "Oct 5, 2024"
  }
]

const bookmarkedProperties = [
  {
    id: 1,
    title: "Beachfront Property",
    location: "Batangas",
    price: "₱15,000,000",
    type: "Land"
  },
  {
    id: 2,
    title: "Commercial Building",
    location: "Ortigas Center",
    price: "₱45,000,000",
    type: "Commercial"
  },
  {
    id: 3,
    title: "Townhouse Complex",
    location: "Las Piñas",
    price: "₱6,500,000",
    type: "Townhouse"
  },
  {
    id: 4,
    title: "Penthouse Suite",
    location: "BGC, Taguig",
    price: "₱25,000,000",
    type: "Condo"
  }
]

const achievements = [
  { label: "Top Performer 2024", icon: TrendingUp, color: "blue" },
  { label: "Customer Choice Award", icon: Star, color: "yellow" },
  { label: "100+ Happy Clients", icon: Users, color: "green" },
  { label: "Licensed Professional", icon: CheckCircle, color: "purple" }
]

export function AgentProfileCards() {
  return (
    <div className="bg-[#b8d4e6] px-4 sm:px-8 py-8">
      <div className="max-w-7xl min-w-[375px] mx-auto space-y-6">
        {/* Top Row - About Me and Property Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* About Me Card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">About Me</h3>
            </div>
            <div className="sm:p-6 p-4 space-y-4">
              <p className="text-slate-700 leading-relaxed">
                I'm a dedicated real estate professional with over 8 years of experience in the Metro Manila property market. 
                My passion is helping families find their dream homes and investors discover lucrative opportunities.
              </p>
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Specializations:</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Residential Sales</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Property Investment</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Luxury Homes</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Commercial Properties</span>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Languages:</h4>
                <p className="text-slate-600 text-sm">English, Filipino, Mandarin Chinese</p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Certifications:</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Licensed Real Estate Broker (PRC)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Certified Property Consultant
                  </li>
                </ul>
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-blue-900 font-semibold mb-1">Active Listings</p>
                  <p className="text-3xl font-bold text-blue-600">24</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <p className="text-sm text-green-900 font-semibold mb-1">Sold This Year</p>
                  <p className="text-3xl font-bold text-green-600">38</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <p className="text-sm text-purple-900 font-semibold mb-1">Total Value Sold</p>
                  <p className="text-2xl font-bold text-purple-600">₱425M</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                  <p className="text-sm text-orange-900 font-semibold mb-1">Avg. Response Time</p>
                  <p className="text-3xl font-bold text-orange-600">2h</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Recent Activity</h4>
                <div className="space-y-2">
                  {recentProperties.map((property) => (
                    <div key={property.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                        <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{property.title}</p>
                        <p className="text-xs text-slate-500">{property.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600 text-sm">{property.price}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          property.status === "Sold" 
                            ? "bg-green-100 text-green-700" 
                            : property.status === "Listed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {property.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">Achievements & Recognition</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon
                const colorClasses = {
                  blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-700",
                  yellow: "from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700",
                  green: "from-green-50 to-green-100 border-green-200 text-green-700",
                  purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-700"
                }
                return (
                  <div key={index} className={`bg-gradient-to-br ${colorClasses[achievement.color as keyof typeof colorClasses]} border rounded-xl p-4 text-center`}>
                    <div className="flex justify-center mb-2">
                      <div className="p-3 bg-white rounded-full shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{achievement.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bookmarked Properties */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Bookmark className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Bookmarked Properties</h3>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              {bookmarkedProperties.length} saved
            </span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarkedProperties.map((property) => (
                <div key={property.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-40 bg-gradient-to-br from-slate-200 to-slate-300 relative">
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-700">
                        {property.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">{property.title}</h4>
                    <div className="flex items-center gap-2 text-slate-600 text-sm mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{property.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-blue-600">{property.price}</p>
                      <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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