import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"

export function CTASection() {
  const navigate = useNavigate()
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">LOOKING FOR YOUR NEXT PROPERTY?</h2>
        <p className="text-xl mb-8">LET'S HELP YOU FIND IT TODAY</p>
        <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-3" onClick={() => navigate('/login')}>
          GET STARTED
        </Button>
      </div>
    </section>
  )
}
