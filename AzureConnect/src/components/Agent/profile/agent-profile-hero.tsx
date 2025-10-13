import { MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
// Replaced next/image with standard img for Vite/React runtime

export function AgentProfileHero() {
  return (
    <div className="relative">
      {/* Hero Background Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <img src="/header.jpeg" alt="Agent background" className="h-full w-full object-cover" />
      </div>
      {/* Colored bar under hero background */}
      <div className="w-full h-6 bg-[#0f4c75]"></div>

      {/* Profile Section */}
      <div className="relative px-6">
        {/* Profile Image */}
        <div className="absolute -top-20 left-6">
          <div className="relative h-40 w-40 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
            <img src="/header.jpeg" alt="Agent profile" className="h-full w-full object-cover" />
          </div>
          {/* Star Badge */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <div className="bg-yellow-400 rounded-full p-1.5 shadow-md">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
        </div>

        {/* Contact Button */}
        <div className="flex justify-end pt-4 pb-6">
          <Button className="bg-[#0f4c75] hover:bg-[#0d3f5f] text-white px-8">Contact</Button>
        </div>

        {/* Location Bar */}
        <div className="bg-[#0f4c75] text-white rounded-lg px-6 py-3 flex items-center justify-center gap-2 shadow-md">
          <MapPin className="w-4 h-4 text-red-500 fill-red-500" />
          <span className="text-sm">Binondo, Manila, 1006 Metro Manila</span>
        </div>
      </div>
    </div>
  )
}
