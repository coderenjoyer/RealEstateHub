"use client"

import { useEffect, useState } from "react"
import { AgentLayout } from "@/components/layouts/AgentLayout"
import { Search, Filter, Eye, X, AlertTriangle, CheckCircle, Clock, XCircle, Calendar, User, FileText, ChevronDown } from "lucide-react"
import { useAuth } from "@/AuthContext"
import supabase from "@/supabaseClient"

interface Report {
  id: number
  type: string
  reportCategory: string
  details: string
  propertyId?: string
  propertyTitle?: string
  ownerName?: string
  ownerId?: string
  propertyOwnershipId?: number
  reportedBy: string
  reportedByRole: string
  reportedDate: string
  status: "Pending" | "Under Review" | "Resolved" | "Rejected"
  priority: "Low" | "Medium" | "High" | "Critical"
  assignedTo?: string
  resolution?: string
  attachments?: number
  scheduledDate?: string | null
  estimatedCost?: number | null
}

export default function EnhancedReportsPage() {
  const { session } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [reportsData, setReportsData] = useState<Report[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [resolvingReport, setResolvingReport] = useState(false)
  const [resolveError, setResolveError] = useState<string | null>(null)
  const itemsPerPage = 6

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    "Under Review": "bg-[#49769F]/20 text-[#49769F]",
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

  const mapMaintenanceStatus = (status: string | null): Report["status"] => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return "Resolved"
      case "in-progress":
        return "Under Review"
      case "pending":
      default:
        return "Pending"
    }
  }

  const mapPriority = (priority: string | null): Report["priority"] => {
    switch ((priority || "").toLowerCase()) {
      case "critical":
        return "Critical"
      case "high":
        return "High"
      case "low":
        return "Low"
      default:
        return "Medium"
    }
  }

  const fetchMaintenanceReports = async () => {
    if (!session?.user?.id) return
    setLoadingReports(true)
    setFetchError(null)
    try {
      const { data, error } = await supabase
        .from("property_maintenance_logs")
        .select(`
          id,
          maintenance_type,
          maintenance_status,
          priority,
          description,
          scheduled_date,
          estimated_cost,
          assigned_to,
          created_at,
          property:listed_properties!property_maintenance_logs_property_id_fkey (
            id,
            property_title,
            street_address,
            city
          ),
          ownership:property_ownerships!property_maintenance_logs_property_ownership_id_fkey (
            id,
            agent_id,
            owner_id,
            owner_name,
            maintenance_status
          ),
          property_ownership_id
        `)
        .eq("ownership.agent_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      const mappedReports: Report[] = (data || []).map((log: any) => ({
        id: log.id,
        type: log.maintenance_type || "Maintenance",
        reportCategory: log.maintenance_type || "Maintenance",
        details: log.description || "No description provided.",
        propertyId: log.property?.id ? `PROP-${log.property.id}` : undefined,
        propertyTitle: log.property?.property_title,
        ownerName: log.ownership?.owner_name,
        ownerId: log.ownership?.owner_id,
        propertyOwnershipId: log.property_ownership_id,
        reportedBy: "Homeowner",
        reportedByRole: "User",
        reportedDate: log.created_at,
        status: mapMaintenanceStatus(log.maintenance_status),
        priority: mapPriority(log.priority),
        assignedTo: log.assigned_to || undefined,
        resolution: log.maintenance_status === "completed" ? "Marked completed by homeowner" : undefined,
        scheduledDate: log.scheduled_date ?? null,
        estimatedCost: log.estimated_cost ?? null
      }))

      setReportsData(mappedReports)
    } catch (err: any) {
      setFetchError(err.message || "Unable to load maintenance reports.")
      setReportsData([])
    } finally {
      setLoadingReports(false)
    }
  }

  useEffect(() => {
    fetchMaintenanceReports()
  }, [session?.user?.id])

  const openModal = (report: Report) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedReport(null)
    setResolveError(null)
  }

  const handleMarkAsResolved = async () => {
    if (!selectedReport || !selectedReport.ownerId || !selectedReport.propertyOwnershipId) {
      setResolveError("Missing required information to resolve this report.")
      return
    }

    setResolvingReport(true)
    setResolveError(null)

    try {
      // 1. Update the maintenance log status to "completed"
      const { error: logError } = await supabase
        .from("property_maintenance_logs")
        .update({ maintenance_status: "completed" })
        .eq("id", selectedReport.id)
        .select()

      if (logError) {
        throw new Error(`Failed to update maintenance log: ${logError.message}`)
      }

      // 2. Update the property_ownerships maintenance_status to "completed"
      const { error: ownershipError } = await supabase
        .from("property_ownerships")
        .update({ maintenance_status: "completed" })
        .eq("id", selectedReport.propertyOwnershipId)
        .select()

      if (ownershipError) {
        throw new Error(`Failed to update property ownership: ${ownershipError.message}`)
      }

      // 3. Refresh the reports list to show updated status
      await fetchMaintenanceReports()

      // 4. Close the modal
      closeModal()
    } catch (err: any) {
      setResolveError(err.message || "Failed to mark report as resolved. Please try again.")
    } finally {
      setResolvingReport(false)
    }
  }

  // Filter data
  const filteredData = reportsData.filter(report => {
    const matchesSearch = report.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || report.status === filterStatus
    const matchesPriority = filterPriority === "all" || report.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  // Stats
  const stats = {
    total: reportsData.length,
    pending: reportsData.filter(r => r.status === "Pending").length,
    resolved: reportsData.filter(r => r.status === "Resolved").length
  }

  return (
    <AgentLayout>
      <div className="p-8">
        <div className="max-w-7xl min-w-[375px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Issues</h1>
            <p className="text-gray-700">Manage and track all reported issues and complaints</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{loadingReports ? "—" : stats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{loadingReports ? "—" : stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{loadingReports ? "—" : stats.resolved}</p>
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
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#49769F] focus:border-transparent"
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
                </div>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="text-sm font-semibold text-gray-900 mb-2 block">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49769F] bg-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49769F] bg-white"
                    >
                      <option value="all">All Priorities</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Reports Table */}
            <div className="overflow-x-auto">
              {fetchError && (
                <div className="px-6 py-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
                  {fetchError}
                </div>
              )}
              {loadingReports && !fetchError && (
                <div className="px-6 py-10 text-center text-gray-500">
                  Loading maintenance reports...
                </div>
              )}
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Report ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type & Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Owner</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Details</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Scheduled</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Est. Cost</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Assigned</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Details</th>
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
                          <div>
                            <p className="text-sm font-medium text-gray-900">{report.ownerName || "Unknown Owner"}</p>
                            {report.propertyTitle && (
                              <p className="text-xs text-gray-600">{report.propertyTitle}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700 line-clamp-2 max-w-xs">{report.details}</p>
                          {report.propertyTitle && (
                            <p className="text-xs text-[#49769F] mt-1">Property: {report.propertyTitle}</p>
                          )}
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
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {report.scheduledDate
                            ? new Date(report.scheduledDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "TBD"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {typeof report.estimatedCost === "number"
                            ? `₱${report.estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {report.assignedTo || "Unassigned"}
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
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#49769F]/10 text-[#49769F] font-medium hover:bg-[#49769F]/20 transition-colors text-sm"
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
            {!loadingReports && paginatedData.length === 0 && (
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
      </div>

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
                        <p className="text-[#49769F] font-mono">{selectedReport.propertyId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Property Title</label>
                        <p className="text-gray-900">{selectedReport.propertyTitle}</p>
                      </div>
                    </>
                  )}
                  {selectedReport.ownerName && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Property Owner</label>
                      <p className="text-gray-900">{selectedReport.ownerName}</p>
                    </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Scheduled Date</label>
                      <p className="text-gray-900">
                        {selectedReport.scheduledDate
                          ? new Date(selectedReport.scheduledDate).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "TBD"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Estimated Cost</label>
                      <p className="text-gray-900">
                        {typeof selectedReport.estimatedCost === "number"
                          ? `₱${selectedReport.estimatedCost.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "Not provided"}
                      </p>
                    </div>
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
                      <p className="text-[#49769F]">{selectedReport.attachments} file(s)</p>
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
                  <button
                    onClick={handleMarkAsResolved}
                    disabled={resolvingReport}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {resolvingReport ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Resolving...
                      </>
                    ) : (
                      "Mark as Resolved"
                    )}
                  </button>
                </>
              )}
              {resolveError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {resolveError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AgentLayout>
  )
}