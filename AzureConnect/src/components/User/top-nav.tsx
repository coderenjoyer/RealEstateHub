import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, ChevronDown } from "lucide-react"
import { MessengerDropdown } from "./messenger-dropdown"

export function TopNav() {
  return (
    <div className="flex items-center justify-between px-8 py-5">
      {/* Left Side - Navigation Tabs */}
      <div className="flex items-center gap-3">
        <Button 
          variant="default" 
          className="px-8 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-medium text-sm shadow-lg shadow-sky-500/30 transition-all"
        >
          Buy
        </Button>
        <Button 
          variant="ghost" 
          className="px-8 py-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full font-medium text-sm transition-all"
        >
          Rent
        </Button>
        <Button 
          variant="ghost" 
          className="px-8 py-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full font-medium text-sm transition-all"
        >
          Favorites
        </Button>
      </div>

      {/* Right Side - Action Buttons & Profile */}
      <div className="flex items-center gap-3">
        <MessengerDropdown />
        <Button 
          size="icon" 
          variant="ghost" 
          className="p-2.5 bg-sky-500/90 hover:bg-sky-600 text-white rounded-xl transition-all shadow-md"
        >
          <Bell className="h-5 w-5" />
        </Button>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 ml-2 bg-sky-500/20 backdrop-blur-sm rounded-full pl-4 pr-2 py-2">
          <div className="text-right">
            <p className="text-sm font-semibold text-white leading-tight">John Doe</p>
            <p className="text-xs text-sky-100">johndoe@gmail.com</p>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-sky-400 to-sky-600 text-white text-sm font-semibold shadow-lg">
              JD
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4 text-white/80" />
        </div>
      </div>
    </div>
  )
}