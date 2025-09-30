import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Star } from "lucide-react"

const reviews = [
  {
    name: "Carole Pye Sa Neves",
    image: "/modern-living-room.png",
    rating: 5,
    text: "Working with AssetConnect was an absolute pleasure. They helped us find our dream home in record time. The team was professional, knowledgeable, and always available to answer our questions.",
  },
  {
    name: "Carole Pye Sa Nylah",
    image: "/luxury-kitchen-interior.png",
    rating: 5,
    text: "Exceptional service from start to finish! The attention to detail and personalized approach made all the difference. I highly recommend AssetConnect to anyone looking for their perfect property.",
  },
]

export function ReviewsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-foreground">Our Client Reviews</h2>
          <Button variant="link" className="text-primary">
            See more →
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {reviews.map((review, index) => (
            <Card key={index} className="p-6 bg-accent/30 border-none">
              <div className="flex gap-6">
                <img
                  src={review.image || "/placeholder.svg"}
                  alt={review.name}
                  className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">{review.name}</h3>
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
