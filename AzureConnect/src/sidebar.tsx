"use client"

import { useState } from "react"
import { User, FileCheck, MessageSquare, BarChart3, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

const menuItems = [
  { icon: FileCheck, label: "Approval", to: "/agent/approval" },
  { icon: MessageSquare, label: "Communication", to: "/agent/communication" },
  { icon: User, label: "Profile", to: "/agent/profile" },
  { icon: BarChart3, label: "Proplist", to: "/agent/proplist" },
  { icon: BarChart3, label: "Reports", to: "/agent/reports" },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={cn("bg-[#a8c5d9] transition-all duration-300 flex flex-col", isCollapsed ? "w-16" : "w-64")}>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="flex items-center gap-3 px-3 py-2 text-gray-800 hover:bg-white/20 rounded-lg transition-colors"
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">{item.label}</span>}
          </Link>
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


