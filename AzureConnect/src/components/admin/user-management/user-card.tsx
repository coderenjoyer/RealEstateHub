"use client"

import { useState } from "react"
import { Mail, Phone, MoreVertical, X, Building2, Briefcase, Trash2, Shield, ShieldOff, CheckCircle } from "lucide-react"
import { useAuth } from "@/AuthContext"
import { deleteUserAccount, updateAccountStatus } from "@/services/adminService"

interface Account {
  id: string
  name: string
  email: string
  phone: string
  properties: number
  status?: "Active" | "Inactive" | "Pending"
  email_confirmed_at?: string | null
}

interface AccountCardProps {
  account: Account
  showStatus?: boolean
  isAgent?: boolean
  onAccountUpdate?: () => void
}

export function AccountCard({ account, showStatus, isAgent = true, onAccountUpdate }: AccountCardProps) {
  const { session } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [accountStatus, setAccountStatus] = useState<"Active" | "Inactive" | "Pending">(account.status || "Active")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)

  // Check if current user is admin
  const isAdminUser = session?.user?.user_metadata?.role === "admin"

  // Handle account deactivation/reactivation
  const handleToggleStatus = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const newStatus = accountStatus === "Active" ? "Inactive" : "Active"
      
      // Call the admin service function
      await updateAccountStatus(account.id, newStatus)

      setAccountStatus(newStatus)
      setShowMenu(false)
      setShowStatusConfirm(false)
      if (onAccountUpdate) onAccountUpdate()
    } catch (err) {
      console.error("Error updating account status:", err)
      setError(err instanceof Error ? err.message : "Failed to update account status")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle account deletion (admin only)
  const handleDeleteAccount = async () => {
    // Verify admin role before proceeding
    if (!isAdminUser) {
      setError("Only administrators can delete accounts")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      // Log admin action
      const adminId = session?.user?.id
      console.log(`Admin ${adminId} is deleting account ${account.id} (${account.email})`)

      // Call the admin service function
      await deleteUserAccount(account.id, account.email)

      setShowMenu(false)
      setShowDeleteConfirm(false)
      setShowDeleteSuccess(true)
      if (onAccountUpdate) onAccountUpdate()
    } catch (err) {
      console.error("Error deleting account:", err)
      const errorMsg = err instanceof Error ? err.message : "Failed to delete account. Please ensure you have added SUPABASE_SERVICE_ROLE_KEY to your .env file."
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-medium text-gray-900">{account.name}</h3>
          {showStatus && (
            <span
              className={`inline-block px-2 py-0.5 text-xs font-medium rounded mt-1 ${
                accountStatus === "Active" ? "bg-green-100 text-green-700" : accountStatus === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
              }`}
            >
              {accountStatus === "Active" ? "Active" : accountStatus === "Pending" ? "Pending" : "Deactivated"}
            </span>
          )}
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
            disabled={isLoading}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
              {error && (
                <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">
                  {error}
                </div>
              )}
              <button
                onClick={() => setShowStatusConfirm(true)}
                disabled={isLoading || accountStatus === "Pending"}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={accountStatus === "Pending" ? "Cannot modify pending accounts until email is confirmed" : ""}
              >
                {accountStatus === "Active" ? (
                  <>
                    <ShieldOff className="w-4 h-4" />
                    Deactivate Account
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Reactivate Account
                  </>
                )}
              </button>
              <div className="border-t border-gray-100"></div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading || !isAdminUser}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={!isAdminUser ? "Only admins can delete accounts" : ""}
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{account.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>{account.phone}</span>
        </div>
        {/* Only show properties count for agents */}
        {isAgent && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Properties:</span> {account.properties}
          </div>
        )}
      </div>

      <button 
        onClick={() => setShowModal(true)}
        className="w-full py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
      >
        See more
      </button>

      {/* Detail Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false)
            }
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-[#49769F] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                {showStatus && (
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full mt-2 ${
                      accountStatus === "Active" ? "bg-green-100 text-green-700" : accountStatus === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {accountStatus === "Active" ? "Active" : accountStatus === "Pending" ? "Pending" : "Deactivated"}
                  </span>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="w-5 h-5 text-[#49769F] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Email</p>
                      <p className="text-sm text-gray-900 break-all">{account.email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Phone className="w-5 h-5 text-[#49769F] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Phone</p>
                      <p className="text-sm text-gray-900">{account.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Listed Properties - Only show for agents */}
                {isAgent && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-[#49769F] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Listed Properties</p>
                        <p className="text-sm text-gray-900 font-semibold">{account.properties} properties</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 space-y-3">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 px-4 bg-[#49769F] text-white font-medium rounded-lg hover:bg-[#49769F]/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Modal */}
      {showStatusConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) {
              setShowStatusConfirm(false)
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
                {accountStatus === "Active" ? (
                  <ShieldOff className="w-6 h-6 text-yellow-600" />
                ) : (
                  <Shield className="w-6 h-6 text-[#49769F]" />
                )}
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {accountStatus === "Active" ? "Deactivate Account" : "Reactivate Account"}
                </h3>
                <p className="text-sm text-gray-600">
                  {accountStatus === "Active" ? (
                    <>
                      Are you sure you want to deactivate <span className="font-medium">{account.name}</span>'s account? They will not be able to log in.
                    </>
                  ) : (
                    <>
                      Are you sure you want to reactivate <span className="font-medium">{account.name}</span>'s account? They will be able to log in again.
                    </>
                  )}
                </p>
              </div>

              {error && (
                <div className="px-3 py-2 text-xs text-red-600 bg-red-50 rounded border border-red-200">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowStatusConfirm(false)}
                disabled={isLoading}
                className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={isLoading}
                className={`flex-1 py-2 px-4 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  accountStatus === "Active"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-[#49769F] hover:bg-[#49769F]/90"
                }`}
              >
                {isLoading
                  ? accountStatus === "Active"
                    ? "Deactivating..."
                    : "Reactivating..."
                  : accountStatus === "Active"
                  ? "Deactivate"
                  : "Reactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) {
              setShowDeleteConfirm(false)
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete <span className="font-medium">{account.name}</span>'s account? This action cannot be undone.
                </p>
              </div>

              {error && (
                <div className="px-3 py-2 text-xs text-red-600 bg-red-50 rounded border border-red-200">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="flex-1 py-2 px-4 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteSuccess && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteSuccess(false)
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Account Deleted</h2>
              <p className="text-sm text-gray-600">
                {account.name}'s account has been successfully deleted. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteSuccess(false)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
