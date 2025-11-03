import React, { useState } from 'react';
import { Settings, Save, RefreshCw, Shield, Users, Activity, Server, Lock, Eye, AlertCircle, CheckCircle, Clock, Database, Globe, Bell } from 'lucide-react';
import { AdminLayout } from '@/components/layouts/AdminLayout';

interface AdminProfileProps {
  initialConfig?: {
    appName?: string;
    supportEmail?: string;
    timezone?: string;
  };
  onSave?: (config: any) => void;
}

interface ConfigData {
  appName: string;
  supportEmail: string;
  timezone: string;
}

const AdminProfile: React.FC<AdminProfileProps> = ({
  initialConfig = {},
  onSave,
}) => {
  const [config, setConfig] = useState<ConfigData>({
    appName: initialConfig.appName || 'Admin Portal',
    supportEmail: initialConfig.supportEmail || 'support@company.com',
    timezone: initialConfig.timezone || 'UTC+08:00 Manila',
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof ConfigData, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      if (onSave) await onSave(config);
      console.log('Saving configuration:', config);
      setTimeout(() => {
        setLoading(false);
        alert('Profile saved successfully!');
      }, 1000);
    } catch (error) {
      setLoading(false);
      alert('Failed to save profile');
    }
  };

  const timezones = [
    'UTC+08:00 Manila',
    'UTC+00:00 London',
    'UTC-05:00 New York',
    'UTC+09:00 Tokyo',
    'UTC+01:00 Paris',
    'UTC-08:00 Los Angeles',
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Settings size={20} />
        General Settings
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Application Name
          </label>
          <input
            type="text"
            value={config.appName}
            onChange={(e) => handleInputChange('appName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter application name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Support Email
          </label>
          <input
            type="email"
            value={config.supportEmail}
            onChange={(e) => handleInputChange('supportEmail', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="support@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={config.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Configuration
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Admin Controls Component
const AdminControls: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    uptime: '99.9%',
    activeUsers: 1247,
    serverLoad: 45,
    databaseStatus: 'operational',
    lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
  });

  const [features, setFeatures] = useState({
    userRegistration: true,
    propertyListings: true,
    messaging: true,
    notifications: true,
    maintenanceMode: false,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    passwordPolicy: 'strict',
    sessionTimeout: 30,
    ipWhitelist: false,
  });

  const [recentActivity] = useState([
    { id: 1, user: 'John Doe', action: 'Created listing', time: '2 minutes ago', type: 'success' },
    { id: 2, user: 'Jane Smith', action: 'Updated profile', time: '5 minutes ago', type: 'info' },
    { id: 3, user: 'Admin', action: 'System backup completed', time: '1 hour ago', type: 'success' },
    { id: 4, user: 'Mike Johnson', action: 'Failed login attempt', time: '2 hours ago', type: 'warning' },
  ]);

  const toggleFeature = (feature: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const toggleSecurity = (setting: keyof typeof security) => {
    if (setting === 'twoFactorAuth' || setting === 'ipWhitelist') {
      setSecurity(prev => ({ ...prev, [setting]: !prev[setting] }));
    }
  };

  const refreshSystemStatus = () => {
    setSystemHealth(prev => ({
      ...prev,
      activeUsers: Math.floor(Math.random() * 500) + 1000,
      serverLoad: Math.floor(Math.random() * 40) + 30,
    }));
    alert('System status refreshed!');
  };

  return (
    <div className="space-y-6">
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <p className="text-sm text-blue-700 mt-1">Currently online</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server className="text-purple-600" size={20} />
              <span className="font-semibold text-purple-900">Server Load</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{systemHealth.serverLoad}%</p>
            <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${systemHealth.serverLoad}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Database className="text-gray-600" size={18} />
              <span className="text-sm text-gray-700">Database Status</span>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {systemHealth.databaseStatus}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="text-gray-600" size={18} />
              <span className="text-sm text-gray-700">Last Backup</span>
            </div>
            <span className="text-sm text-gray-600">{systemHealth.lastBackup}</span>
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-300'
                }`}
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

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={20} />
          Security Controls
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="text-gray-600" size={20} />
              <div>
                <label className="font-medium text-gray-900">Two-Factor Authentication</label>
                <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
              </div>
            </div>
            <button
              onClick={() => toggleSecurity('twoFactorAuth')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                security.twoFactorAuth ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Eye className="text-gray-600" size={20} />
              <div>
                <label className="font-medium text-gray-900">IP Whitelist</label>
                <p className="text-sm text-gray-500">Restrict admin access to specific IP addresses</p>
              </div>
            </div>
            <button
              onClick={() => toggleSecurity('ipWhitelist')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                security.ipWhitelist ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  security.ipWhitelist ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block font-medium text-gray-900 mb-2">Password Policy</label>
            <select
              value={security.passwordPolicy}
              onChange={(e) => setSecurity(prev => ({ ...prev, passwordPolicy: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="basic">Basic (8+ characters)</option>
              <option value="standard">Standard (12+ characters, mixed case)</option>
              <option value="strict">Strict (16+ characters, special chars required)</option>
            </select>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block font-medium text-gray-900 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={security.sessionTimeout}
              onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 30 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="5"
              max="120"
            />
          </div>
        </div>
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
                {activity.type === 'success' ? (
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

        <button className="mt-4 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          View All Activity Logs →
        </button>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Database size={18} />
            Backup Database
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <CheckCircle size={18} />
            Run System Check
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Users size={18} />
            View All Users
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <AlertCircle size={18} />
            View System Logs
          </button>
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
          Manage your admin profile, system preferences, and oversee software operations
        </p>
        <AdminProfile />
        <AdminControls />
      </div>
    </AdminLayout>
  );
}
