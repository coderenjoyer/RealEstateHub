"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "../ui/input"

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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Properties</h2>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search Unit"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-300"
          />
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select className="w-64 bg-white border border-gray-300 rounded-md h-10 px-3 text-sm">
          <option value="all">All Properties</option>
          <option value="active">Active</option>
          <option value="vacant">Vacant</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Property</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Location</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Price</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Rooms</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 text-sm text-gray-900">{property.property}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{property.location}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{property.price}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{property.rooms}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{property.actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
