"use client"

import { useState } from "react"
import { Sidebar } from "@/components/ui/agentsidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface MaintenanceRecord {
  id: number
  type: string
  details: string
  reportedBy: string
  reportedDate: string
  status: string
}

const maintenanceData: MaintenanceRecord[] = [
  {
    id: 1,
    type: "Scam",
    details: "blah",
    reportedBy: "Kristian",
    reportedDate: "September 3, 2025",
    status: "Resolved",
  },
  {
    id: 2,
    type: "Scam",
    details: "blah",
    reportedBy: "Kristian",
    reportedDate: "September 3, 2025",
    status: "Resolved",
  },
  {
    id: 3,
    type: "Scam",
    details: "blah",
    reportedBy: "Kristian",
    reportedDate: "September 3, 2025",
    status: "Resolved",
  },
  {
    id: 4,
    type: "Scam",
    details: "blah",
    reportedBy: "Kristian",
    reportedDate: "September 3, 2025",
    status: "Resolved",
  },
  {
    id: 5,
    type: "Scam",
    details: "blah",
    reportedBy: "Kristian",
    reportedDate: "September 3, 2025",
    status: "Resolved",
  },
  {
    id: 6,
    type: "Scam",
    details: "blah",
    reportedBy: "Kristian",
    reportedDate: "September 3, 2025",
    status: "Resolved",
  },
  {
    id: 7,
    type: "Scam",
    details: "blah",
    reportedBy: "Kristian",
    reportedDate: "September 3, 2025",
    status: "Resolved",
  },
  {
    id: 8,
    type: "Scam",
    details: "blah",
    reportedBy: "Kristian",
    reportedDate: "September 3, 2025",
    status: "Resolved",
  },
]

export default function MaintenancePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex min-h-screen bg-[#b8d4e6]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Title and Search */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Maintenance and Services</h1>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search hunt"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-300 rounded-full"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Type</TableHead>
                  <TableHead className="font-semibold text-gray-900">Details</TableHead>
                  <TableHead className="font-semibold text-gray-900">Reported by</TableHead>
                  <TableHead className="font-semibold text-gray-900">Reported Date</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceData.map((record) => (
                  <TableRow key={record.id} className="border-b border-gray-200 last:border-0">
                    <TableCell className="text-gray-900">{record.type}</TableCell>
                    <TableCell className="text-gray-900">{record.details}</TableCell>
                    <TableCell className="text-gray-900">{record.reportedBy}</TableCell>
                    <TableCell className="text-gray-900">{record.reportedDate}</TableCell>
                    <TableCell className="text-gray-900">{record.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="text-gray-700 border-gray-300"
              >
                Previous
              </Button>
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(1)}
                className={currentPage === 1 ? "bg-gray-900 text-white" : "text-gray-700 border-gray-300"}
              >
                1
              </Button>
              <Button
                variant={currentPage === 2 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(2)}
                className={currentPage === 2 ? "bg-gray-900 text-white" : "text-gray-700 border-gray-300"}
              >
                2
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(2, currentPage + 1))}
                disabled={currentPage === 2}
                className="text-gray-700 border-gray-300"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
