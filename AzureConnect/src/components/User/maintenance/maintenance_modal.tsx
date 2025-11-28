import { useEffect, useMemo, useState } from "react"
import { X, Calendar, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import supabase from "../../../supabaseClient"
import { MaintenanceStatus } from "./maintenance"
import { MessengerDropdown } from "../messenger-dropdown"

interface MaintenanceModalProps {
  open: boolean
  ownerId: string | null
  item: {
    id: number
    propertyId: number
    property: string
    status: MaintenanceStatus
    dueDate: string | null
    notes?: string | null
  } | null
  properties: Array<{
    id: number
    propertyId: number
    property: string
    address: string
  }>
  onClose: () => void
  onUpdated: (details?: MaintenanceConfirmationDetails) => void | Promise<void>
  agentId?: string | null
  agentName?: string | null
}

export interface MaintenanceConfirmationDetails {
  property: string
  maintenanceType: string
  priority: "low" | "medium" | "high"
  scheduledDate?: string | null
}

interface MaintenanceFormState {
  propertyId: string
  maintenanceType: string
  priority: "low" | "medium" | "high"
  description: string
  scheduledDate: string
  estimatedCost: string
  assignedTo: string
}

const maintenanceTypes = [
  "HVAC Service",
  "Plumbing Repair",
  "Electrical Work",
  "Roof Inspection",
  "Painting",
  "Landscaping",
  "Pest Control",
  "Appliance Repair",
  "General Maintenance",
  "Emergency Repair",
]

const priorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-300"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "low":
      return "bg-green-100 text-green-800 border-green-300"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300"
  }
}

const statusBadgeColor = (status: MaintenanceStatus = "pending") => {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200"
    case "in-progress":
      return "bg-[#49769F]/20 text-[#49769F] border border-[#49769F]/30"
    case "pending":
    default:
      return "bg-amber-50 text-amber-700 border border-amber-200"
  }
}

const statusIcon = (status: MaintenanceStatus) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-4 h-4" />
    case "in-progress":
      return <Clock className="w-4 h-4" />
    case "pending":
      return <AlertCircle className="w-4 h-4" />
    default:
      return null
  }
}

const defaultForm: MaintenanceFormState = {
  propertyId: "",
  maintenanceType: "",
  priority: "medium",
  description: "",
  scheduledDate: "",
  estimatedCost: "",
  assignedTo: "",
}

