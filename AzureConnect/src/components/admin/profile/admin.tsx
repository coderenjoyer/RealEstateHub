import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Shield, Users, Activity, Server, Lock, Eye, AlertCircle, CheckCircle, Clock, Database, Globe, Bell, Home } from 'lucide-react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import supabase from '@/supabaseClient';

// Admin Controls Component
const AdminControls: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    uptime: '99.9%',
    activeUsers: 0,
    databaseStatus: 'operational',
    lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
    totalListings: 0,
    pendingApprovals: 0,
  });

  const [features, setFeatures] = useState({
    userRegistration: true,
    propertyListings: true,
    messaging: true,
    notifications: true,
    maintenanceMode: false,
  });

  const [loadingFeature, setLoadingFeature] = useState<string | null>(null);
  const [registrationDisabledNotice, setRegistrationDisabledNotice] = useState(false);

  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    passwordPolicy: 'strict',
    sessionTimeout: 30,
    ipWhitelist: false,
  });

  const [recentActivity, setRecentActivity] = useState<Array<any>>([]);

  useEffect(() => {
    fetchRecentActivities();
    fetchSystemHealth();
    loadFeatureSettings();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      // Fetch recent user signups
      const { data: newUsers } = await supabase
        .from('profiles')
        .select('user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch recent property listings from agents
      const { data: newListings } = await supabase
        .from('listed_properties')
        .select('id, property_title, created_at')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(3);

      // Combine and sort by date
      const activities: Array<any> = [];

      newUsers?.forEach((user: any) => {
        activities.push({
          id: `user-${user.user_id}`,
          user: 'New User',
          action: 'Signed up for the platform',
          time: formatTimeAgo(user.created_at),
          type: 'success',
          icon: 'user',
          timestamp: new Date(user.created_at).getTime(),
        });
      });

      newListings?.forEach((listing: any) => {
        activities.push({
          id: `listing-${listing.id}`,
          user: 'Agent',
          action: `Posted new listing: "${listing.property_title}"`,
          time: formatTimeAgo(listing.created_at),
          type: 'success',
          icon: 'home',
          timestamp: new Date(listing.created_at).getTime(),
        });
      });

      // Sort by timestamp and take top 3
      setRecentActivity(
        activities
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 3)
      );
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const loadFeatureSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single();

      if (error) {
        console.warn('Error loading feature settings (non-critical):', error);
        return;
      }

      if (data) {
        setFeatures({
          userRegistration: data.user_registration_enabled ?? true,
          propertyListings: data.property_listings_enabled ?? true,
          messaging: data.messaging_enabled ?? true,
          notifications: data.notifications_enabled ?? true,
          maintenanceMode: data.maintenance_mode ?? false,
        });
      }
    } catch (error) {
      console.warn('Error loading feature settings (non-critical):', error);
    }
  };

  const toggleFeature = async (feature: keyof typeof features) => {
    setLoadingFeature(feature);
    try {
      const newValue = !features[feature];
      const updatePayload: Record<string, boolean> = {};
      
      // Map feature names to database column names
      switch (feature) {
        case 'userRegistration':
          updatePayload.user_registration_enabled = newValue;
          break;
        case 'propertyListings':
          updatePayload.property_listings_enabled = newValue;
          break;
        case 'messaging':
          updatePayload.messaging_enabled = newValue;
          break;
        case 'notifications':
          updatePayload.notifications_enabled = newValue;
          break;
        case 'maintenanceMode':
          updatePayload.maintenance_mode = newValue;
          break;
      }

      // Update database
      const { error } = await supabase
        .from('admin_settings')
        .update(updatePayload)
        .eq('id', 1);

      if (error) {
        console.error('Error updating feature:', error);
        // Revert UI change if update fails
        setFeatures(prev => ({ ...prev, [feature]: !newValue }));
        return;
      }

      // Update local state
      setFeatures(prev => ({ ...prev, [feature]: newValue }));
      
      // Show notice if registration is being disabled
      if (feature === 'userRegistration' && newValue === false) {
        setRegistrationDisabledNotice(true);
      } else if (feature === 'userRegistration' && newValue === true) {
        setRegistrationDisabledNotice(false);
      }
    } catch (error) {
      console.error('Error toggling feature:', error);
    } finally {
      setLoadingFeature(null);
    }
  };

  // ... existing code ...

  const refreshSystemStatus = () => {
    fetchSystemHealth();
  };

  const fetchSystemHealth = async () => {
    try {
      // Get total user count
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total property listings count
      const { count: totalListings, error: listingsError } = await supabase
        .from('listed_properties')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false);

      // Get pending approvals count
      const { count: pendingApprovals, error: approvalsError } = await supabase
        .from('listing_approvals')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'pending');

      if (usersError || listingsError || approvalsError) {
        console.warn('Some system health queries failed (non-critical):', { usersError, listingsError, approvalsError });
      }

      setSystemHealth(prev => ({
        ...prev,
        activeUsers: totalUsers || 0,
        totalListings: totalListings || 0,
        pendingApprovals: pendingApprovals || 0,
      }));
      
      // Set registration disabled notice based on current feature status
      if (!features.userRegistration) {
        setRegistrationDisabledNotice(true);
      }
    } catch (error) {
      console.warn('Error fetching system health (non-critical):', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Registration Disabled Alert */}
      {registrationDisabledNotice && !features.userRegistration && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-red-800">User Registration Currently Disabled</h3>
              <p className="text-sm text-red-700 mt-1">
                Sign-up is not currently available. Users will see a notice that registration is disabled. 
                Enable user registration in Feature Management below to allow new sign-ups.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* System Health Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity size={20} />
            System Health Overview
          </h3>
          <button
            onClick={refreshSystemStatus}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-600" size={20} />
              <span className="font-semibold text-green-900">System Status</span>
            </div>
            <p className="text-2xl font-bold text-green-600 capitalize">{systemHealth.status}</p>
            <p className="text-sm text-green-700 mt-1">All systems operational</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-blue-600" size={20} />
              <span className="font-semibold text-blue-900">Active Users</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{systemHealth.activeUsers.toLocaleString()}</p>
            <p className="text-sm text-blue-700 mt-1">Total users registered</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Database className="text-gray-600" size={18} />
              <span className="text-sm text-gray-700">Database Status</span>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {systemHealth.databaseStatus}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Home className="text-blue-600" size={18} />
              <span className="text-sm text-blue-700">Total Listings</span>
            </div>
            <span className="text-sm font-semibold text-blue-600">{systemHealth.totalListings}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-orange-600" size={18} />
              <span className="text-sm text-orange-700">Pending Approvals</span>
            </div>
            <span className="text-sm font-semibold text-orange-600">{systemHealth.pendingApprovals}</span>
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe size={20} />
          Feature Management
        </h3>
        <p className="text-sm text-gray-600 mb-4">Enable or disable features across the platform</p>
        
        <div className="space-y-3">
          {Object.entries(features).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  {value ? 'Feature is currently enabled' : 'Feature is currently disabled'}
                </p>
              </div>
              <button
                onClick={() => toggleFeature(key as keyof typeof features)}
                disabled={loadingFeature === key}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-300'
                } ${loadingFeature === key ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {features.maintenanceMode && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-medium text-yellow-800">Maintenance Mode Active</p>
              <p className="text-sm text-yellow-700 mt-1">
                Users will see a maintenance message. Only admins can access the system.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell size={20} />
          Recent Activity
        </h3>
        
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                activity.type === 'success'
                  ? 'bg-green-50 border-green-200'
                  : activity.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className={`mt-0.5 ${
                activity.type === 'success'
                  ? 'text-green-600'
                  : activity.type === 'warning'
                  ? 'text-yellow-600'
                  : 'text-blue-600'
              }`}>
                {activity.icon === 'home' ? (
                  <Home size={18} />
                ) : activity.icon === 'user' ? (
                  <Users size={18} />
                ) : activity.type === 'success' ? (
                  <CheckCircle size={18} />
                ) : activity.type === 'warning' ? (
                  <AlertCircle size={18} />
                ) : (
                  <Activity size={18} />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.user}</p>
                <p className="text-sm text-gray-600">{activity.action}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Page component wrapped with AdminLayout
export default function AdminProfilePage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Controls & Settings
        </h1>
        <p className="text-gray-600 mb-6">
          Manage system operations and monitor platform activity
        </p>
        <AdminControls />
      </div>
    </AdminLayout>
  );
}
