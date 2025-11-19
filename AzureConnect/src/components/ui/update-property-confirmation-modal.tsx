import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Pencil } from "lucide-react"
import { Button } from "./button"

interface UpdatePropertyConfirmationModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  isProcessing?: boolean
  propertyTitle?: string
}

export function UpdatePropertyConfirmationModal({
  open,
  onConfirm,
  onCancel,
  isProcessing = false,
  propertyTitle = "Property",
}: UpdatePropertyConfirmationModalProps) {
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
        <div className="rounded-3xl border border-white/60 bg-white/95 shadow-2xl backdrop-blur p-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg ring-4 ring-blue-100">
              <Pencil className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold tracking-[0.2em] text-blue-500">
              UPDATE PROPERTY
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              Confirm property update?
            </h2>
            <p className="text-sm text-slate-600">
              You're about to update <strong>{propertyTitle}</strong>. Please review all changes before confirming.
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
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg hover:from-blue-600 hover:to-cyan-700"
              onClick={onConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? "Updating..." : "Confirm Update"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    portalContainer,
  )
}
