import { Sidebar } from "@/components/ui/agentsidebar"
import { AgentProfileHero } from "./agent-profile-hero"
import { AgentProfileCards } from "./agent-profile-cards"

export default function AgentProfilePage() {
  return (
    <div className="flex min-h-screen bg-[#b8d4e6]">
      <Sidebar />
      <main className="flex-1">
        <AgentProfileHero />
        <AgentProfileCards />
      </main>
    </div>
  )
}