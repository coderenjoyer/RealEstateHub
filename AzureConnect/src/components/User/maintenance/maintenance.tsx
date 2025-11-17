import { useState, useEffect } from "react";
import { useAuth } from "../../../AuthContext";
import { Wrench, ArrowLeft, CalendarDays, MapPin, ClipboardCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../supabaseClient";
import { MaintenanceModal } from "./maintenance_modal";

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

export default function PropertyMaintenancePage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MaintenanceItem | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      window.location.href = "/login";
      return;
    }
    fetchMaintenanceItems();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/user")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-600" />
            Property Maintenance
          </h1>
          <p className="text-gray-600 mt-2">Track and manage maintenance tasks for your properties</p>
        </div>

        {/* Properties Overview */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">My Properties</h2>
            {!loading && (
              <span className="text-sm text-gray-500">{maintenanceItems.length} total</span>
            )}
          </div>
          {loading ? (
            <div className="bg-white rounded-lg shadow p-6 flex items-center gap-3 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading your properties...
            </div>
          ) : maintenanceItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-gray-600">
              No properties assigned yet. Once an agent transfers a home to you, it will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {maintenanceItems.map((item) => (
                <div key={`card-${item.id}`} className="bg-white rounded-xl shadow p-5 flex flex-col gap-4 border border-gray-100">
                  <div>
                    <p className="text-sm uppercase text-gray-500">Property</p>
                    <h3 className="text-lg font-semibold text-gray-900">{item.property}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{item.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500">Next Due</p>
                      <div className="flex items-center gap-1 text-gray-700">
                        <CalendarDays className="w-4 h-4" />
                        <span>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "TBD"}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openMaintenanceModal(item)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Maintain Property
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mb-6 px-6 py-4 border border-red-100 bg-red-50 text-red-700 text-sm rounded-lg">
            {errorMessage}
          </div>
        )}

        <MaintenanceModal
          open={isModalOpen}
          ownerId={session?.user?.id ?? null}
          item={selectedItem}
          properties={maintenanceItems}
          onClose={closeMaintenanceModal}
          onUpdated={async () => {
            await fetchMaintenanceItems();
            closeMaintenanceModal();
          }}
        />
      </div>
    </div>
  );
}
