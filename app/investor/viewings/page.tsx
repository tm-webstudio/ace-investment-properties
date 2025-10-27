"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Search, Filter, Eye, X, Download, Phone, Mail, Timer, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { InvestorDashboardNavigation } from "@/components/investor-dashboard-navigation"

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

export default function MyViewingsPage() {
  const { user } = useAuth()
  const [viewings, setViewings] = useState<ViewingRequest[]>([])
  const [filteredViewings, setFilteredViewings] = useState<ViewingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ViewingStats>({ total: 0, pending: 0, approved: 0, upcoming: 0 })
  
  // Filters and search
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Cancel viewing state
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchViewings()
    }
  }, [user])

  useEffect(() => {
    applyFiltersAndSort()
  }, [viewings, statusFilter, sortBy, searchQuery])

  const fetchViewings = async () => {
    if (!user) return

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
        setViewings(data.viewings || [])
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

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(viewing => viewing.status === statusFilter)
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(viewing => 
        viewing.property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        viewing.property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (viewing.property.title && viewing.property.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'upcoming':
          const aDateTime = new Date(`${a.viewing_date}T${a.viewing_time}`).getTime()
          const bDateTime = new Date(`${b.viewing_date}T${b.viewing_time}`).getTime()
          return aDateTime - bDateTime
        case 'property':
          const aTitle = a.property.title || `${a.property.property_type} in ${a.property.city}`
          const bTitle = b.property.title || `${b.property.property_type} in ${b.property.city}`
          return aTitle.localeCompare(bTitle)
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
        // Refresh the viewings list
        await fetchViewings()
        // Show success message (you could add a toast here)
      } else {
        alert('Failed to cancel viewing request')
      }
    } catch (error) {
      console.error('Error cancelling viewing:', error)
      alert('Error cancelling viewing request')
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusBadge = (status: string, rejectionReason?: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">⏳ Awaiting landlord approval</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">✓ Confirmed</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">✗ Declined{rejectionReason ? ` - ${rejectionReason}` : ''}</Badge>
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
      return `Viewing in ${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `Viewing in ${hours} hour${hours !== 1 ? 's' : ''}`
    } else {
      return 'Viewing soon'
    }
  }

  const downloadCalendarFile = (viewing: ViewingRequest) => {
    const startDate = new Date(`${viewing.viewing_date}T${viewing.viewing_time}`)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour duration
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Property Viewing//EN',
      'BEGIN:VEVENT',
      `UID:viewing-${viewing.id}@property-app.com`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:Property Viewing - ${viewing.property.title || `${viewing.property.property_type} in ${viewing.property.city}`}`,
      `DESCRIPTION:Property viewing at ${viewing.property.address}`,
      `LOCATION:${viewing.property.address}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')
    
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `viewing-${viewing.property.city.toLowerCase().replace(/\s+/g, '-')}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <InvestorDashboardNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <InvestorDashboardNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/investor">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Viewing Requests</h1>
          <p className="text-gray-600">Track and manage your property viewing appointments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
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

        {/* Filter/Sort Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by property address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="upcoming">Upcoming First</SelectItem>
                  <SelectItem value="property">Property Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Viewing Requests List */}
        {filteredViewings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {viewings.length === 0 ? "You haven't requested any viewings yet" : "No viewings match your filters"}
              </h3>
              <p className="text-gray-600 mb-6">
                {viewings.length === 0 
                  ? "Browse properties and book a viewing to get started"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {viewings.length === 0 && (
                <Link href="/investor/property-matching">
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    Browse Properties
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredViewings.map((viewing) => {
              const propertyTitle = viewing.property.title || `${viewing.property.property_type} in ${viewing.property.city}`
              const timeUntil = viewing.status === 'approved' ? getTimeUntilViewing(viewing.viewing_date, viewing.viewing_time) : null
              
              return (
                <Card key={viewing.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Property Image */}
                      <div className="w-full sm:w-24 h-24 flex-shrink-0">
                        <Image
                          src={viewing.property.photos?.[0] || "/placeholder.svg"}
                          alt={propertyTitle}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{propertyTitle}</h3>
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="h-4 w-4 mr-1" />
                            {viewing.property.address}
                          </div>
                          <div className="text-lg font-semibold text-accent">
                            £{viewing.property.monthly_rent.toLocaleString()}/month
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            Viewing: {new Date(viewing.viewing_date).toLocaleDateString('en-GB')} at {viewing.viewing_time}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          {getStatusBadge(viewing.status, viewing.rejection_reason)}
                          <span className="text-sm text-gray-500">
                            Requested: {new Date(viewing.created_at).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        
                        {timeUntil && (
                          <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            <Timer className="h-4 w-4 mr-1" />
                            {timeUntil}
                          </div>
                        )}
                        
                        {viewing.message && (
                          <div className="bg-gray-50 p-3 rounded text-sm">
                            <span className="font-medium">Your message:</span> "{viewing.message}"
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Link href={`/properties/${viewing.property_id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Property
                            </Button>
                          </Link>
                          
                          {viewing.status === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadCalendarFile(viewing)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Add to Calendar
                            </Button>
                          )}
                          
                          {(viewing.status === 'pending' || viewing.status === 'approved') && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={cancellingId === viewing.id}
                              onClick={() => handleCancelViewing(viewing.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4 mr-2" />
                              {cancellingId === viewing.id ? 'Cancelling...' : 'Cancel Request'}
                            </Button>
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
    </div>
  )
}