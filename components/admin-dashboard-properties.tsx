"use client"

import { useState, useEffect } from "react"
import { Building, Filter, Search } from "lucide-react"
import { PropertyCard } from "./property-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

interface Property {
  id: string
  property_type: string
  bedrooms: string
  bathrooms: string
  monthly_rent: number
  available_date: string
  description: string
  amenities: string[]
  address: string
  city: string
  county: string
  postcode: string
  photos: string[]
  status: string
  published_at: string
  created_at: string
  updated_at: string
  availability: string
  landlord_id: string
  landlordName: string
  landlordEmail: string
  landlordPhone: string
  property_licence?: string
  property_condition?: string
  latitude?: number
  longitude?: number
}

export function AdminDashboardProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProperties()
  }, [filter])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Authentication required')
        setLoading(false)
        return
      }

      // Build query parameters
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter)
      }

      const response = await fetch(`/api/admin/properties?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch properties')
      }

      if (data.success) {
        console.log('Admin Dashboard - First property data:', data.properties[0])
        console.log('Admin Dashboard - Property licence:', data.properties[0]?.property_licence)
        console.log('Admin Dashboard - Property condition:', data.properties[0]?.property_condition)
        setProperties(data.properties)
      }
    } catch (err: any) {
      console.error('Error fetching properties:', err)
      setError(err.message || 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const getEmptyStateMessage = () => {
    switch (filter) {
      case 'draft':
        return {
          title: "No Pending Properties",
          description: "There are no properties awaiting approval"
        }
      case 'active':
        return {
          title: "No Active Properties",
          description: "No active properties found"
        }
      case 'rejected':
        return {
          title: "No Rejected Properties",
          description: "No rejected properties found"
        }
      default:
        return {
          title: "No Properties",
          description: "No properties found"
        }
    }
  }

  const emptyState = getEmptyStateMessage()

  // Filter properties based on search query
  const filteredProperties = properties.filter(property => {
    const searchLower = searchQuery.toLowerCase()
    return (
      (property.address || '').toLowerCase().includes(searchLower) ||
      (property.city || '').toLowerCase().includes(searchLower) ||
      (property.postcode || '').toLowerCase().includes(searchLower) ||
      (property.county || '').toLowerCase().includes(searchLower)
    )
  })

  return (
    <>
      {/* Search and Filter Bar */}
      <Card className="mb-6 bg-white shadow-sm">
        <CardContent className="px-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by address, city, or postcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 h-9 sm:h-10 bg-gray-50/30 border-gray-200 focus:bg-white focus:border-primary focus:ring-primary"
              />
            </div>
            <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
              <SelectTrigger className="w-full sm:w-[220px] h-9 sm:h-10 sm:min-h-10 bg-gray-50/30 border-gray-200 focus:bg-white focus:border-primary focus:ring-primary py-2 px-3">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="border rounded-none overflow-hidden">
              <div className="h-48 bg-gray-300 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
          <Building className="h-10 w-10 mx-auto mb-3 opacity-50 text-red-500" />
          <p className="text-base font-medium mb-1.5 text-red-600">Error Loading Properties</p>
          <p className="text-sm mb-4 max-w-[200px] mx-auto">{error}</p>
          <button
            onClick={fetchProperties}
            className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md text-sm"
          >
            Try Again
          </button>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
          <Building className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-base font-medium mb-1.5">{properties.length === 0 ? emptyState.title : "No Matching Properties"}</p>
          <p className="text-sm max-w-[200px] mx-auto">{properties.length === 0 ? emptyState.description : "Try adjusting your search or filters"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProperties.map((property) => (
            filter === 'draft' ? (
              <div key={property.id} className="space-y-2">
                <PropertyCard
                  property={property}
                  variant="admin"
                  onApprove={fetchProperties}
                  onReject={fetchProperties}
                />

                {/* Admin info below the card */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">By: {property.landlordName}</span>
                  <span>Submitted: {new Date(property.created_at).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            ) : filter === 'rejected' ? (
              <div key={property.id} className="space-y-2">
                <PropertyCard
                  property={property}
                  variant="default"
                />

                {/* Admin info below the card */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">By: {property.landlordName}</span>
                  <span>Rejected: {new Date(property.updated_at).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            ) : (
              <PropertyCard
                key={property.id}
                property={property}
                variant="default"
              />
            )
          ))}
        </div>
      )}
    </>
  )
}
