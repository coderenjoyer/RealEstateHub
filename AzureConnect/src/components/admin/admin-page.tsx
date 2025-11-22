"use client";

import { AdminLayout } from "@/components/layouts/AdminLayout"
import { StatCard } from "../ui/stat-card"
import { PropertiesTable } from "./properties-table"
import { FileText, Building2, Calendar } from "lucide-react"
import { useAdminDashboard } from "@/hooks/useAdminDashboard"

export default function DashboardPage() {
  const { stats, properties, loading, error, refetch } = useAdminDashboard();

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-[#BDD8E9] p-4 text-red-700">
            <p className="font-semibold">Error loading dashboard</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard 
            icon={<FileText className="w-6 h-6" />} 
            label="Total Properties" 
            value={loading ? "..." : stats.totalProperties.toString()} 
          />
          <StatCard 
            icon={<Building2 className="w-6 h-6" />} 
            label="Active Tenants" 
            value={loading ? "..." : stats.activeTenants.toString()} 
          />
          <StatCard 
            icon={<Calendar className="w-6 h-6" />} 
            label="Vacant Units" 
            value={loading ? "..." : stats.vacantUnits.toString()} 
          />
        </div>

        {/* Properties Section */}
        <PropertiesTable 
          properties={properties} 
          loading={loading}
          onPropertyChange={() => refetch()}
        />
      </div>
    </AdminLayout>
  )
}
