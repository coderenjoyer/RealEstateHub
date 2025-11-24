import { AdminLayout } from "@/components/layouts/AdminLayout"
import { PendingListingsTable } from "./listings-table"

export default function ListingApprovalsPage() {
  return (
    <AdminLayout>
      <div className="p-0">
        <PendingListingsTable />
      </div>
    </AdminLayout>
  )
}
