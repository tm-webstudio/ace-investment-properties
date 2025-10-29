'use client'

import { useEffect, useState } from 'react'
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { MyPropertiesGrid } from "@/components/my-properties-grid"
import { supabase } from '@/lib/supabase'

interface Property {
  id: string
  property_type: string
  bedrooms: string
  bathrooms: string
  monthly_rent: number
  security_deposit: number
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
}

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProperties()
    
    // Check if we're returning from an edit and need to refresh
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('updated') === 'true') {
      // Remove the query parameter to clean up the URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setError('Please log in to view your properties')
        setLoading(false)
        return
      }

      // Fetch properties from API
      const response = await fetch('/api/landlord/properties', {
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
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <div className="h-8 bg-gray-300 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>

            {/* Dashboard Navigation Skeleton */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <nav className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
                  ))}
                </nav>
                <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
            </div>
            
            {/* Property Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="border rounded-none overflow-hidden">
                  {/* Image skeleton */}
                  <div className="h-48 bg-gray-300 animate-pulse"></div>
                  
                  {/* Content skeleton */}
                  <div className="p-4 space-y-3">
                    {/* Title and price */}
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                    
                    {/* Bed/Bath info */}
                    <div className="flex gap-4">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                    
                    {/* Amenities skeleton */}
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button 
                onClick={fetchProperties}
                className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">My Properties</h1>
            <p className="text-muted-foreground text-md">
              {properties.length > 0 
                ? `You have ${properties.length} ${properties.length === 1 ? 'property' : 'properties'} listed`
                : 'Manage your rental listings'
              }
            </p>
          </div>

          <DashboardNavigation />
          
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-4">No Properties Yet</h3>
              <p className="text-muted-foreground mb-6">Start by adding your first rental property</p>
              <a 
                href="/landlord/add-property"
                className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-md inline-block"
              >
                Add Your First Property
              </a>
            </div>
          ) : (
            <MyPropertiesGrid properties={properties} onPropertyDeleted={fetchProperties} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
