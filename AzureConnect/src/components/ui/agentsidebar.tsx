"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { User, BarChart3, FileCheck, List, MessageSquare, ChevronLeft, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/contexts/SidebarContext"
import { useAuth } from "@/AuthContext"

const menuItems = [
  { icon: User, label: "Profile", to: "/agent/profile" },
  { icon: FileCheck, label: "Listed Properties", to: "/agent/listed-properties" },
  { icon: List, label: "Create Listing", to: "/agent/createlist" },
  { icon: BarChart3, label: "Reports", to: "/agent/reports" },
  { icon: MessageSquare, label: "Communication", to: "/agent/communication" },
]

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      const result = await signOut()
      if (result.success) {
        navigate("/login")
      } else {
        console.error("Logout failed:", result.error)
        // Still navigate to login even if signOut had an error
        navigate("/login")
      }
    } catch (error) {
      console.error("Error during logout:", error)
      navigate("/login")
    }
  }

  const isActive = (itemTo: string) => {
    // Exact match for root paths, or starts with the path followed by a slash
    if (itemTo === "/agent") {
      return pathname === "/agent"
    }
    return pathname === itemTo || (pathname.startsWith(itemTo + "/") && pathname !== itemTo + "/")
  }

  return (
    <aside 
      className={cn(
        "bg-[#a8c5d9] transition-all duration-300 flex flex-col fixed left-0 top-0 h-full z-40",
        isCollapsed ? "w-16" : "w-64"
      )}
      role="navigation"
      aria-label="Agent navigation"
    >
      {/* Collapse Button - Discreet */}
      <div className="px-6 py-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-[#8DB4CC] hover:text-gray-800 rounded transition-colors"
        >
          <ChevronLeft 
            className={cn(
              "w-4 h-4 transition-transform",
              isCollapsed && "rotate-180"
            )} 
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
                  "flex items-center gap-3 px-6 py-3 text-gray-800 transition-colors border-l-4 border-transparent",
                  active && "bg-[#8DB4CC] text-gray-900 font-semibold border-[#5A8CAD]"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
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
        onClick={handleLogout}
        className="flex items-center gap-2 px-6 py-4 text-gray-800 hover:bg-[#8DB4CC] transition-colors w-full text-left"
        aria-label="Logout"
      >
        <LogOut className="w-5 h-5" />
        {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
      </button>
    </aside>
  )
}

export default Sidebar