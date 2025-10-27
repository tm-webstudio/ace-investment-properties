"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Calendar, 
  Clock, 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Phone,
  Mail,
  User,
  Home,
  DollarSign
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
    monthly_rent: number
    photos: string[]
  }
  user_profile?: {
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
  variant?: 'dashboard' | 'full'
  limit?: number
}

export function ViewingRequests({ variant = 'dashboard', limit }: ViewingRequestsProps) {
  const [viewings, setViewings] = useState<ViewingRequest[]>([])
  const [stats, setStats] = useState<ViewingStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('pending')
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedViewing, setSelectedViewing] = useState<ViewingRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchViewings = async () => {
    try {
      setLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.error('No access token available')
        return
      }

      const queryParams = new URLSearchParams({
        status: filter,
        limit: limit ? limit.toString() : '20'
      })

      const response = await fetch(`/api/viewings/for-my-properties?${queryParams}`, {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-orange-100 text-orange-800"
      case "rejected":
        return "bg-red-100 text-red-800"
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
    return timeStr
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount / 100)
  }

  // Stats cards for full variant
  const renderStatsCards = () => {
    if (variant !== 'full') return null

    const totalViewings = stats.pending + stats.approved + stats.rejected + stats.cancelled + stats.completed
    const responseRate = totalViewings > 0 ? Math.round(((stats.approved + stats.rejected) / totalViewings) * 100) : 0

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-orange-100 p-3">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved This Week</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Viewings</p>
                <p className="text-2xl font-bold text-gray-900">{totalViewings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">{responseRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filter buttons for full variant
  const renderFilterButtons = () => {
    if (variant !== 'full') return null

    const filters = [
      { key: 'pending', label: 'Pending', count: stats.pending },
      { key: 'approved', label: 'Approved', count: stats.approved },
      { key: 'rejected', label: 'Rejected', count: stats.rejected },
      { key: 'all', label: 'All', count: stats.pending + stats.approved + stats.rejected + stats.cancelled + stats.completed }
    ]

    return (
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((filterOption) => (
          <Button
            key={filterOption.key}
            variant={filter === filterOption.key ? "default" : "outline"}
            onClick={() => setFilter(filterOption.key)}
            className="h-9"
          >
            <Filter className="h-4 w-4 mr-2" />
            {filterOption.label} ({filterOption.count})
          </Button>
        ))}
      </div>
    )
  }

  const cardContent = (
    <>
      {variant === 'full' && renderStatsCards()}
      {variant === 'full' && renderFilterButtons()}
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : viewings.length > 0 ? (
          viewings.map((viewing) => (
            <div key={viewing.id} className="border rounded-lg p-4 space-y-3">
              {/* Main viewing info */}
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">
                      {viewing.property?.property_type} in {viewing.property?.city}
                    </h3>
                    <Badge className={getStatusColor(viewing.status)}>
                      {viewing.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(viewing.viewing_date)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatTime(viewing.viewing_time)}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {viewing.property?.monthly_rent ? formatCurrency(viewing.property.monthly_rent) : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {viewing.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(viewing)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(viewing)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpandedCard(expandedCard === viewing.id ? null : viewing.id)}
                  >
                    {expandedCard === viewing.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Expanded details */}
              {expandedCard === viewing.id && (
                <div className="border-t pt-4 space-y-4">
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
                          <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{viewing.property?.monthly_rent ? formatCurrency(viewing.property.monthly_rent) : 'N/A'} per month</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {viewing.special_requests && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Special Requests</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {viewing.special_requests}
                      </p>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {viewing.status === 'rejected' && viewing.rejection_reason && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Rejection Reason</h4>
                      <p className="text-sm text-gray-600 bg-red-50 p-3 rounded">
                        {viewing.rejection_reason}
                      </p>
                    </div>
                  )}

                  {/* Actions for approved/rejected viewings */}
                  {viewing.status !== 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message Investor
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Property
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No viewing requests</p>
            <p>No {filter === 'all' ? '' : filter + ' '}viewing requests at the moment</p>
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
    </>
  )

  if (variant === 'dashboard') {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Viewing Requests</CardTitle>
          <Link href="/landlord/viewings">
            <Button variant="outline" size="sm" className="bg-transparent">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {cardContent}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {cardContent}
    </div>
  )
}