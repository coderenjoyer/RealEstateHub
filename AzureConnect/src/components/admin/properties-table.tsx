"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "../ui/input"
import type { Property } from "@/hooks/useAdminDashboard"

interface PropertiesTableProps {
  properties: Property[];
  loading: boolean;
}

export function PropertiesTable({ properties, loading }: PropertiesTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'rented' | 'sold'>('all')

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
