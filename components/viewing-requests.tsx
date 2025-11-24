"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PropertyTitle } from "@/components/property-title"
import {
  Calendar,
  Clock,
  Eye,
  MessageSquare,
  TrendingUp,
  Check,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  User,
  Home,
  PoundSterling,
  Search
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface ViewingRequest {
  id: string
  viewing_date: string
  viewing_time: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  special_requests?: string
  rejection_reason?: string
  created_at: string
  user_id: string
  property_id: string
  property?: {
    id: string
    property_type: string
    address: string
    city: string
    postcode?: string
    monthly_rent: number
    photos: string[]
  }
  user_profile?: {
    full_name: string
    email: string
    phone: string
  }
  landlord_profile?: {
    full_name: string
    email: string
    phone: string
  }
}

interface ViewingStats {
  pending: number
  approved: number
  rejected: number
  cancelled: number
  completed: number
}

interface ViewingRequestsProps {
  variant?: 'dashboard' | 'full' | 'admin'
  limit?: number
  onTabChange?: (tab: string) => void
  isAdmin?: boolean
}

export function ViewingRequests({ variant = 'dashboard', limit, onTabChange, isAdmin = false }: ViewingRequestsProps) {
  const [viewings, setViewings] = useState<ViewingRequest[]>([])
  const [stats, setStats] = useState<ViewingStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>(
    variant === 'dashboard' ? 'pending,approved,rejected,cancelled' :
    'all'
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedViewing, setSelectedViewing] = useState<ViewingRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [cancelError, setCancelError] = useState('')

  const fetchViewings = async () => {
    try {
      setLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.error('No access token available')
        return
      }

      // Determine which API endpoint to use
      const apiEndpoint = (variant === 'admin' || isAdmin)
        ? '/api/admin/viewings'
        : '/api/viewings/for-my-properties'

      // For dashboard variant with pending,approved,rejected,cancelled filter, fetch all and filter client-side
      if (variant === 'dashboard' && filter === 'pending,approved,rejected,cancelled') {
        const queryParams = new URLSearchParams({
          status: 'all',
          limit: limit ? limit.toString() : '50'
        })

        const response = await fetch(`${apiEndpoint}?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        const result = await response.json()

        if (result.success) {
          // Filter to only show pending, approved, rejected, and cancelled
          const filteredViewings = (result.viewings || []).filter(
            (v: ViewingRequest) => v.status === 'pending' || v.status === 'approved' || v.status === 'rejected' || v.status === 'cancelled'
          )
          setViewings(filteredViewings)
          setStats(result.summary || stats)
        } else {
          console.error('Error fetching viewing requests:', result.error)
        }
      } else {
        const queryParams = new URLSearchParams({
          status: filter,
          limit: limit ? limit.toString() : (variant === 'admin' ? '100' : '20')
        })

        const response = await fetch(`${apiEndpoint}?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        const result = await response.json()

        if (result.success) {
          setViewings(result.viewings || [])
          setStats(result.summary || stats)
        } else {
          console.error('Error fetching viewing requests:', result.error)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchViewings()
  }, [filter, limit])

  const handleApprove = async (viewing: ViewingRequest) => {
    setSelectedViewing(viewing)
    setApproveModalOpen(true)
  }

  const handleReject = async (viewing: ViewingRequest) => {
    setSelectedViewing(viewing)
    setRejectModalOpen(true)
  }

  const confirmApprove = async () => {
    if (!selectedViewing) return

    try {
      setActionLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.error('No access token available')
        return
      }

      const response = await fetch(`/api/viewings/${selectedViewing.id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        setApproveModalOpen(false)
        setSelectedViewing(null)
        fetchViewings() // Refresh the list
      } else {
        console.error('Error approving viewing:', result.error)
        alert('Error approving viewing: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error approving viewing')
    } finally {
      setActionLoading(false)
    }
  }

  const confirmReject = async () => {
    if (!selectedViewing) return

    try {
      setActionLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.error('No access token available')
        return
      }

      const response = await fetch(`/api/viewings/${selectedViewing.id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rejectionReason: rejectionReason.trim() || undefined
        })
      })

      const result = await response.json()

      if (result.success) {
        setRejectModalOpen(false)
        setSelectedViewing(null)
        setRejectionReason('')
        fetchViewings() // Refresh the list
      } else {
        console.error('Error rejecting viewing:', result.error)
        alert('Error rejecting viewing: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error rejecting viewing')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async (viewing: ViewingRequest) => {
    setSelectedViewing(viewing)
    setCancelError('')
    setCancelModalOpen(true)
  }

  const handleDelete = async (viewing: ViewingRequest) => {
    setSelectedViewing(viewing)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedViewing) return

    try {
      setActionLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.error('No access token available')
        return
      }

      const response = await fetch(`/api/viewings/${selectedViewing.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        setDeleteModalOpen(false)
        setSelectedViewing(null)
        fetchViewings() // Refresh the list
      } else {
        console.error('Error deleting viewing:', result.error)
        alert('Error deleting viewing: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting viewing')
    } finally {
      setActionLoading(false)
    }
  }

  const confirmCancel = async () => {
    if (!selectedViewing) return

    try {
      setActionLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.error('No access token available')
        return
      }

      const response = await fetch(`/api/viewings/${selectedViewing.id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        setCancelModalOpen(false)
        setSelectedViewing(null)
        setCancelError('')
        fetchViewings() // Refresh the list
      } else {
        setCancelError(result.error || 'Failed to cancel viewing request')
      }
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : 'Error cancelling viewing request')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-orange-100 text-orange-800"
      case "rejected":
        return "bg-destructive/10 text-destructive"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB')
  }

  const formatTime = (timeStr: string) => {
    // Parse time and convert to 12-hour format with am/pm
    const [hours, minutes] = timeStr.split(':').map(Number)
    const period = hours >= 12 ? 'pm' : 'am'
    const displayHours = hours % 12 || 12
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount / 100)
  }

  const isViewingPast = (viewing: ViewingRequest) => {
    const viewingDateTime = new Date(`${viewing.viewing_date}T${viewing.viewing_time}`)
    return viewingDateTime < new Date()
  }

  // Filter out only past pending viewings (keep approved/rejected viewings visible)
  // For full variant, show all viewings including past pending ones
  const upcomingViewings = viewings.filter(viewing => {
    // For full variant, show all viewings
    if (variant === 'full' || variant === 'admin') {
      return true
    }
    // Always show approved, rejected, or cancelled viewings
    if (viewing.status !== 'pending') {
      return true
    }
    // For pending viewings, only show if not past
    return !isViewingPast(viewing)
  })

  // Apply search filter for admin variant
  const filteredViewings = variant === 'admin' && searchQuery ? upcomingViewings.filter(viewing => {
    const searchLower = searchQuery.toLowerCase()
    return (
      viewing.property?.address?.toLowerCase().includes(searchLower) ||
      viewing.property?.city?.toLowerCase().includes(searchLower) ||
      viewing.property?.postcode?.toLowerCase().includes(searchLower) ||
      viewing.user_profile?.full_name?.toLowerCase().includes(searchLower) ||
      viewing.landlord_profile?.full_name?.toLowerCase().includes(searchLower)
    )
  }) : upcomingViewings

  // Stats cards - disabled
  const renderStatsCards = () => {
    return null
  }

  const cardContent = (
    <>
      {variant === 'full' && renderStatsCards()}

      <div className={variant === 'admin' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start' : 'space-y-3'}>
        {loading ? (
          <>
            {[...Array(variant === 'dashboard' ? 3 : 6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                {/* Header skeleton */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                {/* Date/Time row skeleton */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </>
        ) : filteredViewings.length > 0 ? (
          filteredViewings.map((viewing) => (
            <div key={viewing.id} className="border rounded-lg p-4 space-y-3">
              {/* Main viewing info */}
              <div
                className="cursor-pointer"
                onClick={() => setExpandedCard(expandedCard === viewing.id ? null : viewing.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-[15px] mb-2 line-clamp-1">
                      {viewing.property?.address && viewing.property?.city
                        ? `${viewing.property.address}, ${viewing.property.city}`
                        : `${viewing.property?.property_type} in ${viewing.property?.city}`
                      }
                    </p>

                    <Badge className={`${getStatusColor(viewing.status)} capitalize`}>
                      {viewing.status === 'pending' ? 'awaiting approval' :
                       viewing.status === 'approved' ? 'Approved' :
                       viewing.status === 'rejected' ? 'Rejected' :
                       viewing.status === 'cancelled' ? 'Cancelled' :
                       viewing.status}
                    </Badge>
                  </div>

                  {viewing.status === 'pending' && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="icon"
                        onClick={() => handleApprove(viewing)}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground h-8 w-8"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleReject(viewing)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col md:flex-row gap-1 md:gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(viewing.viewing_date)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatTime(viewing.viewing_time)}
                    </div>
                  </div>

                  <button
                    className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedCard(expandedCard === viewing.id ? null : viewing.id)
                    }}
                  >
                    {expandedCard === viewing.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {expandedCard === viewing.id && (
                <div className="border-t pt-4 space-y-4">
                  {variant === 'dashboard' && !isAdmin ? (
                    /* Dashboard variant - compact view with investor name and message preview */
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium">{viewing.user_profile?.full_name || 'N/A'}</span>
                      </div>
                      {viewing.special_requests && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded line-clamp-2">
                          {viewing.special_requests}
                        </div>
                      )}
                    </div>
                  ) : (variant === 'admin' || isAdmin) ? (
                    /* Admin variant - show both landlord and investor details */
                    <div className="grid grid-cols-2 gap-4">
                      {/* Landlord Details */}
                      <div className="space-y-2 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm">Landlord Details</h4>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-start">
                            <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="break-words">{viewing.landlord_profile?.full_name || 'N/A'}</span>
                          </div>
                          <div className="flex items-start">
                            <Mail className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="break-all">{viewing.landlord_profile?.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-start">
                            <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span>{viewing.landlord_profile?.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Investor Details */}
                      <div className="space-y-2 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm">Investor Details</h4>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-start">
                            <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="break-words">{viewing.user_profile?.full_name || 'N/A'}</span>
                          </div>
                          <div className="flex items-start">
                            <Mail className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="break-all">{viewing.user_profile?.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-start">
                            <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span>{viewing.user_profile?.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Full variant - complete investor and property details */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Investor Details */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Investor Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{viewing.user_profile?.full_name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{viewing.user_profile?.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{viewing.user_profile?.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Property Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Home className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{viewing.property?.address}</span>
                          </div>
                          <div className="flex items-center">
                            <PoundSterling className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{viewing.property?.monthly_rent ? formatCurrency(viewing.property.monthly_rent) : 'N/A'} per month</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Special Requests - only show in full variant */}
                  {variant !== 'dashboard' && viewing.special_requests && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Special Requests</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {viewing.special_requests}
                      </p>
                    </div>
                  )}

                  {/* Rejection Reason - only show in full variant */}
                  {variant !== 'dashboard' && viewing.status === 'rejected' && viewing.rejection_reason && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Rejection Reason</h4>
                      <p className="text-sm text-gray-600 bg-destructive/5 p-3 rounded">
                        {viewing.rejection_reason}
                      </p>
                    </div>
                  )}

                  {/* Actions for pending viewings - change and cancel */}
                  {viewing.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-1" />
                        Change Viewing
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCancel(viewing)
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel Viewing
                      </Button>
                    </div>
                  )}

                  {/* Actions for approved viewings - change and cancel */}
                  {viewing.status === 'approved' && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-1" />
                        Change Viewing
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCancel(viewing)
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel Viewing
                      </Button>
                    </div>
                  )}

                  {/* Delete button for rejected and cancelled viewings */}
                  {(viewing.status === 'rejected' || viewing.status === 'cancelled') && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(viewing)
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Delete Viewing
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground min-h-[280px] flex flex-col items-center justify-center col-span-full">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-base font-medium mb-1.5">{upcomingViewings.length === 0 ? "No Viewing Requests" : "No Matching Viewings"}</p>
            <p className="text-sm max-w-[200px] mx-auto">{upcomingViewings.length === 0 ? "No viewing requests available at the moment" : "Try adjusting your search or filters"}</p>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Viewing Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to approve the viewing request for{" "}
              <strong>{selectedViewing?.property?.property_type} in {selectedViewing?.property?.city}</strong>{" "}
              on {selectedViewing && formatDate(selectedViewing.viewing_date)} at {selectedViewing?.viewing_time}?
            </p>
            <p className="text-sm text-gray-600">
              The investor will be notified and the viewing will be confirmed.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setApproveModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmApprove}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading ? 'Approving...' : 'Approve Viewing'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Viewing Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to reject the viewing request for{" "}
              <strong>{selectedViewing?.property?.property_type} in {selectedViewing?.property?.city}</strong>{" "}
              on {selectedViewing && formatDate(selectedViewing.viewing_date)} at {selectedViewing?.viewing_time}?
            </p>
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Reason for rejection (optional)</Label>
              <Textarea
                id="rejection-reason"
                placeholder="e.g., Property no longer available, date conflicts, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmReject}
                disabled={actionLoading}
                variant="destructive"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Viewing'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Viewing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to cancel the viewing for{" "}
              <strong>{selectedViewing?.property?.property_type} in {selectedViewing?.property?.city}</strong>{" "}
              on {selectedViewing && formatDate(selectedViewing.viewing_date)} at {selectedViewing && formatTime(selectedViewing.viewing_time)}?
            </p>
            <p className="text-sm text-gray-600">
              The investor will be notified that this viewing has been cancelled.
            </p>
            {cancelError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{cancelError}</p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
                Keep Viewing
              </Button>
              <Button
                onClick={confirmCancel}
                disabled={actionLoading}
                variant="destructive"
              >
                {actionLoading ? 'Cancelling...' : 'Cancel Viewing'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Viewing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to permanently delete the viewing for{" "}
              <strong>{selectedViewing?.property?.property_type} in {selectedViewing?.property?.city}</strong>{" "}
              on {selectedViewing && formatDate(selectedViewing.viewing_date)} at {selectedViewing && formatTime(selectedViewing.viewing_time)}?
            </p>
            <p className="text-sm text-gray-600">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                Keep Viewing
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={actionLoading}
                variant="destructive"
              >
                {actionLoading ? 'Deleting...' : 'Delete Viewing'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )

  if (variant === 'dashboard') {
    return (
      <Card className="max-h-[600px] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Viewing Requests</CardTitle>
          {onTabChange ? (
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              onClick={() => onTabChange('viewings')}
            >
              View All
            </Button>
          ) : (
            <Link href="/landlord/viewings">
              <Button variant="outline" size="sm" className="bg-transparent">
                View All
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1">
          {cardContent}
        </CardContent>
      </Card>
    )
  }

  // For admin variant, show search/filter bar
  if (variant === 'admin') {
    return (
      <>
        {/* Search and Filter Bar */}
        <Card className="mb-6 bg-white shadow-sm">
          <CardContent className="px-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by property, landlord, or investor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 h-9 sm:h-10 bg-gray-50/30 border-gray-200 focus:bg-white focus:border-primary focus:ring-primary"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-[220px] h-9 sm:h-10 sm:min-h-10 bg-gray-50/30 border-gray-200 focus:bg-white focus:border-primary focus:ring-primary py-2 px-3">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Viewings</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {cardContent}
      </>
    )
  }

  return (
    <div className="space-y-6">
      {cardContent}
    </div>
  )
}