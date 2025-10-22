"use client"

import { useState } from "react"
import { Sidebar } from "../../../components/ui/agentsidebar"
import { Search, Filter, Download, Eye, X, AlertTriangle, CheckCircle, Clock, XCircle, Calendar, User, FileText, ChevronDown } from "lucide-react"

interface Report {
  id: number
  type: string
  reportCategory: string
  details: string
  propertyId?: string
  propertyTitle?: string
  reportedBy: string
  reportedByRole: string
  reportedDate: string
  status: "Pending" | "Under Review" | "Resolved" | "Rejected"
  priority: "Low" | "Medium" | "High" | "Critical"
  assignedTo?: string
  resolution?: string
  attachments?: number
}

const reportsData: Report[] = [
  {
    id: 1,
    type: "Scam Alert",
    reportCategory: "Fraudulent Listing",
    details: "Property listing appears to be fake with stolen images and unrealistic pricing",
    propertyId: "PROP-2834",
    propertyTitle: "Luxury Villa in Makati",
    reportedBy: "Kristian Lopez",
    reportedByRole: "User",
    reportedDate: "2024-10-20",
    status: "Under Review",
    priority: "Critical",
    assignedTo: "Admin Team",
    attachments: 3
  },
  {
    id: 2,
    type: "Property Issue",
    reportCategory: "Misleading Information",
    details: "Property description doesn't match actual condition. Missing amenities listed",
    propertyId: "PROP-1923",
    propertyTitle: "Modern Condo Unit",
    reportedBy: "Maria Santos",
    reportedByRole: "Tenant",
    reportedDate: "2024-10-19",
    status: "Resolved",
    priority: "Medium",
    assignedTo: "John Michael Santos",
    resolution: "Property listing updated with accurate information",
    attachments: 5
  },
  {
    id: 3,
    type: "User Complaint",
    reportCategory: "Unprofessional Behavior",
    details: "Agent was unresponsive and rude during property viewing",
    reportedBy: "David Tan",
    reportedByRole: "User",
    reportedDate: "2024-10-18",
    status: "Pending",
    priority: "Low",
    attachments: 1
  },
  {
    id: 4,
    type: "Scam Alert",
    reportCategory: "Payment Fraud",
    details: "Agent requested payment outside platform for reservation fee",
    propertyId: "PROP-3421",
    propertyTitle: "Townhouse in Quezon City",
    reportedBy: "Anna Cruz",
    reportedByRole: "User",
    reportedDate: "2024-10-17",
    status: "Under Review",
    priority: "Critical",
    assignedTo: "Security Team",
    attachments: 2
  },
  {
    id: 5,
    type: "Property Issue",
    reportCategory: "Safety Concern",
    details: "Electrical wiring issues and fire hazards observed",
    propertyId: "PROP-2156",
    propertyTitle: "Studio Apartment",
    reportedBy: "Robert Chen",
    reportedByRole: "Tenant",
    reportedDate: "2024-10-16",
    status: "Resolved",
    priority: "High",
    assignedTo: "Maintenance Team",
    resolution: "Property removed from listings until repairs completed",
    attachments: 8
  },
  {
    id: 6,
    type: "Technical Issue",
    reportCategory: "Platform Bug",
    details: "Unable to submit application form, system keeps timing out",
    reportedBy: "Lisa Wang",
    reportedByRole: "User",
    reportedDate: "2024-10-15",
    status: "Resolved",
    priority: "Medium",
    assignedTo: "Tech Support",
    resolution: "Bug fixed in latest update"
  },
  {
    id: 7,
    type: "User Complaint",
    reportCategory: "Spam Messages",
    details: "Receiving repeated unwanted messages from agent",
    reportedBy: "Michael Brown",
    reportedByRole: "User",
    reportedDate: "2024-10-14",
    status: "Rejected",
    priority: "Low",
    resolution: "User can use block feature in messaging"
  },
  {
    id: 8,
    type: "Property Issue",
    reportCategory: "Incorrect Pricing",
    details: "Listed price differs significantly from advertised price",
    propertyId: "PROP-4567",
    propertyTitle: "Commercial Space",
    reportedBy: "Sarah Johnson",
    reportedByRole: "Agent",
    reportedDate: "2024-10-13",
    status: "Pending",
    priority: "High",
    attachments: 1
  }
]

