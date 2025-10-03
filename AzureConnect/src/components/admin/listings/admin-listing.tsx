import { Sidebar } from "../../ui/adminsidebar"
import { PendingListingsTable } from "./listings-table"

export default function ListingApprovalsPage() {
  return (
    <div className="flex min-h-screen bg-[#B8C9D9]">
      <Sidebar />

      <main className="flex-1 p-6">
        <PendingListingsTable />
      </main>
    </div>
  )
}
