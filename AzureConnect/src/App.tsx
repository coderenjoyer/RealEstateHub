import { Header } from "./components/landing/header";
import { HeroSection } from "./components/landing/hero-section";
import { ServicesSection } from "./components/landing/services-section";
import { WhyChooseSection } from "./components/landing/why-choose-section";
import { ReviewsSection } from "./components/landing/reviews-section";
import { CTASection } from "./components/landing/cta-section";
import { Footer } from "./components/landing/footer";
import LoginParentContainer from "./components/login/login_parent_container";
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ErrorPage from "./components/ui/errorpage";
import AdminPage from "./components/admin/admin-page";
import ListingApprovalsPage from "./components/admin/listings/admin-listing";
import UserManagementPage from "./components/admin/user-management/user-page";
import AdminProfilePage from "./components/admin/profile/admin";
import ReportsPage from "./components/admin/reports/admin_controls";
import { BookmarkProvider } from "./contexts/BookmarkContext";
import AzureRealEstateLoader from "./components/ui/loadingscreen";
const AgentListedPropertiesPage = lazy(
  () => import("./components/Agent/listedproperties/page")
);
const AgentProfilePage = lazy(() => import("./components/Agent/profile/page"));
const AgentListPropertyPage = lazy(
  () => import("./components/Agent/createlist/createlistpage")
);
const AgentReportsPage = lazy(() => import("./components/Agent/reports/page"));
const AgentCommunicationPage = lazy(
  () => import("./components/Agent/communication/page")
);
const UserHomePage = lazy(() => import("./components/User/user-page"));
const UserProfilePage = lazy(() => import("./components/User/profile-page"));
const FavoritesPage = lazy(() => import("./components/User/favorites"));
const PropertyMaintenancePage = lazy(() => import("./components/User/maintenance/maintenance"));

function App() {
  return (
    <BookmarkProvider>
      <Suspense fallback={<AzureRealEstateLoader />}>
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
        <Route path="/login/reset" element={<LoginParentContainer />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />
        <Route path="/admin/listings" element={<ListingApprovalsPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/user" element={<UserHomePage />} />
        <Route path="/user/profile" element={<UserProfilePage />} />
        <Route path="/user/favorites" element={<FavoritesPage />} />
        <Route path="/user/property-maintenance" element={<PropertyMaintenancePage />} />
        <Route
          path="/agent/listed-properties"
          element={<AgentListedPropertiesPage />}
        />
        <Route path="/agent/profile" element={<AgentProfilePage />} />
        <Route path="/agent/createlist" element={<AgentListPropertyPage />} />
        <Route path="/agent/reports" element={<AgentReportsPage />} />
        <Route
          path="/agent/communication"
          element={<AgentCommunicationPage />}
        />
        <Route
          path="*"
          element={<ErrorPage />}
        />
        </Routes>
      </Suspense>
    </BookmarkProvider>
  );
}
export default App;