import { AgentLayout } from "@/components/layouts/AgentLayout"
import { StatsCards } from "@/components/Agent/listedproperties/stats-cards"
import { PropertiesTable } from "@/components/Agent/listedproperties/properties-table"

export default function PropertiesPage() {
  return (
    <AgentLayout>
      <div className="p-8">
        <div className="max-w-7xl min-w-[375px] mx-auto">
          <StatsCards />
          <PropertiesTable />
        </div>
      </div>
    </AgentLayout>
  )
}