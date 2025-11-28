import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"

export function HeroSection() {
  const navigate = useNavigate()
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center hero-gradient scroll-mt-24 bg-[#0A4174]"
    >
      <div className="absolute inset-0 bg-[#0A4174]/70"></div>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/upward-skyp.png')`,
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A4174]/80 via-[#49769F]/40 to-transparent"></div>

      <div className="relative z-10 container mx-auto px-6 text-center text-[#F0FFFF]">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">A New Shade of Home</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-balance opacity-90">
          Discover exceptional properties that redefine modern living. Your dream home awaits in our curated collection
          of real estate properties.
        </p>

{/*}
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
        </div> */}

        <Button
          size="lg"
          className="bg-[#FFFFFF] text-[#0A4174] hover:bg-[#F0FFFF] text-lg px-8 py-3"
          onClick={() => navigate("/login")}
        >
          Explore Properties
        </Button>
      </div>
    </section>
  )
}
