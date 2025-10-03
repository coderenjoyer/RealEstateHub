import { PropertyCard } from "@/components/User/property-card"

const properties = [
  {
    id: 1,
    name: "Aurelia Heights",
    address: "sknov nksi de dknt mfkmg mskfnjs",
    price: "₹2,000/month",
    beds: 3,
    baths: 2,
    sqft: 1200,
  },
  {
    id: 2,
    name: "Aurelia Heights",
    address: "sknov nksi de dknt mfkmg mskfnjs",
    price: "₹2,000/month",
    beds: 3,
    baths: 2,
    sqft: 1200,
  },
  {
    id: 3,
    name: "Aurelia Heights",
    address: "sknov nksi de dknt mfkmg mskfnjs",
    price: "₹2,000/month",
    beds: 3,
    baths: 2,
    sqft: 1200,
  },
  {
    id: 4,
    name: "Aurelia Heights",
    address: "sknov nksi de dknt mfkmg mskfnjs",
    price: "₹2,000/month",
    beds: 3,
    baths: 2,
    sqft: 1200,
  },
  {
    id: 5,
    name: "Aurelia Heights",
    address: "sknov nksi de dknt mfkmg mskfnjs",
    price: "₹2,000/month",
    beds: 3,
    baths: 2,
    sqft: 1200,
  },
  {
    id: 6,
    name: "Aurelia Heights",
    address: "sknov nksi de dknt mfkmg mskfnjs",
    price: "₹2,000/month",
    beds: 3,
    baths: 2,
    sqft: 1200,
  },
]

export function PropertyGrid() {
  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}
