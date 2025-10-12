import { Sidebar } from "@/components/ui/agentsidebar"
import { MapPin, Star, User, Home, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AgentProfilePage() {
  return (
    <div className="flex min-h-screen bg-[#b8d4e6]">
      <Sidebar />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative">
          <div className="relative h-56 w-full overflow-hidden">
            <img 
              src="/real-estate-celebration-event-with-people.jpg" 
              alt="Agent background" 
              className="h-full w-full object-cover" 
            />
          </div>

          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Profile Image and Contact Button */}
            <div className="flex items-start justify-between -mt-24 mb-6">
              <div className="relative">
                <div className="relative h-44 w-44 rounded-full border-6 border-white bg-white shadow-lg overflow-hidden">
                  <img 
                    src="/professional-real-estate-agent-working-on-laptop.jpg" 
                    alt="Agent profile" 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <div className="bg-yellow-400 rounded-full p-2 shadow-md">
                    <Star className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
              </div>
              
              <Button className="bg-[#0f4c75] hover:bg-[#0d3f5f] text-white px-8 h-10">
                Contact
              </Button>
            </div>

            {/* Location Bar */}
            <div className="bg-[#0f4c75] text-white rounded-lg px-6 py-3 flex items-center justify-center gap-2 shadow-md mb-8 max-w-2xl">
              <MapPin className="w-4 h-4 text-red-500 fill-red-500" />
              <span className="text-sm">Binondo, Manila, 1006 Metro Manila</span>
            </div>

            {/* Cards Section */}
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Top Row - About Me and Property Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* About Me Card */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="bg-[#0f4c75] text-white px-8 py-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">About Me</h3>
                  </div>
                  <div className="bg-gray-100 min-h-[200px] p-8" />
                </div>

                {/* Property Summary Card */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="bg-[#0f4c75] text-white px-8 py-4 flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Property Summary</h3>
                  </div>
                  <div className="bg-gray-100 min-h-[200px] p-8" />
                </div>
              </div>

              {/* Bottom Row - Bookmarked Properties */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="bg-[#0f4c75] text-white px-8 py-4 flex items-center gap-2">
                  <Bookmark className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Bookmarked Properties</h3>
                </div>
                <div className="bg-gray-100 min-h-[200px] p-8" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}