import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext"
import { Sidebar } from "@/components/ui/agentsidebar"
import { ReactNode } from "react"

interface AgentLayoutProps {
  children: ReactNode
}

function AgentLayoutContent({ children }: AgentLayoutProps) {
  const { isCollapsed } = useSidebar()
  
  return (
    <div className="min-h-screen bg-[#b8d4e6]">
      <Sidebar />
      <main className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  )
}

export function AgentLayout({ children }: AgentLayoutProps) {
  return (
    <SidebarProvider>
      <AgentLayoutContent>{children}</AgentLayoutContent>
    </SidebarProvider>
  )
}
