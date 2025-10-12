import { User, Home, Bookmark } from "lucide-react"

export function AgentProfileCards() {
  return (
    <div className="bg-white px-8 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Row - About Me and Property Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* About Me Card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="bg-[#0f4c75] text-white px-8 py-5 flex items-center gap-3">
              <User className="w-6 h-6" />
              <h3 className="text-lg font-semibold">About Me</h3>
            </div>
            <div className="bg-gradient-to-b from-slate-50 to-slate-100 min-h-[220px] p-8">
              {/* Content placeholder */}
            </div>
          </div>

          {/* Property Summary Card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="bg-[#0f4c75] text-white px-8 py-5 flex items-center gap-3">
              <Home className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Property Summary</h3>
            </div>
            <div className="bg-gradient-to-b from-slate-50 to-slate-100 min-h-[220px] p-8">
              {/* Content placeholder */}
            </div>
          </div>
        </div>

        {/* Bottom Row - Bookmarked Properties */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow">
          <div className="bg-[#0f4c75] text-white px-8 py-5 flex items-center gap-3">
            <Bookmark className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Bookmarked Properties</h3>
          </div>
          <div className="bg-gradient-to-b from-slate-50 to-slate-100 min-h-[220px] p-8">
            {/* Content placeholder */}
          </div>
        </div>
      </div>
    </div>
  )
}