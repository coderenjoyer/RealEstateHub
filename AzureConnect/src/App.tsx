import { Header } from "./components/landing/header"
import { HeroSection } from "./components/landing/hero-section"
import { ServicesSection } from "./components/landing/services-section"
import { WhyChooseSection } from "./components/landing/why-choose-section"
import { ReviewsSection } from "./components/landing/reviews-section"
import { CTASection } from "./components/landing/cta-section"
import { Footer } from "./components/landing/footer"
import LoginParentContainer from "./components/login/login_parent_container"
import { Routes, Route } from "react-router-dom"
import { lazy, Suspense } from "react"
import AdminPage from "./components/admin/admin-page"
import ListingApprovalsPage from "./components/admin/listings/admin-listing"
import UserManagementPage from "./components/admin/user-management/user-page"
import AdminProfilePage from "./components/admin/profile/profile-page"
import ReportsPage from "./components/admin/reports/reports-page"
const AgentListedPropertiesPage = lazy(() => import("./components/Agent/listedproperties/page"))
const AgentProfilePage = lazy(() => import("./components/Agent/profile/page"))
const AgentListPropertyPage = lazy(() => import("./components/Agent/createlist/page"))
const AgentReportsPage = lazy(() => import("./components/Agent/reports/page"))
const AgentCommunicationPage = lazy(() => import("./components/Agent/communication/page"))
const UserHomePage = lazy(() => import("./components/User/user-page"))
const UserProfilePage = lazy(() => import("./components/User/profile-page"))

function App() {
  return (
    <Suspense fallback={<main className="min-h-screen p-8"><h1 className="text-xl font-semibold">Loading...</h1></main>}>
      <Routes>
      <Route
        path="/"
        element={<UserHomePage />}
      />
      <Route path="/login" element={<LoginParentContainer />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/profile" element={<AdminProfilePage />} />
      <Route path="/admin/listings" element={<ListingApprovalsPage />} />
      <Route path="/admin/users" element={<UserManagementPage />} />
      <Route path="/admin/reports" element={<ReportsPage />} />
      <Route path="/user" element={<UserHomePage />} />
      <Route path="/user/profile" element={<UserProfilePage />} />
      <Route path="/agent/listed-properties" element={<AgentListedPropertiesPage />} />
      <Route path="/agent" element={<AgentProfilePage />} />
      <Route path="/agent/createlist" element={<AgentListPropertyPage />} />
      <Route path="/agent/reports" element={<AgentReportsPage />} />
      <Route path="/agent/communication" element={<AgentCommunicationPage />} />
        <Route path="*" element={<main className="min-h-screen p-8"><h1 className="text-xl font-semibold">Page not found</h1></main>} />
      </Routes>
    </Suspense>
  )
}

export default App