export function MaintenanceModal({
  open,
  ownerId,
  item,
  properties,
  onClose,
  onUpdated,
  agentId,
  agentName,
}: MaintenanceModalProps) {
  const [formData, setFormData] = useState<MaintenanceFormState>(defaultForm)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showMessenger, setShowMessenger] = useState(false)

  const propertyOptions = useMemo(() => {
    return properties.map((prop) => ({
      value: String(prop.propertyId),
      label: `${prop.property} – ${prop.address}`,
      ownershipId: prop.id,
    }))
  }, [properties])

  useEffect(() => {
    if (!open) return

    setFormData((prev) => ({
      ...defaultForm,
      propertyId: item ? String(item.propertyId) : prev.propertyId,
      status: item?.status ?? "pending",
      scheduledDate: item?.dueDate ? item.dueDate.substring(0, 10) : "",
      description: item?.notes ?? "",
    }))
    setError(null)
  }, [open, item])

  if (!open) {
    return null
  }

  const handleChatWithAgent = () => {
    if (!agentId) {
      setError('Agent information not available for this property.')
      return
    }
    
    // Open the messenger modal with the agent
    setShowMessenger(true)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!ownerId) {
      setError("Missing owner information.")
      return
    }
    if (!formData.propertyId) {
      setError("Please select a property.")
      return
    }

    const ownership = propertyOptions.find((prop) => prop.value === formData.propertyId)

    if (!ownership && !item) {
      setError("Invalid property selection.")
      return
    }

    const ownershipId = item?.id ?? ownership?.ownershipId

    if (!ownershipId) {
      setError("Unable to determine property ownership.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const ownershipUpdatePayload: Record<string, any> = {
        maintenance_status: "pending", // Always set to pending
        next_due_date: formData.scheduledDate || null,
        notes: formData.description.trim() || null,
        priority: formData.priority,
      }

      const { error: ownershipError } = await supabase
        .from("property_ownerships")
        .update(ownershipUpdatePayload)
        .eq("id", ownershipId)
        .eq("owner_id", ownerId)

      if (ownershipError) throw ownershipError

      const { error: logError } = await supabase
        .from("property_maintenance_logs")
        .insert({
          property_ownership_id: ownershipId,
          property_id: Number(formData.propertyId),
          owner_id: ownerId,
          maintenance_status: "pending", // Always set to pending
          maintenance_type: formData.maintenanceType || "General Maintenance",
          priority: formData.priority,
          description: formData.description.trim() || null,
          scheduled_date: formData.scheduledDate || null,
          estimated_cost: formData.estimatedCost ? Number(formData.estimatedCost) : null,
          assigned_to: formData.assignedTo || null,
        })

      if (logError) throw logError

      const selectedPropertyLabel =
        item?.property ??
        propertyOptions.find((prop) => prop.value === formData.propertyId)?.label ??
        "Selected Property"
      const propertyName = item?.property ?? selectedPropertyLabel.split(" – ")[0] ?? selectedPropertyLabel

      await onUpdated({
        property: propertyName,
        maintenanceType: formData.maintenanceType || "General Maintenance",
        priority: formData.priority,
        scheduledDate: formData.scheduledDate || null,
      })
      setFormData(defaultForm)
    } catch (err: any) {
      console.error("Maintenance submit error:", err)
      setError(err.message || "Unable to save maintenance request.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[40] flex min-h-screen items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => {
          if (!loading) onClose()
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-3xl max-h-[95vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur flex flex-col max-h-[95vh]">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-[#49769F]/20 via-white to-[#49769F]/10 px-8 py-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#49769F]">Maintenance</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Submit a request</h2>
              <p className="text-sm text-slate-500">
                Provide context so your agent can coordinate contractors quickly.
              </p>
            </div>
            {item && (
              <div className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-xs text-slate-600 shadow-inner">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Selected property</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{item.property}</p>
                <p className="text-slate-500">Ownership #{item.id}</p>
                <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${statusBadgeColor(item.status)}`}>
                  {statusIcon(item.status)}
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="ml-auto rounded-2xl border border-slate-200/80 bg-white/60 p-2 text-slate-500 transition hover:text-slate-700"
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form className="flex-1 space-y-6 overflow-y-auto px-8 py-6" onSubmit={handleSubmit}>
          <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Property <span className="text-red-500">*</span>
              </label>
              <select
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                required
                disabled={!!item}
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-[#49769F] focus:ring-2 focus:ring-[#49769F]/50 disabled:bg-slate-50"
              >
                <option value="">Select a property</option>
                {propertyOptions.map((prop) => (
                  <option key={prop.value} value={prop.value}>
                    {prop.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Maintenance Type <span className="text-red-500">*</span>
              </label>
              <select
                name="maintenanceType"
                value={formData.maintenanceType}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-[#49769F] focus:ring-2 focus:ring-[#49769F]/50"
              >
                <option value="">Select maintenance type</option>
                {maintenanceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold shadow-inner focus:border-[#49769F] focus:ring-2 focus:ring-[#49769F]/50 ${priorityColor(formData.priority)}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Assigned To</label>
                <input
                  type="text"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  placeholder="Contractor or technician name"
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-[#49769F] focus:ring-2 focus:ring-[#49769F]/50"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe the maintenance issue or work needed..."
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-[#49769F] focus:ring-2 focus:ring-[#49769F]/50"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Scheduled Date</label>
                <div className="relative">
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-[#49769F] focus:ring-2 focus:ring-[#49769F]/50"
                  />
                  <Calendar className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Estimated Cost</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₱</span>
                  <input
                    type="number"
                    name="estimatedCost"
                    value={formData.estimatedCost}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 pl-8 pr-4 py-3 text-sm text-slate-700 shadow-inner focus:border-[#49769F] focus:ring-2 focus:ring-[#49769F]/50"
                  />
                </div>
              </div>
            </div>

      {error && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 shadow-inner">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-slate-300 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-white"
                disabled={loading}
              >
                Cancel
              </button>
              {agentId && (
                <button
                  type="button"
                  onClick={handleChatWithAgent}
                  className="flex-1 rounded-2xl border border-[#49769F]/30 bg-[#49769F]/20 px-4 py-3 text-sm font-semibold text-[#49769F] shadow-sm transition hover:bg-[#49769F]/30"
                  disabled={loading}
                >
                  Chat with Agent
                </button>
              )}
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-[#49769F] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-[#49769F]/40 disabled:opacity-70"
                disabled={loading}
              >
                {loading ? "Saving..." : "Submit request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

      {/* Messenger Modal */}
      {showMessenger && (
        <MessengerDropdown
          onClose={() => setShowMessenger(false)}
          unreadCount={0}
          agentToContact={{
            id: agentId || '',
            name: agentName || 'Agent',
            avatar: null,
          }}
        />
      )}
    </>
  )
}