import { useState, useEffect } from "react"
import { FileText, Users } from "lucide-react"
import supabase from "@/supabaseClient"
import { useAuth } from "@/AuthContext"

interface StatData {
  label: string
  value: string
  icon: any
}

export function StatsCards() {
  const [stats, setStats] = useState<StatData[]>([
    {
      label: "Total Properties",
      value: "0",
      icon: FileText,
    },
    {
      label: "Total Users",
      value: "0",
      icon: Users,
    },
  ])
  const [loading, setLoading] = useState(true)
  const { session } = useAuth()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)

      if (!session?.user?.id) {
        return
      }

      // Fetch agent's total properties
      const { count: propertiesCount, error: propertiesError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_deleted', false)

      if (propertiesError) {
        console.error('Error fetching properties count:', propertiesError)
      }

      // Fetch total users count using RPC function (exclude admin role)
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_all_users')

      let totalUsers = 0
      if (usersError) {
        console.error('Error fetching users count:', usersError)
      } else {
        // Filter out admin users from the count
        const nonAdminUsers = usersData?.filter((user: any) => {
          // Exclude users with admin role
          return user.role !== 'admin'
        }) || []
        totalUsers = nonAdminUsers.length
      }

      setStats([
        {
          label: "Total Properties",
          value: (propertiesCount || 0).toString(),
          icon: FileText,
        },
        {
          label: "Total Users",
          value: totalUsers.toString(),
          icon: Users,
        },
      ])
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 min-w-[375px]">
      {stats.map((stat) => {
        const IconComponent = stat.icon
        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-md sm:p-6 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-2">
                  {stat.label}
                </p>
                <p className="text-4xl font-bold text-slate-900">
                  {loading ? "..." : stat.value}
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