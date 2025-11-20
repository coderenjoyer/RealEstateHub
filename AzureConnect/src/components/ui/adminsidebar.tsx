"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { User, BarChart3, FileCheck, ChevronLeft, LogOut, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/contexts/SidebarContext"
import { useAuth } from "@/AuthContext"
import { LogoutConfirmationModal } from "@/components/ui/logout-confirmation-modal"

const menuItems = [
  { icon: User, label: "Admin Controls", to: "/admin/profile" },
  { icon: User, label: "User Management", to: "/admin/users" },
  { icon: FileCheck, label: "Listings", to: "/admin/listings" },
  { icon: BarChart3, label: "Server Configurations", to: "/admin/reports" },
]

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogoutClick = () => setShowLogoutModal(true)

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true)
      const result = await signOut()
      if (result?.success) {
        navigate("/login")
      } else {
        console.error("Logout failed:", result?.error)
      }
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  const cancelLogout = () => {
    if (!isLoggingOut) {
      setShowLogoutModal(false)
    }
  }

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
          "transition-all duration-300 flex flex-col fixed left-0 top-0 h-full z-40 shadow-xl border-r border-[#b4cdd9]",
          isCollapsed ? "w-16" : "w-64"
        )}
        style={{ backgroundColor: '#D7EEFF' }}
        role="navigation"
        aria-label="Agent navigation"
      >
        {/* Logo/Brand Section */}
        <div className={cn(
          "py-6 border-b border-[#a0bfce] flex items-center gap-3",
          isCollapsed ? "justify-center px-4" : "px-6"
        )}>
          <Link
            to="/admin"
            className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#49769F] focus:ring-offset-2"
            style={{ '--tw-ring-offset-color': '#b8d4e3' } as React.CSSProperties}
            aria-label="Admin Dashboard"
          >
            <Home className="w-6 h-6 text-white" aria-hidden="true" />
          </Link>
          <div className={cn(
            "transition-all duration-300",
            isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
          )}>
            <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">RealEstate</h1>
            <p className="text-xs text-gray-700 whitespace-nowrap">Admin Portal</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4 overflow-y-auto" role="menu" aria-label="Admin navigation">
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
                    "flex items-center gap-3 py-3.5 rounded-xl text-gray-800 transition-all duration-200 group relative overflow-hidden",
                    "hover:text-gray-950",
                    "focus:outline-none focus:ring-2 focus:ring-[#49769F] focus:ring-offset-2",
                    active 
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30" 
                      : "hover:bg-[#a8c5d6]",
                    isCollapsed ? "justify-center px-2" : "px-4"
                  )}
                  style={{ '--tw-ring-offset-color': '#b8d4e3' } as React.CSSProperties}
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
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400/0 via-sky-400/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  )}
                </Link>

                {/* Tooltip for collapsed state */}
                {isCollapsed && hoveredItem === index && (
                  <div 
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg whitespace-nowrap z-50 pointer-events-none shadow-xl border border-slate-700"
                    role="tooltip"
                  >
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-8 border-transparent border-r-slate-800" />
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-[#a0bfce] p-3">
          <button
            onClick={handleLogoutClick}
            className={cn(
              "flex items-center gap-3 py-3.5 text-gray-800 w-full rounded-xl",
              "hover:bg-red-50 hover:text-red-600 transition-all duration-200 group",
              "focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2",
              isCollapsed ? "justify-center px-2" : "px-4"
            )}
            style={{ '--tw-ring-offset-color': '#b8d4e3' } as React.CSSProperties}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <span 
              className={cn(
                "text-sm font-medium transition-all duration-300 whitespace-nowrap",
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
              )}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Collapse Toggle Button - Centered on sidebar edge with hover animation */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!isCollapsed}
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-30 transition-all duration-300",
          "w-8 h-16 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700",
          "text-white rounded-r-xl shadow-lg hover:shadow-xl",
          "flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-[#49769F] focus:ring-offset-2",
          "group opacity-30 hover:opacity-100",
          isCollapsed ? "left-16 -translate-x-5 hover:translate-x-0" : "left-64 -translate-x-5 hover:translate-x-0"
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
      <LogoutConfirmationModal
        open={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        isProcessing={isLoggingOut}
      />
    </>
  )
}

export default Sidebar