import { Header } from "./components/header"
import { HeroSection } from "./components/hero-section"
import { ServicesSection } from "./components/services-section"
import { WhyChooseSection } from "./components/why-choose-section"
import { ReviewsSection } from "./components/reviews-section"
import { CTASection } from "./components/cta-section"
import { Footer } from "./components/footer"

function App() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <ServicesSection />
      <WhyChooseSection />
      <ReviewsSection />
      <CTASection />
      <Footer />
    </main>
  )
}

export default App
