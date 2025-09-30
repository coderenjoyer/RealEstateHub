import { Building2, Users, Shield, Wrench, Home, Star, Key, MapPin } from "lucide-react"

const services = [
  {
    icon: Building2,
    title: "Buy Real Wholesale",
    description: "Access exclusive wholesale properties with significant savings",
  },
  {
    icon: Users,
    title: "Broker Verification",
    description: "All our brokers are verified and certified professionals",
  },
  {
    icon: Shield,
    title: "Secure Deals",
    description: "Protected transactions with comprehensive legal support",
  },
  {
    icon: Wrench,
    title: "Maintenance Request",
    description: "24/7 maintenance support for all your property needs",
  },
  {
    icon: Home,
    title: "Verified for Vacant Rooms",
    description: "Thoroughly inspected vacant properties ready for occupancy",
  },
  {
    icon: Star,
    title: "Verified for Vacant Rooms",
    description: "Premium properties with verified vacancy status",
  },
  {
    icon: Key,
    title: "Move In Move Out Services",
    description: "Complete relocation assistance and property handover",
  },
  {
    icon: MapPin,
    title: "Prime Locations",
    description: "Properties in the most desirable neighborhoods",
  },
]

export function ServicesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-foreground">WHAT WE DO</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We create real estate management simple and accessible. Our comprehensive platform connects buyers,
              sellers, and investors with verified properties and trusted professionals, making your property journey
              seamless from start to finish.
            </p>
          </div>

          <div className="grid gap-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <service.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