export default function EnhancedReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    "Under Review": "bg-blue-100 text-blue-800",
    Resolved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800"
  }

  const priorityColors = {
    Low: "bg-gray-100 text-gray-700",
    Medium: "bg-orange-100 text-orange-700",
    High: "bg-red-100 text-red-700",
    Critical: "bg-red-600 text-white"
  }

  const statusIcons = {
    Pending: Clock,
    "Under Review": Eye,
    Resolved: CheckCircle,
    Rejected: XCircle
  }

  const openModal = (report: Report) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedReport(null)
  }

  // Filter data
  const filteredData = reportsData.filter(report => {
    const matchesSearch = report.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || report.status === filterStatus
    const matchesPriority = filterPriority === "all" || report.priority === filterPriority
    const matchesType = filterType === "all" || report.type === filterType
    return matchesSearch && matchesStatus && matchesPriority && matchesType
  })

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  // Stats
  const stats = {
    total: reportsData.length,
    pending: reportsData.filter(r => r.status === "Pending").length,
    underReview: reportsData.filter(r => r.status === "Under Review").length,
    resolved: reportsData.filter(r => r.status === "Resolved").length,
    critical: reportsData.filter(r => r.priority === "Critical").length
  }

  return (
    <div className="flex min-h-screen bg-[#b8d4e6]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl min-w-[375px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Issues</h1>
            <p className="text-gray-700">Manage and track all reported issues and complaints</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">Under Review</p>
              <p className="text-2xl font-bold text-blue-600">{stats.underReview}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">Critical</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Search and Filters */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                type="text"
                    placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="text-sm font-semibold text-gray-900 mb-2 block">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-900 mb-2 block">Priority</label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="all">All Priorities</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-900 mb-2 block">Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="all">All Types</option>
                      <option value="Scam Alert">Scam Alert</option>
                      <option value="Property Issue">Property Issue</option>
                      <option value="User Complaint">User Complaint</option>
                      <option value="Technical Issue">Technical Issue</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Reports Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Report ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type & Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Details</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Reported By</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Priority</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((report) => {
                    const StatusIcon = statusIcons[report.status]
                    return (
                      <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-medium text-gray-900">#{report.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{report.type}</p>
                            <p className="text-xs text-gray-600">{report.reportCategory}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700 line-clamp-2 max-w-xs">{report.details}</p>
                          {report.propertyTitle && (
                            <p className="text-xs text-blue-600 mt-1">Property: {report.propertyTitle}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{report.reportedBy}</p>
                            <p className="text-xs text-gray-600">{report.reportedByRole}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(report.reportedDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${priorityColors[report.priority]}`}>
                            {report.priority === "Critical" && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {report.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                            <StatusIcon className="w-3 h-3" />
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openModal(report)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
          </div>

            {/* Empty State */}
            {paginatedData.length === 0 && (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No reports found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} reports
                </p>
                <div className="flex gap-2">
                  <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === i + 1
                          ? "bg-gray-900 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Report Details</h2>
                  <p className="text-sm text-gray-300">Report ID: #{selectedReport.id}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status and Priority Badges */}
              <div className="flex flex-wrap gap-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[selectedReport.status]}`}>
                  {(() => {
                    const Icon = statusIcons[selectedReport.status]
                    return <Icon className="w-4 h-4" />
                  })()}
                  {selectedReport.status}
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${priorityColors[selectedReport.priority]}`}>
                  {selectedReport.priority === "Critical" && <AlertTriangle className="w-4 h-4" />}
                  {selectedReport.priority} Priority
                </span>
              </div>

              {/* Report Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Report Type</label>
                    <p className="text-gray-900">{selectedReport.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Category</label>
                    <p className="text-gray-900">{selectedReport.reportCategory}</p>
                  </div>
                  {selectedReport.propertyId && (
                    <>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Property ID</label>
                        <p className="text-blue-600 font-mono">{selectedReport.propertyId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Property Title</label>
                        <p className="text-gray-900">{selectedReport.propertyTitle}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Reported By
                    </label>
                    <p className="text-gray-900">{selectedReport.reportedBy}</p>
                    <p className="text-sm text-gray-600">{selectedReport.reportedByRole}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Report Date
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedReport.reportedDate).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {selectedReport.assignedTo && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Assigned To</label>
                      <p className="text-gray-900">{selectedReport.assignedTo}</p>
                    </div>
                  )}
                  {selectedReport.attachments && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Attachments</label>
                      <p className="text-blue-600">{selectedReport.attachments} file(s)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Section */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Report Details</label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-900 leading-relaxed">{selectedReport.details}</p>
                </div>
              </div>

              {/* Resolution Section */}
              {selectedReport.resolution && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Resolution
                  </label>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-gray-900 leading-relaxed">{selectedReport.resolution}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
              >
                Close
              </button>
              {selectedReport.status === "Pending" && (
                <>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Assign to Team
                  </button>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    Mark as Resolved
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}