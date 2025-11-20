"use client"

import { useState, useEffect } from "react"
import { Search, CheckCircle, XCircle, Eye, MapPin, Home, DollarSign, Calendar, Trash2 } from "lucide-react"
import supabase from "@/supabaseClient"

interface Listing {
  id: string
  property_title: string
  property_type: string
  listing_type: string
  street_address: string
  city: string
  state: string
  price: number
  bedrooms: number
  bathrooms: number
  square_feet: number | null
  user_id: string
  full_name: string
  email: string
  submitted_at: string
  approval_status: "pending" | "approved" | "rejected"
  media?: Array<{ public_url: string }>
  description?: string
  phone_number?: string
  rejection_reason?: string
}

export function PendingListingsTable() {
  const [listings, setListings] = useState<Listing[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("Pending")
  const [loading, setLoading] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteSource, setDeleteSource] = useState<"listing_approvals" | "listed_properties" | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [approveConfirmId, setApproveConfirmId] = useState<string | null>(null)
  const [rejectConfirmId, setRejectRejectId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null) // New state for success messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // New state for error messages

  const itemsPerPage = 5
  
  // Fetch listings from Supabase
  useEffect(() => {
    fetchListings()
  }, [])
  
  const fetchListings = async () => {
    try {
      setLoading(true)
      setListings([]) // Clear listings first
      
      // Fetch pending and rejected from listing_approvals
      const { data: approvalsData, error: approvalsError } = await supabase
        .from('listing_approvals')
        .select('*')
        .in('approval_status', ['pending', 'rejected'])
        .order('submitted_at', { ascending: false })
      
      if (approvalsError) throw approvalsError
      
      // Fetch approved listings from listed_properties
      const { data: listedData, error: listedError } = await supabase
        .from('listed_properties')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (listedError) throw listedError
      
      // Combine both arrays, with approval_status set to 'approved' for listed_properties
      const combinedListings = [
        ...(approvalsData || []),
        ...(listedData || []).map(item => ({
          ...item,
          approval_status: 'approved' as const,
          submitted_at: item.created_at
        }))
      ]
      
      setListings(combinedListings)
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const filteredListings = listings.filter(listing => {
    const matchesSearch = 
      listing.street_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.property_type.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = 
      filter === "All" ||
      (filter === "Pending" && listing.approval_status === "pending") ||
      (filter === "Approved" && listing.approval_status === "approved") ||
      (filter === "Rejected" && listing.approval_status === "rejected")
    
    return matchesSearch && matchesFilter
  })

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedListings = filteredListings.slice(startIndex, startIndex + itemsPerPage)

  const handleApprove = async (id: string) => {
    try {
      // Call the approve_listing function
      const { data, error } = await supabase
        .rpc('approve_listing', { approval_record_id: parseInt(id) })
      
      if (error) {
        console.error('Database error:', error)
        throw error
      }
      
      // Refetch listings to get updated data from database
      await fetchListings()
      setSelectedListing(null)
      setApproveConfirmId(null) // Close confirmation modal
      
      // Show success message
      setSuccessMessage('Listing approved and moved to listed properties!')
      setTimeout(() => setSuccessMessage(null), 3000) // Clear message after 3 seconds
    } catch (error: any) {
      console.error('Error approving listing:', error)
      setErrorMessage(`Failed to approve listing: ${error.message || 'Unknown error'}`)
      setTimeout(() => setErrorMessage(null), 5000) // Clear message after 5 seconds
    }
  }

  const handleReject = async (id: string) => {
    try {
      // Call the reject_listing function
      const { data, error } = await supabase
        .rpc('reject_listing', { 
          approval_record_id: parseInt(id),
          reason: rejectionReason || null
        })
      
      if (error) {
        console.error('Database error:', error)
        throw error
      }
      
      // Refetch listings to get updated data from database
      await fetchListings()
      setSelectedListing(null)
      setRejectRejectId(null) // Close confirmation modal
      setRejectionReason("") // Clear rejection reason
      
      // Show success message
      setSuccessMessage('Listing rejected successfully!')
      setTimeout(() => setSuccessMessage(null), 3000) // Clear message after 3 seconds
    } catch (error: any) {
      console.error('Error rejecting listing:', error)
      setErrorMessage(`Failed to reject listing: ${error.message || 'Unknown error'}`)
      setTimeout(() => setErrorMessage(null), 5000) // Clear message after 5 seconds
    }
  }
  
  const handleDelete = async (id: string) => {
    try {
      setDeleteError(null)
      if (!deleteSource) {
        setDeleteError('Error: Could not determine which table to delete from')
        return
      }
      
      // Get current user and their role
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Failed to get user:', userError)
        setDeleteError('Authentication error: Could not verify your permissions')
        return
      }
      
      const userRole = user.user_metadata?.role
      
      if (userRole !== 'admin') {
        setDeleteError(`Permission denied: You are not an admin (your role: ${userRole || 'none'})`)
        return
      }
      
      // Convert string ID to number for database query
      const numericId = parseInt(id)
      
      console.log('Deleting from:', deleteSource, 'ID:', id)
      
      // First, verify the record exists
      const { data: existingData } = await supabase
        .from(deleteSource)
        .select('id')
        .eq('id', numericId)
        .limit(1)
      
      if (!existingData || existingData.length === 0) {
        console.warn('Record does not exist with ID:', numericId)
        setDeleteError('Record not found. It may have already been deleted.')
        return
      }
      
      let deleteResult = await supabase
        .from(deleteSource)
        .delete()
        .eq('id', numericId)
        .select()
      
      // If first attempt returns 0 rows, try with string ID
      if (!deleteResult.data || deleteResult.data.length === 0) {
        deleteResult = await supabase
          .from(deleteSource)
          .delete()
          .eq('id', id)
          .select()
      }
      
      const { data, error } = deleteResult
      
      if (error) {
        console.error('Supabase delete error:', error)
        setDeleteError(`Failed to delete: ${error.message}`)
        throw error
      }
      
      if (!data || data.length === 0) {
        setDeleteError('Delete failed: RLS policy may be blocking this operation or record not found')
        return
      }
      console.log('Delete successful, rows affected:', data.length)
      
      // Close modal immediately
      setDeleteConfirmId(null)
      setDeleteSource(null)
      setSelectedListing(null)
      
      // Remove the deleted item from local state immediately using numeric ID
      setListings(prev => prev.filter(listing => parseInt(listing.id) !== numericId))
      
      // Wait a moment for database to process, then refetch to ensure sync
      setTimeout(async () => {
        await fetchListings()
      }, 500)
    } catch (error: any) {
      console.error('Error deleting listing:', error)
      setDeleteError(`Failed to delete listing: ${error.message || 'Unknown error'}`)
    }
  }

  const pendingCount = listings.filter(l => l.approval_status === "pending").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Listing Approvals</h1>
          <p className="text-gray-600">Review and approve real estate listings submitted by agents</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Controls Bar */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-white">
                  Pending Listings ({pendingCount})
                </h2>
                
                {/* Filter Tabs */}
                <div className="flex gap-2">
                  {(["All", "Pending", "Approved", "Rejected"] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilter(status)
                        setCurrentPage(1)
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filter === status
                          ? "bg-white text-blue-600"
                          : "bg-blue-400/30 text-white hover:bg-blue-400/50"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by address, agent, or property type..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Property</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Details</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Agent</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Submitted</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedListings.map((listing) => {
                  const imageUrl = listing.media && listing.media.length > 0 && listing.media[0].public_url
                    ? listing.media[0].public_url
                    : null
                  
                  return (
                  <tr key={listing.id} className="hover:bg-sky-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={listing.property_title}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Home className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-800">{listing.property_type}</div>
                          <div className="text-sm text-gray-600 mt-0.5">{listing.property_title}</div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <MapPin className="w-3 h-3" />
                            {listing.street_address}, {listing.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1 text-gray-700 font-semibold">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          ₱{listing.price.toLocaleString()}
                        </div>
                        <div className="text-gray-600">
                          {listing.bedrooms} bed • {listing.bathrooms} bath{listing.square_feet ? ` • ${listing.square_feet.toLocaleString()} sqft` : ''}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="font-medium text-gray-800">{listing.full_name}</div>
                        <div className="text-gray-500">{listing.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(listing.submitted_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        listing.approval_status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        listing.approval_status === "approved" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {listing.approval_status === "pending" ? "Pending" :
                         listing.approval_status === "approved" ? "Approved" : "Rejected"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedListing(listing)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {listing.approval_status === "pending" && (
                          <>
                            <button
                              onClick={() => setApproveConfirmId(listing.id)} // Open confirmation modal instead of direct approve
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setRejectRejectId(listing.id)} // Open confirmation modal instead of direct reject
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {listing.approval_status === "rejected" && (
                          <button
                            onClick={() => {
                              setDeleteConfirmId(listing.id)
                              setDeleteSource('listing_approvals')
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {listing.approval_status === "approved" && (
                          <button
                            onClick={() => {
                              setDeleteConfirmId(listing.id)
                              setDeleteSource('listed_properties')
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
            )}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Home className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No listings found matching your criteria</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredListings.length)} of {filteredListings.length} listings
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedListing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedListing(null)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white">
                <h3 className="text-2xl font-bold">Listing Details</h3>
              </div>
              
              <div className="p-6 space-y-6">
                {selectedListing.media && selectedListing.media.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedListing.media.map((img, idx) => (
                      <img 
                        key={idx}
                        src={img.public_url} 
                        alt={`Property ${idx + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Property Title</label>
                    <p className="text-gray-900">{selectedListing.property_title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Property Type</label>
                    <p className="text-gray-900">{selectedListing.property_type}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Listing Type</label>
                    <p className="text-gray-900 capitalize">{selectedListing.listing_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Price</label>
                    <p className="text-gray-900 font-bold text-lg text-green-600">₱{selectedListing.price.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Address</label>
                  <p className="text-gray-900">{selectedListing.street_address}, {selectedListing.city}{selectedListing.state ? `, ${selectedListing.state}` : ''}</p>
                </div>
                
                {selectedListing.description && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
                    <p className="text-gray-900 text-sm">{selectedListing.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-sky-50 p-4 rounded-lg">
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Bedrooms</label>
                    <p className="text-2xl font-bold text-sky-600">{selectedListing.bedrooms}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Bathrooms</label>
                    <p className="text-2xl font-bold text-blue-600">{selectedListing.bathrooms}</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Square Feet</label>
                    <p className="text-2xl font-bold text-indigo-600">{selectedListing.square_feet?.toLocaleString() || 'N/A'}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Agent Information</label>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p className="text-gray-900"><span className="font-semibold">Name:</span> {selectedListing.full_name}</p>
                    <p className="text-gray-900"><span className="font-semibold">Email:</span> {selectedListing.email}</p>
                    {selectedListing.phone_number && (
                      <p className="text-gray-900"><span className="font-semibold">Phone:</span> {selectedListing.phone_number}</p>
                    )}
                    <p className="text-gray-900"><span className="font-semibold">Submitted:</span> {new Date(selectedListing.submitted_at).toLocaleDateString()}</p>
                    {selectedListing.rejection_reason && (
                      <p className="text-red-600 mt-2"><span className="font-semibold">Rejection Reason:</span> {selectedListing.rejection_reason}</p>
                    )}
                  </div>
                </div>

                {selectedListing.approval_status === "pending" && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setApproveConfirmId(selectedListing.id)} // Open confirmation modal instead of direct approve
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Listing
                    </button>
                    <button
                      onClick={() => setRejectRejectId(selectedListing.id)} // Open confirmation modal instead of direct reject
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Listing
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => {
            setDeleteConfirmId(null)
            setDeleteSource(null)
          }}>
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center gap-3 text-red-600 mb-4">
                  <Trash2 className="w-6 h-6" />
                  <h3 className="text-xl font-bold text-gray-900">Delete Listing</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to permanently delete this {deleteSource === 'listed_properties' ? 'approved' : 'rejected'} listing? This action cannot be undone.
                </p>
                {deleteError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-800 text-sm">{deleteError}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setDeleteConfirmId(null)
                      setDeleteSource(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirmId)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approve Confirmation Modal */}
        {approveConfirmId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setApproveConfirmId(null)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center gap-3 text-green-600 mb-4">
                  <CheckCircle className="w-6 h-6" />
                  <h3 className="text-xl font-bold text-gray-900">Approve Listing</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to approve this listing? This will make it publicly visible on the platform.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setApproveConfirmId(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApprove(approveConfirmId)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Confirmation Modal */}
        {rejectConfirmId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => {
            setRejectRejectId(null)
            setRejectionReason("")
          }}>
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center gap-3 text-red-600 mb-4">
                  <XCircle className="w-6 h-6" />
                  <h3 className="text-xl font-bold text-gray-900">Reject Listing</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Please provide a reason for rejecting this listing (optional):
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#49769F] focus:border-transparent mb-4"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setRejectRejectId(null)
                      setRejectionReason("")
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(rejectConfirmId)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message Toast */}
        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Error Message Toast */}
        {errorMessage && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}