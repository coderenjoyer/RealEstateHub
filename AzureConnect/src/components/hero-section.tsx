import { Button } from "./ui/button"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center hero-gradient">
      <div className="absolute inset-0 bg-black/20"></div>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/upward-skyp.png')`,
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

      <div className="relative z-10 container mx-auto px-6 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">A New Shade of Home</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-balance opacity-90">
          Discover exceptional properties that redefine modern living. Your dream home awaits in our curated collection
          of premium real estate.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          <div className="text-center">
            <div className="text-4xl font-bold">50</div>
            <div className="text-sm opacity-80">Properties</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">100M</div>
            <div className="text-sm opacity-80">Total Value</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">1M</div>
            <div className="text-sm opacity-80">Sq Ft Available</div>
          </div>
        </div>

        <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-3">
          Explore Properties
        </Button>
      </div>
    </section>
  )
}
