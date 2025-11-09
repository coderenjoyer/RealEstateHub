"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { User, LayoutDashboard, CheckSquare, Users, FileText, ChevronLeft, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "../../AuthContext"
import { useSidebar } from "@/contexts/SidebarContext"

const menuItems = [
  { icon: User, label: "Admin Controls", to: "/admin/profile" },
  { icon: LayoutDashboard, label: "Dashboard", to: "/admin" },
  { icon: CheckSquare, label: "Listing Approvals", to: "/admin/listings" },
  { icon: Users, label: "User Management", to: "/admin/users" },
  { icon: FileText, label: "System Controls", to: "/admin/reports" },
]

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)
  const { pathname } = useLocation()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const isActive = (itemTo: string) => {
    // Exact match for root paths, or starts with the path followed by a slash
    if (itemTo === "/admin") {
      return pathname === "/admin"
    }
    return pathname === itemTo || (pathname.startsWith(itemTo + "/") && pathname !== itemTo + "/")
  }

  return (
    <aside 
      className={cn(
        "bg-[#A3B8C9] transition-all duration-300 flex flex-col fixed left-0 top-0 h-full z-40",
        isCollapsed ? "w-16" : "w-64"
      )}
      role="navigation"
      aria-label="Admin navigation"
    >
      {/* Collapse Button - Discreet */}
      <div className="px-6 py-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-[#8FA8BC] hover:text-gray-800 rounded transition-colors"
        >
          <ChevronLeft 
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              isCollapsed && "rotate-180"
            )} 
            aria-hidden="true"
          />
        </button>
      </div>

      <nav className="flex-1 py-2" role="menu">
        {menuItems.map((item, index) => {
          const active = isActive(item.to)

          return (
            <div 
              key={index}
              className="relative"
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                to={item.to}
                role="menuitem"
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 text-gray-800 transition-all duration-200",
                  "border-l-4 border-transparent hover:bg-[#8FA8BC]/50",
                  "focus:outline-none focus:ring-2 focus:ring-[#3E5E7A] focus:ring-inset",
                  active && "bg-[#8FA8BC] text-gray-900 font-semibold border-[#3E5E7A]"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span 
                  className={cn(
                    "text-sm font-medium transition-opacity duration-200",
                    isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                  )}
                >
                  {item.label}
                </span>
              </Link>

              {/* Tooltip for collapsed state */}
              {isCollapsed && hoveredItem === index && (
                <div 
                  className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md whitespace-nowrap z-50 pointer-events-none"
                  role="tooltip"
                >
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <button
        onClick={async () => { await signOut(); navigate("/login"); }}
        className={cn(
          "flex items-center gap-2 px-6 py-4 text-gray-800 w-full text-left",
          "hover:bg-[#8FA8BC] transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[#3E5E7A] focus:ring-inset",
          "border-t border-[#8FA8BC]"
        )}
      >
        <LogOut className="w-5 h-5" aria-hidden="true" />
        <span 
          className={cn(
            "text-sm font-medium transition-opacity duration-200",
            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}
        >
          Logout
        </span>
      </button>
    </aside>
  )
}

export default Sidebar