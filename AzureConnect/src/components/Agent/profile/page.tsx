import { AgentLayout } from "@/components/layouts/AgentLayout"
import { AgentProfileHero } from "./agent-profile-hero"
import { AgentProfileCards } from "./agent-profile-cards"

export default function AgentProfilePage() {
  return (
    <AgentLayout>
      <AgentProfileHero />
      <AgentProfileCards />
    </AgentLayout>
  )
}