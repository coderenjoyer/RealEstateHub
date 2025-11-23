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
  { icon: BarChart3, label: "Communication", to: "/admin/reports" },
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
          "transition-all duration-300 flex flex-col fixed left-0 top-0 h-full z-40 shadow-xl border-r border-[#49769F]",
          isCollapsed ? "w-16" : "w-64"
        )}
        style={{ backgroundColor: "#BDD8E9" }}
        role="navigation"
        aria-label="Agent navigation"
      >
        {/* Logo/Brand Section */}
        <Link
          to="/admin"
          className={cn(
            "py-6 border-b border-[#49769F] flex items-center gap-3 hover:bg-[#F0FFFF]/40 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0A4174] focus:ring-offset-2",
            isCollapsed ? "justify-center px-4" : "px-6"
          )}
          style={{ "--tw-ring-offset-color": "#BDD8E9" } as React.CSSProperties}
          aria-label="Go to admin dashboard"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#49769F] to-[#0A4174] rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
            <Home className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <div className={cn(
            "transition-all duration-300",
            isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
          )}>
            <h1 className="text-lg font-bold text-[#0A4174] whitespace-nowrap">RealEstate</h1>
            <p className="text-xs text-[#49769F] whitespace-nowrap">Admin Portal</p>
          </div>
        </Link>

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
                    "flex items-center gap-3 py-3.5 rounded-xl text-[#0A4174]/80 transition-all duration-200 group relative overflow-hidden",
                    "hover:text-[#0A4174]",
                    "focus:outline-none focus:ring-2 focus:ring-[#0A4174] focus:ring-offset-2",
                    active
                      ? "bg-gradient-to-r from-[#49769F] to-[#0A4174] text-[#F0FFFF] shadow-lg shadow-[#49769F]/40"
                      : "hover:bg-[#F0FFFF]/60",
                    isCollapsed ? "justify-center px-2" : "px-4"
                  )}
                  style={{ "--tw-ring-offset-color": "#BDD8E9" } as React.CSSProperties}
                >
                  {/* Active indicator line */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#F0FFFF] rounded-r-full" />
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
                    <div className="absolute inset-0 bg-gradient-to-r from-[#BDD8E9]/0 via-[#BDD8E9]/15 to-[#F0FFFF]/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  )}
                </Link>

                {/* Tooltip for collapsed state */}
                {isCollapsed && hoveredItem === index && (
                  <div
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-4 py-2 bg-[#0A4174] text-[#F0FFFF] text-sm rounded-lg whitespace-nowrap z-50 pointer-events-none shadow-xl border border-[#49769F]"
                    role="tooltip"
                  >
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-8 border-transparent border-r-[#0A4174]" />
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-[#49769F] p-3">
          <button
            onClick={handleLogoutClick}
            className={cn(
              "flex items-center gap-3 py-3.5 text-[#0A4174]/80 w-full rounded-xl",
              "hover:bg-[#F0FFFF]/60 hover:text-[#0A4174] transition-all duration-200 group",
              "focus:outline-none focus:ring-2 focus:ring-[#0A4174] focus:ring-offset-2 focus:ring-offset-[#BDD8E9]",
              isCollapsed ? "justify-center px-2" : "px-4"
            )}
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
          "fixed top-1/2 -translate-y-1/2 z-20 transition-all duration-300",
          "w-8 h-16 bg-gradient-to-r from-[#0A4174] to-[#49769F] hover:from-[#0A4174]/90 hover:to-[#49769F]/90",
          "text-[#F0FFFF] rounded-r-xl shadow-lg hover:shadow-xl",
          "flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-[#F0FFFF] focus:ring-offset-2 focus:ring-offset-[#BDD8E9]",
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