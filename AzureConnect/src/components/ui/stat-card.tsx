import type { ReactNode } from "react"

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string
}

export function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-gray-700">{icon}</div>
      </div>
    </div>
  )
}
