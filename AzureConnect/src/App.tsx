import { Header } from "./components/landing/header"
import { HeroSection } from "./components/landing/hero-section"
import { ServicesSection } from "./components/landing/services-section"
import { WhyChooseSection } from "./components/landing/why-choose-section"
import { ReviewsSection } from "./components/landing/reviews-section"
import { CTASection } from "./components/landing/cta-section"
import { Footer } from "./components/landing/footer"
import LoginParentContainer from "./components/login/login_parent_container"
import { Routes, Route } from "react-router-dom"

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="min-h-screen">
            <Header />
            <HeroSection />
            <ServicesSection />
            <WhyChooseSection />
            <ReviewsSection />
            <CTASection />
            <Footer />
          </main>
        }
      />
      <Route path="/login" element={<LoginParentContainer />} />
    </Routes>     
  )
}

export default App
