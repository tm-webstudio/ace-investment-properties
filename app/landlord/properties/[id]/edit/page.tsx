"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { EditPropertyForm } from "@/components/edit-property-form"
import { DashboardNavigationHeader } from "@/components/dashboard-navigation-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { supabase } from '@/lib/supabase'

interface Property {
  id: string
  property_type: string
  property_licence?: string
  address: string
  city: string
  county: string
  postcode: string
  monthly_rent: number
  available_date: string
  bedrooms: number
  bathrooms: number
  description: string
  amenities: string[]
  photos: string[]
  status: string
  published_at: string
  created_at: string
  updated_at: string
}

function EditPropertyPageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const propertyId = params.id as string
  const returnUrl = searchParams.get('returnUrl') || undefined

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true)
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          setError('Please log in to edit properties')
          setLoading(false)
          return
        }

        // Fetch property from API
        const response = await fetch(`/api/landlord/properties/${propertyId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch property')
        }

        if (data.success) {
          setProperty(data.property)
        } else {
          throw new Error(data.error || 'Property not found')
        }
      } catch (err: any) {
        console.error('Error fetching property:', err)
        setError(err.message || 'Failed to load property')
      } finally {
        setLoading(false)
      }
    }

    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <DashboardNavigationHeader />
        <main className="flex-1 bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="border rounded-lg p-8">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <DashboardFooter />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <DashboardNavigationHeader />
        <main className="flex-1 bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <a 
                href="/landlord/properties"
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-md inline-block"
              >
                Back to Properties
              </a>
            </div>
          </div>
        </main>
        <DashboardFooter />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <DashboardNavigationHeader />
        <main className="flex-1 bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
              <p className="text-muted-foreground mb-6">The property you're looking for doesn't exist or you don't have permission to edit it.</p>
              <a 
                href="/landlord/properties"
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-md inline-block"
              >
                Back to Properties
              </a>
            </div>
          </div>
        </main>
        <DashboardFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNavigationHeader />
      <main className="flex-1 bg-background">
        <EditPropertyForm propertyId={propertyId} initialData={property} returnUrl={returnUrl} />
      </main>
      <DashboardFooter />
    </div>
  )
}
export default function EditPropertyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    }>
      <EditPropertyPageContent />
    </Suspense>
  )
}
