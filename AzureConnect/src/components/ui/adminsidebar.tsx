"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { User, LayoutDashboard, CheckSquare, Users, FileText, ChevronLeft, LogOut, Home } from "lucide-react"
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
    if (itemTo === "/admin") {
      return pathname === "/admin"
    }
    return pathname === itemTo || (pathname.startsWith(itemTo + "/") && pathname !== itemTo + "/")
  }

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white transition-all duration-300 flex flex-col fixed left-0 top-0 h-full z-40 shadow-xl border-r border-gray-200",
          isCollapsed ? "w-16" : "w-64"
        )}
        role="navigation"
        aria-label="Admin navigation"
      >
        {/* Logo/Brand Section */}
        <div className={cn(
          "py-6 border-b border-gray-200 flex items-center gap-3",
          isCollapsed ? "justify-center px-4" : "px-6"
        )}>
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
            <Home className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <div className={cn(
            "transition-all duration-300",
            isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
          )}>
            <h1 className="text-lg font-bold text-gray-800 whitespace-nowrap">RealEstate</h1>
            <p className="text-xs text-sky-600 whitespace-nowrap">Admin Portal</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4 overflow-y-auto" role="menu">
          {menuItems.map((item, index) => {
            const active = isActive(item.to)

            return (
              <div 
                key={index}
                className="relative px-3 mb-1"
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  to={item.to}
                  role="menuitem"
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-600 transition-all duration-200 group relative overflow-hidden",
                    "hover:text-gray-800",
                    "focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-white",
                    active 
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20" 
                      : "hover:bg-gray-100",
                    isCollapsed ? "justify-center px-2" : "px-4"
                  )}
                >
                  {/* Active indicator line */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                  )}
                  
                  <item.icon 
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                      active && "drop-shadow-md"
                    )} 
                    aria-hidden="true" 
                  />
                  <span 
                    className={cn(
                      "text-sm font-medium transition-all duration-300 whitespace-nowrap",
                      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Hover glow effect */}
                  {!active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-500/0 via-sky-500/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  )}
                </Link>

                {/* Tooltip for collapsed state */}
                {isCollapsed && hoveredItem === index && (
                  <div 
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-4 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap z-50 pointer-events-none shadow-xl border border-gray-700"
                    role="tooltip"
                  >
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-8 border-transparent border-r-gray-800" />
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={async () => { await signOut(); navigate("/login"); }}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 text-gray-600 w-full rounded-xl",
              "hover:bg-red-50 hover:text-red-600 transition-all duration-200 group",
              "focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <span 
              className={cn(
                "text-sm font-medium transition-all duration-300",
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Collapse Toggle Button - Centered on sidebar edge */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!isCollapsed}
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300",
          "w-8 h-16 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700",
          "text-white rounded-r-xl shadow-lg hover:shadow-xl",
          "flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2",
          "group",
          isCollapsed ? "left-16" : "left-64"
        )}
      >
        <ChevronLeft 
          className={cn(
            "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
            isCollapsed && "rotate-180"
          )} 
          aria-hidden="true"
        />
      </button>
    </>
  )
}

export default Sidebar