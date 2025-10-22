import { MapPin, Star, Phone, Mail, Calendar, Award, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AgentProfileHero() {
  return (
    <div className="relative bg-[#b8d4e6]">
      {/* Hero Background Section */}
      <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-blue-500 via-blue-400 to-sky-300">
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
                <img src="/header.jpeg" alt="Agent profile" className="h-full w-full object-cover" />
              </div>
              {/* Star Badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                <div className="bg-yellow-400 rounded-full p-2 shadow-md border-2 border-white">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">John Michael Santos</h1>
                  <p className="text-lg text-slate-600 font-medium">Senior Real Estate Agent</p>
                </div>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6">
                  Edit Profile
                </Button>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-slate-600 mb-6">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Binondo, Manila, 1006 Metro Manila</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Properties Sold</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">127</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-semibold text-green-900 uppercase tracking-wide">Years Experience</p>
                  </div>
                  <p className="text-3xl font-bold text-green-700">8</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-purple-600" />
                    <p className="text-xs font-semibold text-purple-900 uppercase tracking-wide">Rating</p>
                  </div>
                  <p className="text-3xl font-bold text-purple-700">4.9</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700">+63 912 345 6789</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700">john.santos@azureconnect.ph</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700">Member since Jan 2017</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}