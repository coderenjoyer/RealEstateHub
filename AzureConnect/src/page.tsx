import { Sidebar } from "@/components/Agent/sidebar"
import { StatsCards } from "@/components/Agent/stats-cards"
import { PropertiesTable } from "@/components/Agent/properties-table"

export default function DashboardPage() {
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
