import React, { useState } from 'react';
import { Key, Database, AlertCircle, RefreshCw, Trash2, Settings, Save } from 'lucide-react';
import { AdminLayout } from '@/components/layouts/AdminLayout';

interface SystemConfigProps {
  initialConfig?: {
    appName?: string;
    supportEmail?: string;
    timezone?: string;
    apiKey?: string;
  };
  onSave?: (config: any) => void;
  onBackup?: () => void;
  onClearCache?: () => void;
  onRegenerateApiKey?: () => void;
}

interface ConfigData {
  appName: string;
  supportEmail: string;
  timezone: string;
  apiKey: string;
}

const SystemConfig: React.FC<SystemConfigProps> = ({
  initialConfig = {},
  onSave,
  onBackup,
  onClearCache,
  onRegenerateApiKey,
}) => {
  const [config, setConfig] = useState<ConfigData>({
    appName: initialConfig.appName || 'Admin Portal',
    supportEmail: initialConfig.supportEmail || 'support@company.com',
    timezone: initialConfig.timezone || 'UTC+08:00 Manila',
    apiKey: initialConfig.apiKey || 'sk_live_abc123xyz789',
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState({
    save: false,
    apiKey: false,
    backup: false,
    cache: false,
  });

  const handleInputChange = (field: keyof ConfigData, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveConfig = async () => {
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (onSave) {
        await onSave(config);
      }
      console.log('Saving configuration:', config);
      setTimeout(() => {
        setLoading((prev) => ({ ...prev, save: false }));
        alert('Configuration saved successfully!');
      }, 1000);
    } catch (error) {
      setLoading((prev) => ({ ...prev, save: false }));
      alert('Failed to save configuration');
    }
  };

  const handleRegenerateApiKey = async () => {
    if (!confirm('Regenerate API key? Old key will be invalidated.')) return;
    setLoading((prev) => ({ ...prev, apiKey: true }));

    try {
      if (onRegenerateApiKey) await onRegenerateApiKey();

      const newKey = `sk_live_${Math.random()
        .toString(36)
        .substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

      setConfig((prev) => ({ ...prev, apiKey: newKey }));
      setTimeout(() => {
        setLoading((prev) => ({ ...prev, apiKey: false }));
        alert('API key regenerated successfully!');
      }, 1000);
    } catch {
      setLoading((prev) => ({ ...prev, apiKey: false }));
      alert('Failed to regenerate API key');
    }
  };

  const handleBackup = async () => {
    setLoading((prev) => ({ ...prev, backup: true }));
    try {
      if (onBackup) await onBackup();
      setTimeout(() => {
        setLoading((prev) => ({ ...prev, backup: false }));
        alert('Backup completed successfully!');
      }, 2000);
    } catch {
      setLoading((prev) => ({ ...prev, backup: false }));
      alert('Backup failed');
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Clear cache? This may affect performance temporarily.')) return;

    setLoading((prev) => ({ ...prev, cache: true }));
    try {
      if (onClearCache) await onClearCache();
      setTimeout(() => {
        setLoading((prev) => ({ ...prev, cache: false }));
        alert('Cache cleared successfully!');
      }, 1500);
    } catch {
      setLoading((prev) => ({ ...prev, cache: false }));
      alert('Failed to clear cache');
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        System Configuration
      </h1>
      <p className="text-gray-600 mb-8">
        Configure system-wide settings and integrations
      </p>

      {/* General Settings */}
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
            disabled={loading.save}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading.save ? (
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

      {/* API Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Key size={20} />
          API Configuration
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="flex gap-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={handleRegenerateApiKey}
                disabled={loading.apiKey}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading.apiKey ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Regenerate
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-yellow-800 font-medium mb-1">
                Security Warning
              </p>
              <p className="text-sm text-yellow-700">
                Keep your API keys secure. Never share them publicly or commit them to version
                control. Regenerating the key will invalidate the old one immediately.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">API Endpoints</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-600">GET</span>
                <span className="text-gray-700">https://api.yourapp.com/v1/users</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-600">POST</span>
                <span className="text-gray-700">https://api.yourapp.com/v1/data</span>
              </div>
              <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-block mt-2">
                View Full API Documentation →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Database Maintenance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database size={20} />
          Database Maintenance
        </h3>

        <div className="space-y-3">
          {/* Backup */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">Backup Database</p>
              <p className="text-sm text-gray-500">
                Last backup: {new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Creates a complete backup of all database tables and data.
              </p>
            </div>
            <button
              onClick={handleBackup}
              disabled={loading.backup}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2 ml-4"
            >
              {loading.backup ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Backing up...
                </>
              ) : (
                <>
                  <Database size={16} />
                  Backup Now
                </>
              )}
            </button>
          </div>

          {/* Clear Cache */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">Clear Cache</p>
              <p className="text-sm text-gray-500">
                Improve performance by clearing old cached data.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Removes temporary files and cached responses. May cause temporary slowdown.
              </p>
            </div>
            <button
              onClick={handleClearCache}
              disabled={loading.cache}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 ml-4"
            >
              {loading.cache ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Clear Cache
                </>
              )}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-blue-800">
                <strong>Maintenance Schedule:</strong> Automated backups run daily at 2:00 AM.
                Cache is cleared weekly. Manual operations available here for immediate needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Page component wrapped with AdminLayout
export default function ReportsPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <SystemConfig />
      </div>
    </AdminLayout>
  );
}