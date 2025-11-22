import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { LogOut } from "lucide-react"
import { Button } from "./button"

interface LogoutConfirmationModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  isProcessing?: boolean
}

export function LogoutConfirmationModal({
  open,
  onConfirm,
  onCancel,
  isProcessing = false,
}: LogoutConfirmationModalProps) {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPortalContainer(document.body)
  }, [])

  if (!open || !portalContainer) return null

  return createPortal(
    <div className="fixed inset-0 z-[70] flex min-h-screen items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in-0"
        onClick={() => {
          if (!isProcessing) onCancel()
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="rounded-3xl border border-white/60 bg-[#F0FFFF] shadow-2xl backdrop-blur p-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#49769F] text-white shadow-lg ring-4 ring-[#49769F]/30">
              <LogOut className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold tracking-[0.2em] text-[#49769F]">
              SIGN OUT
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              Are you sure you want to log out?
            </h2>
            <p className="text-sm text-slate-600">
              You will be signed out of AzureConnect on this device. Any unsaved changes or draft work will be lost.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 rounded-2xl border border-slate-200 bg-white/70 text-slate-700 hover:bg-white"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Stay signed in
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-2xl bg-[#49769F] text-white shadow-lg hover:bg-[#49769F]/90"
              onClick={onConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? "Logging out..." : "Log out"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    portalContainer,
  )
}


