import { useAuth } from "../../AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AzureRealEstateLoader from "./loadingscreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "agent" | "user";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (session?.user) {
        // Get user role from session
        const role = session.user.user_metadata?.role || 
                    session.user.app_metadata?.role || 
                    (session.user.email?.endsWith('@admin.com') ? 'admin' : 'user');
        setUserRole(role);
      }
      setIsLoading(false);
    };

    checkUserRole();
  }, [session]);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return <AzureRealEstateLoader />;
  }

  // If not authenticated, redirect to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check it
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    switch (userRole) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "agent":
        return <Navigate to="/agent/listed-properties" replace />;
      case "user":
        return <Navigate to="/user" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // If user is authenticated and has the required role (if any), render the children
  return <>{children}</>;
}