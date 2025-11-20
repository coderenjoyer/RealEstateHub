import { useState, useEffect } from 'react';
import supabase from '@/supabaseClient';

interface FeatureStatus {
  userRegistrationEnabled: boolean;
  propertyListingsEnabled: boolean;
  messagingEnabled: boolean;
  notificationsEnabled: boolean;
  maintenanceMode: boolean;
  loading: boolean;
  error: Error | null;
}

export const useFeatureStatus = () => {
  const [status, setStatus] = useState<FeatureStatus>({
    userRegistrationEnabled: true,
    propertyListingsEnabled: true,
    messagingEnabled: true,
    notificationsEnabled: true,
    maintenanceMode: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchFeatureStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('*')
          .single();

        if (error) {
          console.warn('Error fetching feature status:', error);
          setStatus(prev => ({
            ...prev,
            loading: false,
            error: new Error('Failed to fetch feature status'),
          }));
          return;
        }

        if (data) {
          setStatus({
            userRegistrationEnabled: data.user_registration_enabled ?? true,
            propertyListingsEnabled: data.property_listings_enabled ?? true,
            messagingEnabled: data.messaging_enabled ?? true,
            notificationsEnabled: data.notifications_enabled ?? true,
            maintenanceMode: data.maintenance_mode ?? false,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.warn('Error fetching feature status:', error);
        setStatus(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        }));
      }
    };

    fetchFeatureStatus();

    // Optional: Set up real-time subscription to admin_settings changes
    const subscription = supabase
      .channel('admin_settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'admin_settings',
          filter: 'id=eq.1',
        },
        (payload) => {
          if (payload.new) {
            setStatus({
              userRegistrationEnabled: payload.new.user_registration_enabled ?? true,
              propertyListingsEnabled: payload.new.property_listings_enabled ?? true,
              messagingEnabled: payload.new.messaging_enabled ?? true,
              notificationsEnabled: payload.new.notifications_enabled ?? true,
              maintenanceMode: payload.new.maintenance_mode ?? false,
              loading: false,
              error: null,
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return status;
};
