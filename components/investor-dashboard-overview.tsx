"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PropertyCard } from "@/components/property-card"
import { InvestorViewingRequests } from "@/components/investor-viewing-requests"
import { TrendingUp, Heart, Calendar, Bell, Search, BarChart3, Home, Eye, Clock } from "lucide-react"
import Link from "next/link"
import type { Investor } from "@/lib/sample-data"
import { sampleViewings, sampleNotifications } from "@/lib/sample-data"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface InvestorDashboardOverviewProps {
  investor: Investor
}

export function InvestorDashboardOverview({ investor }: InvestorDashboardOverviewProps) {
  const { user } = useAuth()
  const [savedProperties, setSavedProperties] = useState<any[]>([])
  const [upcomingViewings, setUpcomingViewings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingsLoading, setViewingsLoading] = useState(true)

  // Fetch real saved properties from API
  useEffect(() => {
    const fetchSavedProperties = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        let token = localStorage.getItem('accessToken')
        
        if (!token) {
          // Try to get token from Supabase session as fallback
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            token = session.access_token
          } else {
            setLoading(false)
            return
          }
        }

        const response = await fetch('/api/saved-properties?limit=5', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setSavedProperties(data.properties || [])
        }
      } catch (error) {
        console.error('Error fetching saved properties:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchUpcomingViewings = async () => {
      if (!user) {
        setViewingsLoading(false)
        return
      }

      try {
        let token = localStorage.getItem('accessToken')
        
        if (!token) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            token = session.access_token
          } else {
            setViewingsLoading(false)
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
          
          // Filter for upcoming pending viewings only
          const now = new Date()
          const upcoming = (data.viewings || [])
            .filter((viewing: any) => {
              // Only show pending viewings (user's active requests)
              if (viewing.status !== 'pending') return false
              
              const viewingDateTime = new Date(`${viewing.viewing_date}T${viewing.viewing_time}`)
              return viewingDateTime > now
            })
            .sort((a: any, b: any) => {
              const aDateTime = new Date(`${a.viewing_date}T${a.viewing_time}`)
              const bDateTime = new Date(`${b.viewing_date}T${b.viewing_time}`)
              return aDateTime.getTime() - bDateTime.getTime()
            })
            .slice(0, 4) // Show next 4
          
          setUpcomingViewings(upcoming)
        }
      } catch (error) {
        console.error('Error fetching viewings:', error)
      } finally {
        setViewingsLoading(false)
      }
    }

    fetchSavedProperties()
    fetchUpcomingViewings()
  }, [user])

  // Transform saved properties for display
  const savedPropertiesWithDetails = savedProperties.map(saved => ({
    id: saved.savedPropertyId,
    property: {
      id: saved.property.id,
      title: saved.property.title, // Use formatted title from API
      price: saved.property.monthly_rent,
      images: saved.property.photos || [],
      photos: saved.property.photos || [],
      bedrooms: saved.property.bedrooms,
      bathrooms: saved.property.bathrooms,
      availableDate: saved.property.available_date,
      availability: saved.property.availability || 'vacant',
      property_licence: saved.property.property_licence,
      property_condition: saved.property.property_condition,
      amenities: saved.property.amenities || [],
      property_type: saved.property.property_type,
      city: saved.property.city,
      monthly_rent: saved.property.monthly_rent
    }
  }))

  // upcomingViewings is now fetched from API in useEffect

  // Get investor's recent notifications
  const recentNotifications = sampleNotifications
    .filter(notif => notif.investorId === investor.id)
    .slice(0, 5) // Show latest 5

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_property":
        return <Home className="h-4 w-4" />
      case "price_change":
        return <TrendingUp className="h-4 w-4" />
      case "viewing_reminder":
        return <Calendar className="h-4 w-4" />
      case "market_update":
        return <BarChart3 className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "new_property":
        return "text-green-600"
      case "price_change":
        return "text-blue-600"
      case "viewing_reminder":
        return "text-orange-600"
      case "market_update":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-8">

      {/* Saved Properties */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Saved Properties</CardTitle>
          <Link href="/investor/saved-properties">
            <Button variant="outline" size="sm" className="bg-transparent">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          ) : savedPropertiesWithDetails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {savedPropertiesWithDetails.map((item) => (
                <PropertyCard 
                  key={item.id} 
                  property={item.property} 
                  variant="default" 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No saved properties yet</p>
              <p className="mb-4">Start exploring and save properties you're interested in</p>
              <Link href="/investor/property-matching">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Find Properties
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Viewings */}
        <InvestorViewingRequests variant="dashboard" limit={4} />

        {/* Recent Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Notifications</CardTitle>
            <Link href="/investor/notifications">
              <Button variant="outline" size="sm" className="bg-transparent">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentNotifications.map((notification) => (
                <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg ${!notification.isRead ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 p-0 gap-3.5 rounded-none">
      {/* Image Skeleton */}
      <div className="relative">
        <div className="w-full h-48 bg-muted animate-pulse" />
        
        {/* Badge Skeleton */}
        <div className="absolute top-4 left-4">
          <div className="h-6 w-24 bg-muted-foreground/20 rounded animate-pulse" />
        </div>
        
        {/* Heart Button Skeleton */}
        <div className="absolute top-4 right-4">
          <div className="h-10 w-10 bg-muted-foreground/20 rounded animate-pulse" />
        </div>
      </div>

      <CardContent className="px-5 pb-4 pr-4 pl-4">
        <div className="space-y-2.5">
          {/* Title and Price Skeleton */}
          <div className="mb-1.5">
            <div className="h-6 w-3/4 bg-muted animate-pulse rounded mb-1" />
            <div className="h-5 w-1/2 bg-muted animate-pulse rounded" />
          </div>

          {/* Bed/Bath Skeleton */}
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-muted animate-pulse rounded mr-1" />
              <div className="h-4 w-12 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 bg-muted animate-pulse rounded mr-1" />
              <div className="h-4 w-12 bg-muted animate-pulse rounded" />
            </div>
          </div>

          {/* Amenities Skeleton */}
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-16 bg-muted animate-pulse rounded" />
            <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            <div className="h-6 w-14 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}