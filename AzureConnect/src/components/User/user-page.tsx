import { PropertyFilters } from "@/components/User/property-filters"
import { PropertyGrid } from "@/components/User/property-grid"
import { TopNav } from "@/components/User/top-nav"

export default function HomePage() {
  return (
    <div className="h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-blue-300 flex flex-col lg:flex-row overflow-hidden">
      {/* Fixed Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block flex-shrink-0">
        <PropertyFilters />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Overlapping Top Navigation */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <TopNav />
        </div>
        
        {/* Scrollable Property Grid */}
        <div className="flex-1 px-4 lg:px-8 pb-8 overflow-hidden">
          <PropertyGrid />
        </div>
      </div>
    </div>
  )
}