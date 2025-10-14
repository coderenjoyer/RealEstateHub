"use client"

import { useState } from "react"
import { PropertyCard } from "@/components/User/property-card"
import { PropertyDetailsPanel } from "@/components/User/propertry-details"

const properties = [
  {
    id: 1,
    name: "Aurelia Heights",
    address: "123 Skyline Drive, Cebu City",
    price: "₱100,000/month",
    beds: 3,
    baths: 2,
    sqft: 1200,
    rating: "4.55"
  },
  {
    id: 2,
    name: "Oceanview Residences",
    address: "456 Coastal Road, Mandaue City",
    price: "₱85,000/month",
    beds: 2,
    baths: 2,
    sqft: 950,
    rating: "4.32"
  },
  {
    id: 3,
    name: "Garden Villa Estate",
    address: "789 Green Valley, Talisay City",
    price: "₱120,000/month",
    beds: 4,
    baths: 3,
    sqft: 1500,
    rating: "4.78"
  },
  {
    id: 4,
    name: "Modern Loft Apartments",
    address: "321 Business District, Cebu City",
    price: "₱75,000/month",
    beds: 1,
    baths: 1,
    sqft: 650,
    rating: "4.21"
  },
  {
    id: 5,
    name: "Luxury Penthouse",
    address: "654 High Rise Tower, Cebu City",
    price: "₱200,000/month",
    beds: 3,
    baths: 3,
    sqft: 1800,
    rating: "4.89"
  },
  {
    id: 6,
    name: "Family Home Haven",
    address: "987 Suburban Lane, Naga City",
    price: "₱95,000/month",
    beds: 3,
    baths: 2,
    sqft: 1100,
    rating: "4.45"
  },
  {
    id: 7,
    name: "Cozy Studio Space",
    address: "147 Downtown Plaza, Cebu City",
    price: "₱65,000/month",
    beds: 1,
    baths: 1,
    sqft: 500,
    rating: "4.12"
  },
  {
    id: 8,
    name: "Executive Condominium",
    address: "258 Corporate Center, Mandaue City",
    price: "₱110,000/month",
    beds: 2,
    baths: 2,
    sqft: 1050,
    rating: "4.67"
  },
  {
    id: 9,
    name: "Beachfront Villa",
    address: "369 Seaside Resort, Lapu-Lapu City",
    price: "₱150,000/month",
    beds: 4,
    baths: 3,
    sqft: 1600,
    rating: "4.82"
  },
  {
    id: 10,
    name: "Urban Townhouse",
    address: "741 City Center, Cebu City",
    price: "₱90,000/month",
    beds: 3,
    baths: 2,
    sqft: 1000,
    rating: "4.38"
  },
  {
    id: 11,
    name: "Mountain View Cabin",
    address: "852 Hillside Retreat, Balamban",
    price: "₱80,000/month",
    beds: 2,
    baths: 1,
    sqft: 800,
    rating: "4.56"
  },
  {
    id: 12,
    name: "Premium Apartment",
    address: "963 Luxury Complex, Cebu City",
    price: "₱130,000/month",
    beds: 2,
    baths: 2,
    sqft: 1150,
    rating: "4.71"
  },
  {
    id: 13,
    name: "Historic Heritage Home",
    address: "159 Old Town District, Cebu City",
    price: "₱105,000/month",
    beds: 3,
    baths: 2,
    sqft: 1250,
    rating: "4.29"
  },
  {
    id: 14,
    name: "Contemporary Duplex",
    address: "357 Modern Subdivision, Talisay City",
    price: "₱115,000/month",
    beds: 3,
    baths: 2,
    sqft: 1300,
    rating: "4.63"
  },
  {
    id: 15,
    name: "Riverside Retreat",
    address: "468 Waterfront Avenue, Mandaue City",
    price: "₱125,000/month",
    beds: 3,
    baths: 3,
    sqft: 1400,
    rating: "4.75"
  },
]

export function PropertyGrid() {
  const [selectedProperty, setSelectedProperty] = useState<typeof properties[0] | null>(null)

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Scrollable Property Cards Container */}
        <div className="flex-1 overflow-y-auto pr-2 pt-16 lg:pt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property}
                onClick={() => setSelectedProperty(property)}
              />
            ))}
          </div>
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