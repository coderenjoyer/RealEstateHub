import { Sidebar } from "../../ui/adminsidebar"

export default function AdminProfilePage() {
  return (
    <div className="flex min-h-screen bg-[#B8C9D9]">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-xl font-semibold text-gray-900">Admin Profile</h1>
        <p className="text-gray-700 mt-2">This is a placeholder for the profile page.</p>
      </main>
    </div>
  )
}


