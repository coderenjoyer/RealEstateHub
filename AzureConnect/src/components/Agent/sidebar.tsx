"use client"

import { useState } from "react"
import { User, BarChart3, FileCheck, Users, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: User, label: "Profile", href: "#" },
  { icon: BarChart3, label: "Dashboard", href: "#" },
  { icon: FileCheck, label: "Listing Approvals", href: "#" },
  { icon: Users, label: "User Management", href: "#" },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={cn("bg-[#a8c5d9] transition-all duration-300 flex flex-col", isCollapsed ? "w-16" : "w-64")}>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-gray-800 hover:bg-white/20 rounded-lg transition-colors"
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">{item.label}</span>}
          </a>
        ))}
      </nav>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="m-4 justify-start text-gray-800 hover:bg-white/20"
      >
        <ChevronLeft className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} />
        {!isCollapsed && <span className="ml-2 text-sm">Collapse</span>}
      </Button>
    </aside>
  )
}
