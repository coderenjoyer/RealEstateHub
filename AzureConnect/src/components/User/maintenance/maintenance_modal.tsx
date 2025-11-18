import { useEffect, useMemo, useState } from "react"
import { X, Calendar, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import supabase from "../../../supabaseClient"
import { MaintenanceStatus } from "./maintenance"

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
  onUpdated: () => void | Promise<void>
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
}: MaintenanceModalProps) {
  const [formData, setFormData] = useState<MaintenanceFormState>(defaultForm)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
    setSuccess(null)
  }, [open, item])

  if (!open) {
    return null
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
    setSuccess(null)

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

      setSuccess("Maintenance request saved.")
      await onUpdated()
      setFormData(defaultForm)
    } catch (err: any) {
      console.error("Maintenance submit error:", err)
      setError(err.message || "Unable to save maintenance request.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Property Maintenance Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property <span className="text-red-500">*</span>
            </label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              required
              disabled={!!item}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maintenance Type <span className="text-red-500">*</span>
            </label>
            <select
              name="maintenanceType"
              value={formData.maintenanceType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select maintenance type</option>
              {maintenanceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${priorityColor(formData.priority)}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the maintenance issue or work needed..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Cost
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="estimatedCost"
                  value={formData.estimatedCost}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned To
            </label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              placeholder="Contractor or technician name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 text-green-700 px-3 py-2 text-sm">
              {success}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Saving..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}