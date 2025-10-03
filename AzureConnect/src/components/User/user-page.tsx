import { PropertyFilters } from "@/components/User/property-filters"
import { PropertyGrid } from "@/components/User/property-grid"
import { TopNav } from "@/components/User/top-nav"

export default function HomePage() {
  return (
    <div className="min-h-screen hero-gradient">
      <TopNav />
      <div className="flex gap-6 p-6">
        <PropertyFilters />
        <PropertyGrid />
      </div>
    </div>
  )
}
