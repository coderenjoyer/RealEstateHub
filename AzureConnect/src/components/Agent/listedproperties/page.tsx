import { Sidebar } from "@/components/ui/agentsidebar"
import { StatsCards } from "@/components/Agent/listedproperties/stats-cards"
import { PropertiesTable } from "@/components/Agent/listedproperties/properties-table"

export default function PropertiesPage() {
  return (
    <div className="flex min-h-screen bg-[#b8d4e6]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl min-w-[375px] mx-auto">
          <StatsCards />
          <PropertiesTable />
        </div>
      </main>
    </div>
  )
}