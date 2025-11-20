import { useState, useEffect, useCallback } from 'react';
import supabase from '../supabaseClient';
import { useAuth } from '../AuthContext';

export interface AdminStats {
  totalProperties: number;
  activeTenants: number;
  vacantUnits: number;
  totalUsers: number;
  activeListings: number;
  pendingApprovals: number;
}

export interface Property {
  id: number;
  property_title: string;
  city: string;
  price: number;
  bedrooms: number;
  property_status: string;
  full_name: string;
  email: string;
  phone_number: string;
  created_at: string;
}

export function useAdminDashboard() {
  const { session } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalProperties: 0,
    activeTenants: 0,
    vacantUnits: 0,
    totalUsers: 0,
    activeListings: 0,
    pendingApprovals: 0,
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all admin dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch properties data
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('listed_properties')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(100);

      if (propertiesError) throw propertiesError;

      setProperties(propertiesData || []);

      // Calculate stats from properties
      const totalProperties = propertiesData?.length || 0;
      const activeListings = propertiesData?.filter(
        (p: Property) => p.property_status === 'available'
      ).length || 0;
      const vacantUnits = activeListings;

      // Fetch user count
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Fetch pending approvals count
      const { count: pendingApprovals, error: approvalsError } = await supabase
        .from('listing_approvals')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'pending');

      if (approvalsError) throw approvalsError;

      // Estimate active tenants (properties that are rented or sold)
      const activeTenants = propertiesData?.filter(
        (p: Property) => p.property_status === 'rented' || p.property_status === 'sold'
      ).length || 0;

      setStats({
        totalProperties,
        activeTenants,
        vacantUnits,
        totalUsers: totalUsers || 0,
        activeListings,
        pendingApprovals: pendingApprovals || 0,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    properties,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}
