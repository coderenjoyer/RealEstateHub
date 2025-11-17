import { useState, useEffect, useRef } from 'react';
import { Settings, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../AuthContext';

interface UserProfileDropdownProps {
  onClose: () => void;
  onNavigateToProfile: () => void;
  onNavigateToPropertyMaintenance?: () => void; // Added optional property maintenance navigation
  onLogout: () => void;
}

export function UserProfileDropdown({ onClose, onNavigateToProfile, onNavigateToPropertyMaintenance, onLogout }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { session } = useAuth();

  const displayName = (() => {
    const meta = session?.user?.user_metadata as Record<string, any> | undefined;
    const first = meta?.first_name?.toString()?.trim();
    const last = meta?.last_name?.toString()?.trim();
    if (first || last) return `${first ?? ''} ${last ?? ''}`.trim();
    const email = session?.user?.email ?? '';
    return email.split('@')[0] || 'User';
  })();
  const email = session?.user?.email ?? '';

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsOpen(false);
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSettingsClick = () => {
    onNavigateToProfile();
    setIsOpen(false);
    onClose();
  };

  // Handler for property maintenance click
  const handlePropertyMaintenanceClick = () => {
    if (onNavigateToPropertyMaintenance) {
      onNavigateToPropertyMaintenance();
      setIsOpen(false);
      onClose();
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    setIsOpen(false);
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150"
    >
      {/* User Info */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
        {email && (
          <p className="text-xs text-gray-500 truncate">{email}</p>
        )}
      </div>
      <div className="my-1 border-t border-gray-100"></div>

      {/* Menu Items */}
      <div className="py-2">
        {/* Property Maintenance */}
        {onNavigateToPropertyMaintenance && (
          <button
            onClick={handlePropertyMaintenanceClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
          >
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Home className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Property Maintenance</p>
              <p className="text-xs text-gray-500">Manage your properties</p>
            </div>
          </button>
        )}

        {/* Settings */}
        <button
          onClick={handleSettingsClick}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="p-2 bg-sky-100 rounded-lg group-hover:bg-sky-200 transition-colors">
            <Settings className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Settings</p>
            <p className="text-xs text-gray-500">Manage your profile</p>
          </div>
        </button>

        {/* Divider */}
        <div className="my-1 border-t border-gray-100"></div>

        {/* Log Out */}
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors group"
        >
          <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
            <LogOut className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-600">Log Out</p>
            <p className="text-xs text-gray-500">Sign out of your account</p>
          </div>
        </button>
      </div>
    </div>
  );
}