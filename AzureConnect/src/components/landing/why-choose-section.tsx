import { useState, useEffect } from 'react'
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
  const [isHovered, setIsHovered] = useState(false)

  // Auto-slide functionality
  useEffect(() => {
    if (isHovered) return // Pause when hovered
    
    const interval = setInterval(() => {
      nextImage()
    }, 4000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [isHovered])

  const nextImage = () => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      )
      setTimeout(() => {
        setIsTransitioning(false)
      }, 100)
    }, 300)
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
            <div 
              className="relative overflow-hidden rounded-lg group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="relative w-full h-96">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image.src}
                    alt={image.alt}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out transform ${
                      index === currentImageIndex
                        ? 'opacity-100 scale-100 translate-x-0'
                        : index === (currentImageIndex - 1 + images.length) % images.length
                        ? 'opacity-0 scale-105 -translate-x-full'
                        : 'opacity-0 scale-105 translate-x-full'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextImage}
                disabled={isTransitioning}
                className={`absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white px-3 py-2 rounded-full font-medium backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-xl ${
                  isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'
                } ${isHovered ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isTransitioning) {
                        setCurrentImageIndex(index)
                      }
                    }}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentImageIndex 
                        ? 'w-8 h-2 bg-white scale-100' 
                        : 'w-2 h-2 bg-white/50 hover:bg-white/75 hover:scale-125'
                    }`}
                    disabled={isTransitioning}
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
