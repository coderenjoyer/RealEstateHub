import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext"
import { Sidebar } from "@/components/ui/agentsidebar"
import { ReactNode } from "react"

interface AgentCommunicationLayoutProps {
  children: ReactNode
}

function AgentCommunicationLayoutContent({ children }: AgentCommunicationLayoutProps) {
  const { isCollapsed } = useSidebar()
  
  return (
    <div className="min-h-screen bg-[#b8d4e6]">
      <Sidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {children}
      </div>
    </div>
  )
}

export function AgentCommunicationLayout({ children }: AgentCommunicationLayoutProps) {
  return (
    <SidebarProvider>
      <AgentCommunicationLayoutContent>{children}</AgentCommunicationLayoutContent>
    </SidebarProvider>
  )
}
