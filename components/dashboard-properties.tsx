"use client"

import { useState, useEffect } from "react"
import { PropertyCard } from "@/components/property-card"
import { supabase } from "@/lib/supabase"
import { Plus, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Property {
  id: string
  title: string
  property_type: string
  bedrooms: number
  bathrooms: number
  monthly_rent: number
  available_date: string
  description: string
  address: string
  city: string
  localAuthority: string
  postcode: string
  photos: string[]
  status: string
  landlord_id: string
  availability: string
  property_licence: string
  property_condition: string
}

interface DashboardPropertiesProps {
  userId: string
  currentTab?: string
}

export function DashboardProperties({ userId, currentTab = 'properties' }: DashboardPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)

  const fetchProperties = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }

      // Get current session for API authentication
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        console.error('No access token available')
        setLoading(false)
        return
      }

      // Use the landlord properties API endpoint
      const response = await fetch('/api/landlord/properties', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (result.success) {
        setProperties(result.properties || [])
      } else {
        console.error('Error fetching properties:', result.error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
      setInitialLoad(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              {/* Image skeleton */}
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              {/* Content skeleton */}
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-9 bg-gray-200 rounded animate-pulse w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
        <Home className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p className="text-base font-medium mb-1.5">No Properties Listed</p>
        <p className="text-sm mb-4 max-w-[200px] mx-auto">Get started by adding your first property</p>
        <Link href="/landlord/submit-property">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Submit Property
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            variant="landlord"
            onPropertyDeleted={() => fetchProperties(false)}
            currentTab={currentTab}
          />
        ))}
      </div>
    </div>
  )
}
