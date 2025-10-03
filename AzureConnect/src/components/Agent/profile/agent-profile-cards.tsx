import { User, Home, Bookmark } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AgentProfileCards() {
  return (
    <div className="space-y-6 mt-6">
      {/* Top Row - About Me and Property Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* About Me Card */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-[#0f4c75] text-white">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <User className="w-5 h-5" />
              About Me
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-gray-100 min-h-[200px] p-6">{/* Content placeholder */}</CardContent>
        </Card>

        {/* Property Summary Card */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-[#0f4c75] text-white">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Home className="w-5 h-5" />
              Property Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-gray-100 min-h-[200px] p-6">{/* Content placeholder */}</CardContent>
        </Card>
      </div>

      {/* Bottom Row - Bookmarked Properties */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="bg-[#0f4c75] text-white">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Bookmark className="w-5 h-5" />
            Bookmarked Properties
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-gray-100 min-h-[200px] p-6">{/* Content placeholder */}</CardContent>
      </Card>
    </div>
  )
}
