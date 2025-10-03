import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Grid3x3, Search, Settings } from "lucide-react"

export function TopNav() {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-8">
          <Button variant="default" className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-8">
            Buy
          </Button>
          <Button variant="ghost" className="rounded-full text-white hover:bg-white/10">
            Rent
          </Button>
          <Button variant="ghost" className="rounded-full text-white hover:bg-white/10">
            Favorites
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button size="icon" variant="ghost" className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white">
          <Grid3x3 className="h-5 w-5" />
        </Button>
        <Button size="icon" variant="ghost" className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white">
          <Search className="h-5 w-5" />
        </Button>
        <Button size="icon" variant="ghost" className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white">
          <Settings className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 ml-2">
          <div className="text-right">
            <p className="text-sm font-medium text-white">John Doe</p>
            <p className="text-xs text-blue-100">johndoe@gmail.com</p>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-xs">JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}
