"use client"

import { useState } from "react"
import { Search } from "lucide-react"

interface Listing {
  type: string
  details: string
  reportedBy: string
  reportedDate: string
  status: string
}

const mockListings: Listing[] = [
  { type: "Scam", details: "blah", reportedBy: "Kristian", reportedDate: "September 3, 2025", status: "Resolved" },
  { type: "Scam", details: "blah", reportedBy: "Kristian", reportedDate: "September 3, 2025", status: "Resolved" },
  { type: "Scam", details: "blah", reportedBy: "Kristian", reportedDate: "September 3, 2025", status: "Resolved" },
  { type: "Scam", details: "blah", reportedBy: "Kristian", reportedDate: "September 3, 2025", status: "Resolved" },
  { type: "Scam", details: "blah", reportedBy: "Kristian", reportedDate: "September 3, 2025", status: "Resolved" },
  { type: "Scam", details: "blah", reportedBy: "Kristian", reportedDate: "September 3, 2025", status: "Resolved" },
  { type: "Scam", details: "blah", reportedBy: "Kristian", reportedDate: "September 3, 2025", status: "Resolved" },
  { type: "Scam", details: "blah", reportedBy: "Kristian", reportedDate: "September 3, 2025", status: "Resolved" },
]

export function PendingListingsTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Pending Listings (#)</h2>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Limit"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#8FA8BC] focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Details</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Reported by</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Reported Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockListings.map((listing, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-sm text-gray-800">{listing.type}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{listing.details}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{listing.reportedBy}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{listing.reportedDate}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{listing.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 mt-6">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(1)}
          className={`px-3 py-2 text-sm rounded transition-colors ${
            currentPage === 1
              ? "bg-[#8FA8BC] text-white"
              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          }`}
        >
          1
        </button>
        <button
          onClick={() => setCurrentPage(2)}
          className={`px-3 py-2 text-sm rounded transition-colors ${
            currentPage === 2
              ? "bg-[#8FA8BC] text-white"
              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          }`}
        >
          2
        </button>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}
