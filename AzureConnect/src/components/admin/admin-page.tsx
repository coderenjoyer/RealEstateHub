import { Sidebar } from "../ui/adminsidebar"
import { StatCard } from "../ui/stat-card"
import { PropertiesTable } from "./properties-table"
import { FileText, Building2, Calendar } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#B8C9D9]">
      <Sidebar />

      <main className="flex-1 p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard icon={<FileText className="w-6 h-6" />} label="Total Properties" value="300" />
          <StatCard icon={<Building2 className="w-6 h-6" />} label="Active Tenants" value="100" />
          <StatCard icon={<Calendar className="w-6 h-6" />} label="Vacant Units" value="250" />
        </div>

        {/* Properties Section */}
        <PropertiesTable />
      </main>
    </div>
  )
}
