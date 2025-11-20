"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Plus, Search, CheckCircle, X } from "lucide-react"
import { AccountCard } from "./user-card"
import supabase from "@/supabaseClient"
import LoadingAnimation from "@/components/ui/loadingui"

type AccountType = "agent" | "user"

interface Account {
  id: string
  name: string
  email: string
  phone: string
  properties: number
  status?: "Active" | "Inactive" | "Pending"
  email_confirmed_at?: string | null
}

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<AccountType>("agent")
  const [searchQuery, setSearchQuery] = useState("")
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddAgentModal, setShowAddAgentModal] = useState(false)
  const [agentForm, setAgentForm] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    password: ""
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Fetch accounts from database
  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setHasError(false)

      // Call database function to get all users from Supabase auth
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_all_users', { user_role: activeTab === "agent" ? "agent" : "user" })

      if (usersError) {
        // If function doesn't exist, show helpful error
        if (usersError.message?.includes('function') || usersError.code === '42883') {
          setAccounts([])
          setLoading(false)
          setError(
            "Database function 'get_all_users' is required. Please create it in your Supabase database. " +
            "See the SQL migration file for the function definition."
          )
          return
        }
        throw usersError
      }

      // Format the user data from auth.users
      if (usersData && Array.isArray(usersData)) {
        const formattedAccounts: Account[] = usersData.map((user: any) => {
          // Determine status: Pending if email not confirmed, otherwise Active/Inactive
          let status: "Active" | "Inactive" | "Pending" = "Active"
          if (!user.email_confirmed_at) {
            status = "Pending"
          } else if (user.status === "Inactive") {
            status = "Inactive"
          }
          
          return {
            id: user.id || user.user_id,
            name: `${user.first_name || ""}${user.last_name ? " " + user.last_name : ""}`.trim() || user.email?.split("@")[0] || "Unknown User",
            email: user.email || "",
            phone: user.mobile_number || user.phone || "Not provided",
            properties: user.properties_count || 0,
            status: status,
            email_confirmed_at: user.email_confirmed_at
          }
        })
        
        setAccounts(formattedAccounts)
        setLoading(false)
        return
      }

      // No data returned (empty array is valid - means no users found)
      setAccounts([])
      setLoading(false)

    } catch (err: any) {
      console.error("Error fetching accounts:", err)
      setError(err.message || "Failed to fetch accounts")
      setLoading(false)
      setHasError(true)
    }
  }, [activeTab])

  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      try {
        await fetchAccounts()
      } catch (err) {
        console.error("Error in useEffect:", err)
        if (isMounted) {
          setHasError(true)
          setLoading(false)
          setError("An unexpected error occurred while loading accounts")
        }
      }
    }
    
    loadData()
    
    return () => {
      isMounted = false
    }
  }, [fetchAccounts])

  // Handle form submission
  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFormError(null)
    setIsSubmitting(true)

    try {
      // Validate form
      if (!agentForm.firstName || !agentForm.lastName || !agentForm.email || !agentForm.password) {
        setFormError("Please fill in all required fields")
        setIsSubmitting(false)
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(agentForm.email)) {
        setFormError("Please enter a valid email address")
        setIsSubmitting(false)
        return
      }

      // Password validation (minimum 6 characters)
      if (agentForm.password.length < 6) {
        setFormError("Password must be at least 6 characters long")
        setIsSubmitting(false)
        return
      }

      // Call Supabase to create new agent account with role "agent"
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: agentForm.email,
        password: agentForm.password,
        options: {
          data: {
            // Store in both formats for compatibility
            first_name: agentForm.firstName,
            firstName: agentForm.firstName,
            last_name: agentForm.lastName,
            lastName: agentForm.lastName,
            mobile_number: agentForm.mobileNumber,
            mobileNumber: agentForm.mobileNumber,
            phone: agentForm.mobileNumber,
            // Role is explicitly set to "agent" for agent accounts
            role: "agent"
          },
          // Disable email confirmation for admin-created accounts (optional)
          emailRedirectTo: undefined
        }
      })

      if (signUpError) {
        console.error("Supabase signup error:", signUpError)
        throw signUpError
      }

      // Verify the user was created successfully
      if (!data.user) {
        throw new Error("User account was not created successfully")
      }

      console.log("Agent created successfully:", {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role
      })

      // Store email before resetting form
      const createdEmail = agentForm.email
      
      // Reset form and close modal first
      setAgentForm({
        firstName: "",
        lastName: "",
        mobileNumber: "",
        email: "",
        password: ""
      })
      setFormError(null)
      setShowAddAgentModal(false)

      // Show success modal instead of alert
      setSuccessMessage(`Agent account created successfully!\nEmail: ${createdEmail}\nRole: agent`)
      setShowSuccessModal(true)

      // Refresh accounts list to show the new agent
      // Wait a moment for the database to update, then refetch
      setTimeout(() => {
        fetchAccounts().catch((err) => {
          console.error("Error refetching accounts:", err)
          setError("Failed to refresh accounts list. Please refresh the page manually.")
        })
      }, 1500)
    } catch (err: any) {
      console.error("Error creating agent:", err)
      setFormError(err.message || "Failed to create agent account")
      // Keep modal open on error so user can try again
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter accounts based on search query
  const filteredAccounts = accounts.filter((account) => {
    const query = searchQuery.toLowerCase()
    return (
      account.name.toLowerCase().includes(query) ||
      account.email.toLowerCase().includes(query) ||
      account.phone.toLowerCase().includes(query)
    )
  })

  // Show error screen if critical error occurred
  if (hasError && !loading && error) {
    return (
      <AdminLayout>
        <div className="overflow-auto">
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Page</h2>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => {
                  setHasError(false)
                  setError(null)
                  setLoading(true)
                  fetchAccounts()
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("agent")}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === "agent" ? "bg-[#4A90E2] text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Agent Account
              </button>
              <button
                onClick={() => setActiveTab("user")}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === "user" ? "bg-[#4A90E2] text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                User Account
              </button>
            </div>

            {activeTab === "agent" && (
              <button 
                onClick={() => setShowAddAgentModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Agent
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && <LoadingAnimation />}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <p className="text-yellow-800 text-sm font-medium mb-2">{error}</p>
              <div className="text-yellow-700 text-xs space-y-1">
                <p>To enable user management, please:</p>
                <ol className="list-decimal list-inside ml-2 space-y-1">
                  <li>Open your Supabase SQL Editor</li>
                  <li>Run the SQL from: <code className="bg-yellow-100 px-1 rounded">get_all_users.sql</code></li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          )}

          {/* Accounts Grid */}
          {!loading && !error && (
            <>
              {filteredAccounts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No {activeTab} accounts found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAccounts.map((account) => (
                    <AccountCard 
                      key={account.id} 
                      account={account} 
                      showStatus={true} 
                      isAgent={activeTab === "agent"}
                      onAccountUpdate={() => {
                        setTimeout(() => {
                          fetchAccounts()
                        }, 1000)
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSuccessModal(false)
            }
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
              <p className="text-gray-600 whitespace-pre-line">{successMessage}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Agent Modal */}
      {showAddAgentModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) {
              setShowAddAgentModal(false)
              setFormError(null)
              setAgentForm({
                firstName: "",
                lastName: "",
                mobileNumber: "",
                email: "",
                password: ""
              })
            }
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Agent</h2>
              
              <form onSubmit={handleAddAgent} className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={agentForm.firstName}
                    onChange={(e) => setAgentForm({ ...agentForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
                    placeholder="John"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={agentForm.lastName}
                    onChange={(e) => setAgentForm({ ...agentForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
                    placeholder="Doe"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={agentForm.email}
                    onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
                    placeholder="agent@example.com"
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={agentForm.mobileNumber}
                    onChange={(e) => setAgentForm({ ...agentForm, mobileNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
                    placeholder="+63 912 345 6789"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={agentForm.password}
                    onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
                    placeholder="Minimum 6 characters"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                {/* Error Message */}
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-800 text-sm">{formError}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAgentModal(false)
                      setFormError(null)
                      setAgentForm({
                        firstName: "",
                        lastName: "",
                        mobileNumber: "",
                        email: "",
                        password: ""
                      })
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#4A90E2] text-white rounded-md hover:bg-[#3A7BC8] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Agent"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}