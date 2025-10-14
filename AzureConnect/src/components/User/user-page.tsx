import { PropertyFilters } from "@/components/User/property-filters"
import { PropertyGrid } from "@/components/User/property-grid"
import { TopNav } from "@/components/User/top-nav"

export default function HomePage() {
  return (
    <div className="h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-blue-300 flex overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="flex-shrink-0">
        <PropertyFilters />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation aligned with property cards */}
        <div className="flex-shrink-0">
          <TopNav />
        </div>
        
        {/* Scrollable Property Grid */}
        <div className="flex-1 px-8 pb-8 overflow-hidden">
          <PropertyGrid />
        </div>
      </div>
    </div>
  )
}