import { useState, useEffect } from "react";
import { useAuth } from "../../../AuthContext";
import { Wrench, ArrowLeft, CalendarDays, MapPin, ClipboardCheck, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../supabaseClient";
import { MaintenanceModal, MaintenanceConfirmationDetails } from "./maintenance_modal";

export type MaintenanceStatus = "pending" | "in-progress" | "completed";

interface MaintenanceItem {
  id: number;
  propertyId: number;
  property: string;
  status: MaintenanceStatus;
  type: string;
  dueDate: string | null;
  address: string;
  notes?: string | null;
}

interface MaintenanceLog {
  id: number;
  property_title: string;
  maintenance_type: string;
  maintenance_status: string;
  priority: string;
  description: string | null;
  scheduled_date: string | null;
  estimated_cost: number | null;
  assigned_to: string | null;
  created_at: string;
}

export default function PropertyMaintenancePage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [repairHistory, setRepairHistory] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [repairHistoryLoading, setRepairHistoryLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MaintenanceItem | null>(null);
  const [confirmationDetails, setConfirmationDetails] = useState<MaintenanceConfirmationDetails | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      window.location.href = "/login";
      return;
    }
    fetchMaintenanceItems();
    fetchRepairHistory();
  }, [session?.user?.id]);

  const fetchMaintenanceItems = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from("property_ownerships_with_properties")
        .select(`
          id,
          property_id,
          maintenance_status,
          next_due_date,
          notes,
          transferred_at,
          property_title,
          property_type,
          street_address,
          city
        `)
        .eq("owner_id", session.user.id)
        .order("transferred_at", { ascending: false });

      if (error) {
        console.error("maintenance fetch error:", error);
        throw error;
      }

      console.log("maintenance fetch result:", data);

      const parsedItems: MaintenanceItem[] =
        data?.map((record: any) => {
          const status = (record.maintenance_status || "pending") as MaintenanceStatus;
          const propertyTitle = record.property_title ?? "Untitled Property";
          const propertyType = record.property_type ?? "General";
          const propertyAddress =
            record.street_address && record.city
              ? `${record.street_address}, ${record.city}`
              : "No address available";
          return {
            id: record.id,
            propertyId: record.property_id,
            property: propertyTitle,
            type: propertyType,
            status,
            dueDate: record.next_due_date ?? record.transferred_at,
            address: propertyAddress,
            notes: record.notes ?? "",
          };
        }) ?? [];

      setMaintenanceItems(parsedItems);
    } catch (error: any) {
      console.error("Failed to load maintenance tasks:", error);
      setErrorMessage(error.message || "Unable to load your maintenance items.");
      setMaintenanceItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepairHistory = async () => {
    if (!session?.user?.id) return;
    setRepairHistoryLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from("property_maintenance_logs")
        .select(`
          id,
          property_id,
          maintenance_type,
          maintenance_status,
          priority,
          description,
          scheduled_date,
          estimated_cost,
          assigned_to,
          created_at,
          listed_properties (
            property_title
          )
        `)
        .eq("owner_id", session.user.id)
        .eq("maintenance_status", "completed")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("repair history fetch error:", error);
        throw error;
      }

      const parsedLogs: MaintenanceLog[] = 
        data?.map((record: any) => ({
          id: record.id,
          property_title: record.listed_properties?.property_title ?? 
                        (record.property_id ? `${record.property_id}` : "Unknown Property"),
          maintenance_type: record.maintenance_type,
          maintenance_status: record.maintenance_status,
          priority: record.priority,
          description: record.description,
          scheduled_date: record.scheduled_date,
          estimated_cost: record.estimated_cost,
          assigned_to: record.assigned_to,
          created_at: record.created_at,
        })) ?? [];

      setRepairHistory(parsedLogs);

    } catch (error: any) {
      console.error("Failed to load repair history:", error);
      setErrorMessage(error.message || "Unable to load repair history.");
      setRepairHistory([]);
    } finally {
      setRepairHistoryLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "in-progress":
        return "bg-sky-50 text-sky-700 border border-sky-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "low":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const openMaintenanceModal = (item: MaintenanceItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeMaintenanceModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const overviewStats = [
    {
      label: "Total Properties",
      value: maintenanceItems.length,
    },
    {
      label: "Pending Requests",
      value: maintenanceItems.filter((item) => item.status === "pending").length,
    },
    {
      label: "Resolved Logs",
      value: repairHistory.length,
    },
  ];

  const handleMaintenanceUpdated = async (details?: MaintenanceConfirmationDetails) => {
    await fetchMaintenanceItems();
    await fetchRepairHistory();
    if (details) {
      setConfirmationDetails(details);
    }
    closeMaintenanceModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-blue-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <button
            onClick={() => navigate("/user")}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to dashboard
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 rounded-3xl border border-white/60 bg-white/90 px-8 py-8 shadow-2xl shadow-sky-500/10 backdrop-blur-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Maintenance</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900 flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg">
                  <Wrench className="w-6 h-6" />
                </span>
                Property Maintenance
              </h1>
              <p className="text-slate-500 mt-3 max-w-2xl">
                Track open issues, submit new service requests, and stay aligned with your agent on every property you own.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              {overviewStats.map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-[140px] rounded-2xl border border-white/70 bg-gradient-to-br from-white to-sky-50/70 px-5 py-4 text-slate-600 shadow-inner"
                >
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{loading ? "—" : stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Properties Overview */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-3 justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">My Properties</h2>
              <p className="text-sm text-slate-500">Choose a property to submit or review maintenance activity.</p>
            </div>
            {!loading && (
              <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm">
                {maintenanceItems.length} total
              </span>
            )}
          </div>
          {loading ? (
            <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-lg backdrop-blur">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading your properties...
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={`skeleton-${idx}`} className="animate-pulse rounded-2xl border border-slate-100 bg-slate-100/70 p-6">
                    <div className="h-4 w-1/3 rounded bg-slate-200" />
                    <div className="mt-3 h-5 w-2/3 rounded bg-slate-200" />
                    <div className="mt-6 h-32 rounded-2xl bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          ) : maintenanceItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 px-6 py-10 text-center text-slate-500 shadow-inner">
              <p className="text-lg font-semibold text-slate-700">No properties assigned yet</p>
              <p className="mt-2 text-sm">
                Once an agent transfers a home to you, it will appear here for maintenance tracking.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {maintenanceItems.map((item) => (
                <div
                  key={`card-${item.id}`}
                  className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-sky-500/10 transition hover:-translate-y-1 hover:shadow-sky-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-sky-100 opacity-0 transition group-hover:opacity-100" />
                  <div className="relative flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Property</p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">{item.property}</h3>
                        <p className="text-xs font-medium text-slate-500">ID #{item.propertyId}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusColor(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-r from-sky-50/80 to-blue-50/80 p-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2 font-medium text-slate-700">
                        <CalendarDays className="w-4 h-4 text-sky-600" />
                        {item.dueDate ? `Next due ${new Date(item.dueDate).toLocaleDateString()}` : "No schedule on file"}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>{item.address}</span>
                      </div>
                      {item.notes && item.notes.trim() !== "" && (
                        <p className="mt-2 line-clamp-2 text-xs text-slate-500">“{item.notes}”</p>
                      )}
                    </div>
                    <button
                      onClick={() => openMaintenanceModal(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/30 transition hover:shadow-sky-600/50"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      Submit Maintenance Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Repair History Table */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-3 justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Resolved Maintenance History</h2>
              <p className="text-sm text-slate-500">Completed requests and closed work orders from your agent.</p>
            </div>
            {!repairHistoryLoading && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {repairHistory.length} resolved records
              </span>
            )}
          </div>

          {repairHistoryLoading ? (
            <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-lg backdrop-blur">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading resolved maintenance history...
              </div>
            </div>
          ) : repairHistory.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 px-6 py-10 text-center text-slate-500 shadow-inner">
              <p className="text-lg font-semibold text-slate-700">No resolved maintenance history yet</p>
              <p className="mt-2 text-sm">
                Submit maintenance requests and have them marked as completed by your agent to see them here.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/70 bg-white/90 shadow-2xl shadow-sky-500/10 overflow-hidden backdrop-blur">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-gradient-to-r from-sky-100 to-blue-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.25em]">
                        Property ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.25em]">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.25em]">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.25em]">
                        Priority
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.25em]">
                        Scheduled Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.25em]">
                        Cost
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.25em]">
                        Resolved Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/70 divide-y divide-slate-100">
                    {repairHistory.map((log) => (
                      <tr key={log.id} className="hover:bg-blue-50/60">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                          {log.property_title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {log.maintenance_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(log.maintenance_status)}`}>
                            {log.maintenance_status.charAt(0).toUpperCase() + log.maintenance_status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getPriorityColor(log.priority)}`}>
                            {log.priority.charAt(0).toUpperCase() + log.priority.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {log.scheduled_date ? new Date(log.scheduled_date).toLocaleDateString() : "Not scheduled"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {log.estimated_cost ? `₱${log.estimated_cost.toFixed(2)}` : "Not estimated"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(log.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50/80 px-6 py-4 text-sm font-medium text-rose-700 shadow-inner">
            {errorMessage}
          </div>
        )}

        <MaintenanceModal
          open={isModalOpen}
          ownerId={session?.user?.id ?? null}
          item={selectedItem}
          properties={maintenanceItems}
          onClose={closeMaintenanceModal}
          onUpdated={handleMaintenanceUpdated}
        />

        <MaintenanceRequestConfirmationModal
          open={Boolean(confirmationDetails)}
          details={confirmationDetails}
          onClose={() => setConfirmationDetails(null)}
        />
      </div>
    </div>
  );
}

interface MaintenanceRequestConfirmationModalProps {
  open: boolean;
  details: MaintenanceConfirmationDetails | null;
  onClose: () => void;
}

function MaintenanceRequestConfirmationModal({
  open,
  details,
  onClose,
}: MaintenanceRequestConfirmationModalProps) {
  if (!open || !details) return null;

  const priorityLabel = details.priority.charAt(0).toUpperCase() + details.priority.slice(1);

  return (
    <div className="fixed inset-0 z-[80] flex min-h-screen items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="rounded-3xl border border-white/60 bg-white/95 p-8 text-center shadow-2xl backdrop-blur">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg ring-4 ring-emerald-100">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="mt-4 text-xs font-semibold tracking-[0.3em] text-emerald-500">REQUEST SUBMITTED</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">Maintenance request received</h3>
          <p className="mt-2 text-sm text-slate-600">
            We&apos;ll notify your agent so they can coordinate the next steps.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-left text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Property</p>
            <p className="text-base font-semibold text-slate-900">{details.property}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Maintenance</p>
                <p className="text-sm text-slate-700">{details.maintenanceType}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Priority</p>
                <p className="text-sm font-semibold text-slate-700">{priorityLabel}</p>
              </div>
            </div>
            {details.scheduledDate && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Requested Date</p>
                <p className="text-sm text-slate-700">
                  {new Date(details.scheduledDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/30 transition hover:shadow-sky-600/50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
