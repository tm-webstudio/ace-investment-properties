"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PropertyTitle } from "@/components/property-title"
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  User,
  Home,
  PoundSterling
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
    landlord_id: string
  }
  landlord_profile?: {
    full_name: string
    email: string
    phone: string
    company_name?: string
  }
}

interface InvestorViewingRequestsProps {
  variant?: 'dashboard' | 'full'
  limit?: number
}

export function InvestorViewingRequests({ variant = 'dashboard', limit }: InvestorViewingRequestsProps) {
  const [viewings, setViewings] = useState<ViewingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const fetchViewings = async () => {
    try {
      setLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.error('No access token available')
        return
      }

      const queryParams = new URLSearchParams({
        limit: limit ? limit.toString() : '20'
      })

      const response = await fetch(`/api/viewings/my-requests?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (result.success) {
        // Filter for pending, approved, rejected, and cancelled viewings if dashboard variant
        const filteredViewings = variant === 'dashboard'
          ? (result.viewings || []).filter((v: ViewingRequest) =>
              v.status === 'pending' || v.status === 'approved' || v.status === 'rejected' || v.status === 'cancelled'
            )
          : result.viewings || []

        setViewings(filteredViewings)
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
  }, [limit])

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

  const cardContent = (
    <>
      <div className="space-y-3">
        {loading ? (
          <>
            {[...Array(variant === 'dashboard' ? 3 : 5)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                {/* Header skeleton */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
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
        ) : viewings.length > 0 ? (
          viewings.map((viewing) => (
            <div key={viewing.id} className="border rounded-lg p-4 space-y-3">
              {/* Main viewing info */}
              <div
                className="cursor-pointer"
                onClick={() => setExpandedCard(expandedCard === viewing.id ? null : viewing.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-sans text-[15px] font-medium mb-2">
                      {viewing.property?.address && viewing.property?.city ? (
                        <PropertyTitle
                          address={viewing.property.address}
                          city={viewing.property.city}
                          postcode={viewing.property.postcode}
                        />
                      ) : (
                        `${viewing.property?.property_type} in ${viewing.property?.city}`
                      )}
                    </h3>

                    <Badge className={`${getStatusColor(viewing.status)} capitalize`}>
                      {viewing.status === 'pending' ? 'awaiting approval' :
                       viewing.status === 'approved' ? 'Approved' :
                       viewing.status === 'rejected' ? 'Rejected' :
                       viewing.status === 'cancelled' ? 'Cancelled' :
                       viewing.status}
                    </Badge>
                  </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    {/* Landlord Details */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Landlord Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{viewing.landlord_profile?.full_name || 'N/A'}</span>
                        </div>
                        {viewing.landlord_profile?.company_name && (
                          <div className="flex items-center">
                            <Home className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{viewing.landlord_profile.company_name}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{viewing.landlord_profile?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{viewing.landlord_profile?.phone || 'N/A'}</span>
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
                      <p className="text-sm text-gray-600 bg-destructive/5 p-3 rounded">
                        {viewing.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground min-h-[280px] flex flex-col items-center justify-center">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-base font-medium mb-1.5">No Viewing Requests</p>
            <p className="text-sm">You haven't requested any viewings yet</p>
          </div>
        )}
      </div>
    </>
  )

  if (variant === 'dashboard') {
    return (
      <Card className="max-h-[600px] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Viewings</CardTitle>
          <Link href="/investor/viewings">
            <Button variant="outline" size="sm" className="bg-transparent">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1">
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
