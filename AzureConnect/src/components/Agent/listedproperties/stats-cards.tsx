import { FileText, Users, Calendar } from "lucide-react"

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => {
        const IconComponent = stat.icon
        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-2">
                  {stat.label}
                </p>
                <p className="text-4xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <IconComponent className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}