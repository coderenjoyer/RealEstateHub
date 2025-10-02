import { FileText, Users, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const stats = [
  {
    label: "Total Properties",
    value: "300",
    icon: FileText,
  },
  {
    label: "Active Tenants",
    value: "100",
    icon: Users,
  },
  {
    label: "Vacant Units",
    value: "250",
    icon: Calendar,
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-gray-700" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
