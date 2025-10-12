"use client"

import { useState } from "react"
import { Search, ChevronRight } from "lucide-react"

const properties = [
  {
    id: 1,
    property: "Balay ni Spiderman",
    location: "Address",
    price: "John Doe",
    rooms: "John Doe",
    actions: "John Doe",
  },
  {
    id: 2,
    property: "Balay ni batman",
    location: "Address",
    price: "John Doe",
    rooms: "John Doe",
    actions: "John Doe",
  },
]

export function PropertiesTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Properties</h2>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Dropdown */}
        <div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-slate-400 transition"
          >
            <option value="all">All Properties</option>
            <option value="active">Active</option>
            <option value="vacant">Vacant</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Property
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Location
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Price
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Rooms
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr
                key={property.id}
                className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {property.property}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {property.location}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {property.price}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {property.rooms}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors">
                    Review
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State Message */}
      {properties.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-slate-500">No properties found</p>
        </div>
      )}
    </div>
  )
}