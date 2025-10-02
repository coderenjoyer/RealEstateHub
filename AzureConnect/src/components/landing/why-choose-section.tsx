import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

export function WhyChooseSection() {
  const images = [
    {
      src: "/luxury-bedroom.jpg",
      alt: "Luxury bedroom"
    },
    {
      src: "/office space.jpg",
      alt: "Office space"
    },
    {
      src: "/swimming_pool.jpg",
      alt: "Swimming pool"
    }
  ]

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const nextImage = () => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      )
      setIsTransitioning(false)
    }, 150)
  }

  return (
    <section id="about" className="py-20 bg-accent/30 scroll-mt-24">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-foreground">Why Choose Us?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Over the years we have developed an unparalleled understanding of the real estate market. Our team of
              experienced professionals brings decades of combined expertise, ensuring you receive the best guidance and
              support throughout your property journey.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We pride ourselves on transparency, integrity, and delivering exceptional results. From first-time buyers
              to seasoned investors, we tailor our services to meet your unique needs and exceed your expectations.
            </p>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-lg group">
              <div className="relative w-full h-96">
                <img
                  key={currentImageIndex}
                  src={images[currentImageIndex].src}
                  alt={images[currentImageIndex].alt}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out ${
                    isTransitioning 
                      ? 'opacity-0 scale-105 blur-sm' 
                      : 'opacity-100 scale-100 blur-0'
                  }`}
                />
              </div>
              <button
                onClick={nextImage}
                disabled={isTransitioning}
                className={`absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg font-medium backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'
                }`}
              >
                <span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
