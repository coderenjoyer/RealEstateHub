import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext"
import { Sidebar } from "@/components/ui/adminsidebar"
import { ReactNode } from "react"

interface AdminLayoutProps {
  children: ReactNode
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const { isCollapsed } = useSidebar()
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Azure-themed gradient background with pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-sky-50 via-blue-100 to-cyan-50">
        {/* Subtle cloud pattern overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 150, 255, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(0, 180, 255, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 40% 20%, rgba(0, 120, 255, 0.08) 0%, transparent 50%)`,
          }}
        />
        {/* Geometric pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0, 120, 255, 0.03) 35px, rgba(0, 120, 255, 0.03) 70px),
                            repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(0, 150, 255, 0.03) 35px, rgba(0, 150, 255, 0.03) 70px)`,
          }}
        />
        {/* Gradient mesh effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/20 via-transparent to-cyan-200/20" />
      </div>
      
      <Sidebar />
      <main className={`relative min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  )
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  )
}
