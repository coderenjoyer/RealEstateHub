import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Home } from 'lucide-react';

interface CreationDisabledModalProps {
  open: boolean;
  onClose: () => void;
}

const CreationDisabledModal: React.FC<CreationDisabledModalProps> = ({
  open,
  onClose,
}) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  if (!open || !portalContainer) return null;

  return createPortal(
    <div className="fixed left-0 right-0 top-0 bottom-0 z-[70] flex items-center justify-center px-4 ml-0 md:ml-64">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="rounded-3xl border border-white/60 bg-white/95 shadow-2xl backdrop-blur p-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg ring-4 ring-orange-100">
              <AlertCircle className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold tracking-[0.2em] text-orange-600">
              FEATURE DISABLED
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              Property Creation Disabled
            </h2>
            <p className="text-sm text-slate-600">
              Creating new property listings is currently disabled by the administrator. 
              Please try again later or contact support for more information.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              className="w-full rounded-2xl bg-[#49769F] text-white shadow-lg hover:bg-[#3a5d7f] py-2 font-medium transition-colors"
              onClick={onClose}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>,
    portalContainer
  );
};

export default CreationDisabledModal;
