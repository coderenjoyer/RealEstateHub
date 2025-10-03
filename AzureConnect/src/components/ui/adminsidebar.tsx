"use client"

import { useState } from "react"
import { User, LayoutDashboard, CheckSquare, Users, FileText, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"

const menuItems = [
  { icon: User, label: "Admin Profile", to: "/admin/profile" },
  { icon: LayoutDashboard, label: "Dashboard", to: "/admin" },
  { icon: CheckSquare, label: "Listing Approvals", to: "/admin/listings" },
  { icon: Users, label: "User Management", to: "/admin/users" },
  { icon: FileText, label: "System Reports", to: "/admin/reports" },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { pathname } = useLocation()

  return (
    <aside className={cn("bg-[#A3B8C9] transition-all duration-300 flex flex-col", isCollapsed ? "w-16" : "w-64")}>
      <nav className="flex-1 py-6">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.to || (item.to !== "/admin" && pathname.startsWith(item.to + "/"))

          return (
            <Link
              key={index}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-6 py-3 text-gray-800 transition-colors border-l-4 border-transparent",
                isActive && "bg-[#8FA8BC] text-gray-900 font-semibold border-[#3E5E7A]",
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 px-6 py-4 text-gray-800 hover:bg-[#8FA8BC] transition-colors"
      >
        <ChevronLeft className={cn("w-5 h-5 transition-transform", isCollapsed && "rotate-180")} />
        {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
      </button>
    </aside>
  )
}