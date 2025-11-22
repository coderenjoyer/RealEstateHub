import { Header } from "./components/landing/header";
import { HeroSection } from "./components/landing/hero-section";
import { ServicesSection } from "./components/landing/services-section";
import { WhyChooseSection } from "./components/landing/why-choose-section";
import { CTASection } from "./components/landing/cta-section";
import { Footer } from "./components/landing/footer";
import LoginParentContainer from "./components/login/login_parent_container";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import ErrorPage from "./components/ui/errorpage";
import AdminPage from "./components/admin/admin-page";
import ListingApprovalsPage from "./components/admin/listings/admin-listing";
import UserManagementPage from "./components/admin/user-management/user-page";
import AdminProfilePage from "./components/admin/profile/admin";
import ReportsPage from "./components/admin/reports/admin_contact";
import { BookmarkProvider } from "./contexts/BookmarkContext";
import AzureRealEstateLoader from "./components/ui/loadingscreen";
import { ProtectedRoute } from "./components/ui/ProtectedRoute";
import { useAuth } from "./AuthContext";
import { useFeatureStatus } from "./hooks/useFeatureStatus";
import MaintenanceModeModal from "./components/ui/maintenance-mode-modal";
import FloatingMessageButton from "./components/messaging/floating-message-button";

const AgentListedPropertiesPage = lazy(
  () => import("./components/Agent/listedproperties/page")
);
const AgentProfilePage = lazy(() => import("./components/Agent/profile/page"));
const AgentListPropertyPage = lazy(
  () => import("./components/Agent/createlist/createlistpage")
);
const AgentReportsPage = lazy(() => import("./components/Agent/reports/agent_report_page"));
const AgentCommunicationPage = lazy(
  () => import("./components/Agent/communication/messenger_page")
);
const UserHomePage = lazy(() => import("./components/User/user-page"));
const UserProfilePage = lazy(() => import("./components/User/profile-page"));
const FavoritesPage = lazy(() => import("./components/User/favorites"));
const PropertyMaintenancePage = lazy(() => import("./components/User/maintenance/maintenance"));

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, signOut, isLoading } = useAuth();
  const { maintenanceMode } = useFeatureStatus();

  // Store last location in localStorage on every successful navigation
  useEffect(() => {
    if (session && !location.pathname.includes('/login') && location.pathname !== '/') {
      localStorage.setItem('lastLocation', location.pathname);
    }
  }, [session, location]);

  // On mount, restore user to their last location if authenticated
  useEffect(() => {
    if (!isLoading && session) {
      const lastLocation = localStorage.getItem('lastLocation');
      if (lastLocation && location.pathname === '/') {
        navigate(lastLocation, { replace: true });
      }
    }
  }, [isLoading]);

  // ... existing code ...

  const userRole = session?.user?.user_metadata?.role;
  const isAdmin = userRole === 'admin';

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Show maintenance mode modal only for non-admin users
  const showMaintenanceModal = (maintenanceMode === true) && session && !isAdmin && !location.pathname.includes('/login');

  // Show loading screen while checking authentication
  if (isLoading) {
    return <AzureRealEstateLoader />;
  }

  return (
    <BookmarkProvider>
      <MaintenanceModeModal open={showMaintenanceModal || false} onLogout={handleLogout} />
      <FloatingMessageButton />
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
              <CTASection />
              <Footer />
            </main>
          }
          
        />
        <Route path="/login" element={<LoginParentContainer />} />
        <Route path="/login/reset" element={<LoginParentContainer />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/profile" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/listings" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ListingApprovalsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <UserManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ReportsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* User Routes */}
        <Route 
          path="/user" 
          element={
            <ProtectedRoute requiredRole="user">
              <UserHomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/profile" 
          element={
            <ProtectedRoute requiredRole="user">
              <UserProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/favorites" 
          element={
            <ProtectedRoute requiredRole="user">
              <FavoritesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/property-maintenance" 
          element={
            <ProtectedRoute requiredRole="user">
              <PropertyMaintenancePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Agent Routes */}
        <Route
          path="/agent/listed-properties"
          element={
            <ProtectedRoute requiredRole="agent">
              <AgentListedPropertiesPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/agent/profile" 
          element={
            <ProtectedRoute requiredRole="agent">
              <AgentProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agent/createlist" 
          element={
            <ProtectedRoute requiredRole="agent">
              <AgentListPropertyPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agent/reports" 
          element={
            <ProtectedRoute requiredRole="agent">
              <AgentReportsPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/agent/communication"
          element={
            <ProtectedRoute requiredRole="agent">
              <AgentCommunicationPage />
            </ProtectedRoute>
          }
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