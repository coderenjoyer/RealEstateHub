import { useState, useEffect, useRef } from 'react';
import { Settings, LogOut } from 'lucide-react';

interface UserProfileDropdownProps {
  onClose: () => void;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

export function UserProfileDropdown({ onClose, onNavigateToProfile, onLogout }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      

      {/* Menu Items */}
      <div className="py-2">
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