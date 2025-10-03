import { Sidebar } from "@/components/ui/agentsidebar"
import { AgentProfileHero } from "@/components/Agent/profile/agent-profile-hero"
import { AgentProfileCards } from "@/components/Agent/profile/agent-profile-cards"

export default function AgentProfilePage() {
  return (
    <div className="flex min-h-screen bg-[#b8d4e6]">
      <Sidebar />
      <main className="flex-1">
        <AgentProfileHero />
        <div className="p-6">
          <AgentProfileCards />
        </div>
      </main>
    </div>
  )
}
