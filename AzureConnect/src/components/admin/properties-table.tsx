"use client"

import { useState } from "react"
import { Search, Edit2, Trash2, X, CheckCircle } from "lucide-react"
import { Input } from "../ui/input"
import supabase from "@/supabaseClient"
import type { Property } from "@/hooks/useAdminDashboard"

interface PropertiesTableProps {
  properties: Property[];
  loading: boolean;
  onPropertyChange?: () => void;
}

export function PropertiesTable({ properties, loading, onPropertyChange }: PropertiesTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'rented' | 'sold'>('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)
  const [showEditSuccess, setShowEditSuccess] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    property_title: "",
    price: 0,
    property_status: "available"
  })

  const handleEditClick = (property: Property) => {
    setSelectedProperty(property)
    setEditForm({
      property_title: property.property_title,
      price: property.price,
      property_status: property.property_status
    })
    setShowEditModal(true)
  }

  const handleDeleteClick = (property: Property) => {
    setSelectedProperty(property)
    setShowDeleteConfirm(true)
  }

  const handleUpdateProperty = async () => {
    if (!selectedProperty) return
    setIsLoading(true)
    setError(null)
    
    try {
      const { error: updateError } = await supabase
        .from('listed_properties')
        .update({
          property_title: editForm.property_title,
          price: editForm.price,
          property_status: editForm.property_status
        })
        .eq('id', selectedProperty.id)

      if (updateError) throw updateError

      setShowEditModal(false)
      setShowEditSuccess(true)
      setSelectedProperty(null)
      setEditForm({ property_title: "", price: 0, property_status: "available" })
      if (onPropertyChange) onPropertyChange()
    } catch (err) {
      console.error("Error updating property:", err)
      setError(err instanceof Error ? err.message : "Failed to update property")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProperty = async () => {
    if (!selectedProperty) return
    setIsLoading(true)
    setError(null)
    
    try {
      // Use update with explicit soft-delete since admin has UPDATE permissions
      const { error: deleteError, data } = await supabase
        .from('listed_properties')
        .update({ is_deleted: true })
        .eq('id', selectedProperty.id)
        .select()

      if (deleteError) throw deleteError
      
      if (!data || data.length === 0) {
        throw new Error("Failed to delete property - no records updated. Check RLS policies.")
      }

      setShowDeleteConfirm(false)
      setShowDeleteSuccess(true)
      setSelectedProperty(null)
      if (onPropertyChange) onPropertyChange()
    } catch (err) {
      console.error("Error deleting property:", err)
      setError(err instanceof Error ? err.message : "Failed to delete property")
    } finally {
      setIsLoading(false)
    }
  }

  // Filter properties based on search and status
  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.property_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || property.property_status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Properties</h2>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-300"
          />
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="w-64 bg-white border border-gray-300 rounded-md h-10 px-3 text-sm"
        >
          <option value="all">All Properties</option>
          <option value="available">Available</option>
          <option value="rented">Rented</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading properties...</div>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">No properties found</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Property</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Location</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Price</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Rooms</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Agent</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => (
                <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-sm text-gray-900 font-medium">{property.property_title}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{property.city}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">₱{property.price?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || 'N/A'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{property.bedrooms}</td>
                  <td className="py-4 px-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      property.property_status === 'available' ? 'bg-green-100 text-green-800' :
                      property.property_status === 'rented' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {property.property_status.charAt(0).toUpperCase() + property.property_status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{property.full_name}</td>
                  <td className="py-4 px-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(property)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit property"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(property)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete property"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedProperty && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) {
              setShowEditModal(false)
              setError(null)
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Property</h2>
              <button
                onClick={() => setShowEditModal(false)}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Title
                </label>
                <input
                  type="text"
                  value={editForm.property_title}
                  onChange={(e) => setEditForm({ ...editForm, property_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49769F]"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49769F]"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editForm.property_status}
                  onChange={(e) => setEditForm({ ...editForm, property_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49769F]"
                  disabled={isLoading}
                >
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={isLoading}
                className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProperty}
                disabled={isLoading}
                className="flex-1 py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedProperty && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) {
              setShowDeleteConfirm(false)
              setError(null)
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Delete Property</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete <span className="font-medium">"{selectedProperty.property_title}"</span>? This action cannot be undone.
                </p>
              </div>

              {error && (
                <div className="px-3 py-2 text-xs text-red-600 bg-red-50 rounded border border-red-200">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProperty}
                disabled={isLoading}
                className="flex-1 py-2 px-4 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Success Modal */}
      {showEditSuccess && selectedProperty && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditSuccess(false)
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Updated Successfully</h2>
              <p className="text-sm text-gray-600">
                Property details have been updated successfully.
              </p>
              <button
                onClick={() => setShowEditSuccess(false)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccess && selectedProperty && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteSuccess(false)
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Deleted Successfully</h2>
              <p className="text-sm text-gray-600">
                Property has been deleted successfully.
              </p>
              <button
                onClick={() => setShowDeleteSuccess(false)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
