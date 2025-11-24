"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Search, Filter, Eye, X, Download, Timer, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface ViewingRequest {
  id: string
  property_id: string
  viewing_date: string
  viewing_time: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
  message?: string
  rejection_reason?: string
  created_at: string
  viewed_by_user: boolean
  property: {
    id: string
    title?: string
    property_type: string
    city: string
    address: string
    postcode?: string
    monthly_rent: number
    photos: string[]
  }
}

interface ViewingStats {
  total: number
  pending: number
  approved: number
  upcoming: number
}

const formatTime = (timeStr: string) => {
  // Parse time and convert to 12-hour format with am/pm
  const [hours, minutes] = timeStr.split(':').map(Number)
  const period = hours >= 12 ? 'pm' : 'am'
  const displayHours = hours % 12 || 12
  return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`
}

export function InvestorDashboardViewings() {
  const [viewings, setViewings] = useState<ViewingRequest[]>([])
  const [filteredViewings, setFilteredViewings] = useState<ViewingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ViewingStats>({ total: 0, pending: 0, approved: 0, upcoming: 0 })
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    fetchViewings()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [viewings, statusFilter, sortBy, searchQuery])

  const fetchViewings = async () => {
    try {
      let token = localStorage.getItem('accessToken')

      if (!token) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          token = session.access_token
        } else {
          setLoading(false)
          return
        }
      }

      const response = await fetch('/api/viewings/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const limitedViewings = (data.viewings || []).slice(0, 6) // Show only 6 on dashboard
        setViewings(limitedViewings)
        calculateStats(data.viewings || [])
      }
    } catch (error) {
      console.error('Error fetching viewings:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (viewings: ViewingRequest[]) => {
    const now = new Date()
    const stats = {
      total: viewings.length,
      pending: viewings.filter(v => v.status === 'pending').length,
      approved: viewings.filter(v => v.status === 'approved').length,
      upcoming: viewings.filter(v => {
        if (v.status !== 'approved') return false
        const viewingDateTime = new Date(`${v.viewing_date}T${v.viewing_time}`)
        return viewingDateTime > now
      }).length
    }
    setStats(stats)
  }

  const applyFiltersAndSort = () => {
    let filtered = [...viewings]

    if (statusFilter !== 'all') {
      filtered = filtered.filter(viewing => viewing.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(viewing =>
        viewing.property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        viewing.property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (viewing.property.title && viewing.property.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'upcoming':
          const aDateTime = new Date(`${a.viewing_date}T${a.viewing_time}`).getTime()
          const bDateTime = new Date(`${b.viewing_date}T${b.viewing_time}`).getTime()
          return aDateTime - bDateTime
        default:
          return 0
      }
    })

    setFilteredViewings(filtered)
  }

  const handleCancelViewing = async (viewingId: string) => {
    if (!confirm('Are you sure you want to cancel this viewing request?')) {
      return
    }

    setCancellingId(viewingId)

    try {
      let token = localStorage.getItem('accessToken')

      if (!token) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          token = session.access_token
        }
      }

      const response = await fetch(`/api/viewings/${viewingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchViewings()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to cancel viewing request' }))
        alert(errorData.error || 'Failed to cancel viewing request')
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error cancelling viewing request')
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusBadge = (status: string, rejectionReason?: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTimeUntilViewing = (date: string, time: string) => {
    const viewingDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    const diff = viewingDateTime.getTime() - now.getTime()

    if (diff < 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) {
      return `In ${days}d ${hours}h`
    } else if (hours > 0) {
      return `In ${hours}h`
    } else {
      return 'Soon'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900">My Viewings</h2>
          </div>
          <p className="text-gray-600 mt-1">
            Track and manage your property viewing appointments
          </p>
        </div>
        {stats.total > 0 && (
          <Link href="/investor/viewings">
            <Button variant="outline">View All</Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      {stats.total > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Viewing Requests List */}
      {filteredViewings.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-base font-medium mb-1.5">
            {stats.total === 0 ? "No Viewing Requests" : "No Matching Viewings"}
          </p>
          <p className="text-sm mb-4 max-w-[240px] mx-auto">
            {stats.total === 0
              ? "Browse properties and book a viewing to get started"
              : "Try adjusting your filters"
            }
          </p>
          {stats.total === 0 && (
            <Link href="/investor/property-matching">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Browse Properties
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredViewings.map((viewing) => {
            const propertyTitle = viewing.property.address && viewing.property.city
              ? `${viewing.property.address.replace(/^\d+\s*/, '').replace(/^flat\s*\d+\s*/i, '').replace(/^unit\s*\d+\s*/i, '').replace(/^apartment\s*\d+\s*/i, '').trim()}, ${viewing.property.city}${viewing.property.postcode ? ` ${viewing.property.postcode.split(' ')[0]}` : ''}`
              : viewing.property.title || `${viewing.property.property_type} in ${viewing.property.city}`
            const timeUntil = viewing.status === 'approved' ? getTimeUntilViewing(viewing.viewing_date, viewing.viewing_time) : null

            return (
              <Card key={viewing.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Property Image */}
                    <div className="w-full sm:w-20 h-20 flex-shrink-0">
                      <Image
                        src={viewing.property.photos?.[0] || "/placeholder.svg"}
                        alt={propertyTitle}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{propertyTitle}</h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          {viewing.property.city}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(viewing.viewing_date).toLocaleDateString('en-GB')}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(viewing.viewing_time)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(viewing.status, viewing.rejection_reason)}
                        {timeUntil && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            <Timer className="h-3 w-3 mr-1" />
                            {timeUntil}
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Link href={`/properties/${viewing.property_id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </Link>

                        {(viewing.status === 'pending' || viewing.status === 'approved') && (
                          <>
                            <Button variant="outline" size="sm">
                              <Calendar className="h-3 w-3 mr-1" />
                              Change
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={cancellingId === viewing.id}
                              onClick={() => handleCancelViewing(viewing.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-3 w-3 mr-1" />
                              {cancellingId === viewing.id ? 'Cancelling...' : 'Cancel'}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
