import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"

export function CTASection() {
  const navigate = useNavigate()
  return (
    <section className="py-20 bg-gradient-to-r from-[#0A4174] via-[#49769F] to-[#0A4174] text-[#F0FFFF]">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">LOOKING FOR YOUR NEXT PROPERTY?</h2>
        <p className="text-xl mb-8">LET'S HELP YOU FIND IT TODAY</p>
        <Button
          size="lg"
          className="bg-[#FFFFFF] text-[#0A4174] hover:bg-[#F0FFFF] text-lg px-8 py-3"
          onClick={() => navigate("/login")}
        >
          GET STARTED
        </Button>
      </div>
    </section>
  )
}
