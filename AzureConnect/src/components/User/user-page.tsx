import { PropertyFilters } from "@/components/User/property-filters"
import { PropertyGrid } from "@/components/User/property-grid"
import { TopNav } from "@/components/User/top-nav"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-blue-200">
      <TopNav />
      <div className="flex gap-6 px-8 pb-8">
        <PropertyFilters />
        <PropertyGrid />
      </div>
    </div>
  )
}