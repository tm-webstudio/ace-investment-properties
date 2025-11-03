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
  security_deposit: number
  available_date: string
  description: string
  address: string
  city: string
  county: string
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
}

export function DashboardProperties({ userId }: DashboardPropertiesProps) {
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
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading properties...</p>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
        <Home className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p className="text-base font-medium mb-1.5">No Properties Listed</p>
        <p className="text-sm mb-4">Get started by adding your first property</p>
        <Link href="/landlord/add-property">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            variant="landlord"
            onPropertyDeleted={() => fetchProperties(false)}
          />
        ))}
      </div>
    </div>
  )
}
