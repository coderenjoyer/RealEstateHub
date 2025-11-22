import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle } from 'lucide-react';

interface MaintenanceModeModalProps {
  open: boolean;
  onLogout: () => void;
}

const MaintenanceModeModal: React.FC<MaintenanceModeModalProps> = ({
  open,
  onLogout,
}) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  if (!open || !portalContainer) return null;

  return createPortal(
    <div className="fixed left-0 right-0 top-0 bottom-0 z-[9999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in-0"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="rounded-3xl border border-white/60 bg-white/95 shadow-2xl backdrop-blur p-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 text-white shadow-lg ring-4 ring-yellow-100">
              <AlertCircle className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold tracking-[0.2em] text-amber-600">
              MAINTENANCE MODE
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              Maintenance in Progress
            </h2>
            <p className="text-sm text-slate-600">
              The system is currently undergoing maintenance. Please try again later. 
              Thank you for your patience.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={onLogout}
              className="w-full px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Logout
            </button>
            <p className="text-xs text-slate-500 text-center">
              We'll be back online soon
            </p>
          </div>
        </div>
      </div>
    </div>,
    portalContainer
  );
};

export default MaintenanceModeModal;
