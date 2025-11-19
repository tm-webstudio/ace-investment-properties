"use client"

import { useState, useEffect } from "react"
import { Building, Filter } from "lucide-react"
import { PropertyCard } from "./property-card"
import { Button } from "@/components/ui/button"
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
  licence?: string
  condition?: string
  latitude?: number
  longitude?: number
}

export function AdminDashboardProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'rejected'>('all')

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
        setProperties(data.properties)
      }
    } catch (err: any) {
      console.error('Error fetching properties:', err)
      setError(err.message || 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
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
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
        <Building className="h-10 w-10 mx-auto mb-3 opacity-50 text-red-500" />
        <p className="text-base font-medium mb-1.5 text-red-600">Error Loading Properties</p>
        <p className="text-sm mb-4">{error}</p>
        <button
          onClick={fetchProperties}
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md text-sm"
        >
          Try Again
        </button>
      </div>
    )
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

  return (
    <>
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filter === 'all' ? "default" : "outline"}
          onClick={() => setFilter('all')}
          className="h-9"
        >
          <Filter className="h-4 w-4 mr-2" />
          All Properties
        </Button>
        <Button
          variant={filter === 'active' ? "default" : "outline"}
          onClick={() => setFilter('active')}
          className="h-9"
        >
          <Filter className="h-4 w-4 mr-2" />
          Active
        </Button>
        <Button
          variant={filter === 'draft' ? "default" : "outline"}
          onClick={() => setFilter('draft')}
          className="h-9"
        >
          <Filter className="h-4 w-4 mr-2" />
          Pending
        </Button>
        <Button
          variant={filter === 'rejected' ? "default" : "outline"}
          onClick={() => setFilter('rejected')}
          className="h-9"
        >
          <Filter className="h-4 w-4 mr-2" />
          Rejected
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
          <Building className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-base font-medium mb-1.5">{emptyState.title}</p>
          <p className="text-sm">{emptyState.description}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {properties.map((property) => (
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
