"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { User, BarChart3, FileCheck, List, MessageSquare, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: User, label: "Profile", to: "/agent/profile" },
  { icon: FileCheck, label: "Approvals", to: "/agent/approval" },
  { icon: List, label: "Property List", to: "/agent/proplist" },
  { icon: BarChart3, label: "Reports", to: "/agent/reports" },
  { icon: MessageSquare, label: "Communication", to: "/agent/communication" },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)
  const { pathname } = useLocation()

  const isActive = (itemTo: string) => {
    return pathname === itemTo || pathname.startsWith(itemTo + "/")
  }

  return (
    <aside 
      className={cn(
        "bg-[#a8c5d9] transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
      role="navigation"
      aria-label="Agent navigation"
    >
      <nav className="flex-1 py-6" role="menu">
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
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!isCollapsed}
        className="flex items-center gap-2 px-6 py-4 text-gray-800 hover:bg-[#8DB4CC] transition-colors"
      >
        <ChevronLeft 
          className={cn(
            "w-5 h-5 transition-transform",
            isCollapsed && "rotate-180"
          )} 
        />
        {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
      </button>
    </aside>
  )
}

export default Sidebar