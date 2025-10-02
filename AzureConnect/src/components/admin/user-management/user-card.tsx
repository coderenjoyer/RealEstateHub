import { Mail, Phone, MoreVertical } from "lucide-react"

interface Account {
  id: string
  name: string
  email: string
  phone: string
  properties: number
  status?: "Pending" | "Closing"
}

interface AccountCardProps {
  account: Account
  showStatus?: boolean
}

export function AccountCard({ account, showStatus }: AccountCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900">{account.name}</h3>
            {showStatus && account.status && (
              <span
                className={`inline-block px-2 py-0.5 text-xs font-medium rounded mt-1 ${
                  account.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-orange-100 text-orange-700"
                }`}
              >
                {account.status}
              </span>
            )}
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{account.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>{account.phone}</span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Properties:</span> {account.properties}
        </div>
      </div>

      <button className="w-full py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded transition-colors">
        See more
      </button>
    </div>
  )
}
