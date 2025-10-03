import { Sidebar } from "@/components/ui/agentsidebar"
import { StatsCards } from "@/components/Agent/approval/stats-cards"
import { PropertiesTable } from "@/components/Agent/approval/properties-table"

export default function PropertiesPage() {
  return (
    <div className="flex min-h-screen bg-[#b8d4e6]">
      <Sidebar />
      <main className="flex-1 p-6">
        <StatsCards />
        <PropertiesTable />
      </main>
    </div>
  )
}
