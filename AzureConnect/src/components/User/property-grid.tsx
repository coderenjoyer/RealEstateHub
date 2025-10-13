"use client"

import { useState } from "react"
import { PropertyCard } from "@/components/User/property-card"
import { PropertyDetailsPanel } from "@/components/User/propertry-details"

const properties = [
  {
    id: 1,
    name: "Aurelia Heights",
    address: "sknov nksi de dknt mfkmg mskfnjs",
    price: "₱100,000/month",
    beds: 3,
    baths: 2,
    sqft: 1200,
    rating: "4.55"
  },
  {
    id: 2,
    name: "Aurelia Heights",
    address: "sknov nksi de dknt mfkmg mskfnjs",
    price: "₱100,000/month",
    beds: 3,
    baths: 2,
    sqft: 1200,
    rating: "4.55"
  },
  {
    id: 3,
    name: "Aurelia Heights",
    address: "sknov nksi de dknt mfkmg mskfnjs",
    price: "₱100,000/month",
    beds: 3,
    baths: 2,
    sqft: 1200,
    rating: "4.55"
  },
  {
    id: 4,
    name: "Aurelia Heights",
    address: "sknov nksi de dknt mfkmg mskfnjs",
    price: "₱100,000/month",
    beds: 3,
    baths: 2,
    sqft: 1200,
    rating: "4.55"
  },
  {
    id: 5,
    name: "Aurelia Heights",
    address: "sknov nksi de dknt mfkmg mskfnjs",
    price: "₱100,000/month",
    beds: 3,
    baths: 2,
    sqft: 1200,
    rating: "4.55"
  },
  {
    id: 6,
    name: "Aurelia Heights",
    address: "sknov nksi de dknt mfkmg mskfnjs",
    price: "₱100,000/month",
    beds: 3,
    baths: 2,
    sqft: 1200,
    rating: "4.55"
  },
]

export function PropertyGrid() {
  const [selectedProperty, setSelectedProperty] = useState<typeof properties[0] | null>(null)

  return (
    <>
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property}
              onClick={() => setSelectedProperty(property)}
            />
          ))}
        </div>
      </div>

      {selectedProperty && (
        <PropertyDetailsPanel
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </>
  )
}