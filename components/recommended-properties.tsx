"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import { PropertyCard } from "@/components/property-card"
import { PreferencesModal } from "@/components/preferences-modal"
import { Settings, Filter, RefreshCw, Heart } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface RecommendedPropertiesProps {
  className?: string
  preferences?: any
}

interface MatchedProperty {
  id: string
  title: string
  address: string
  city: string
  property_type: string
  bedrooms: string
  bathrooms: string
  monthly_rent: number
  price: number // Converted price from API
  photos: string[]
  available_date?: string
  property_licence?: string
  property_condition?: string
  availability?: string
  matchScore: number
  matchReasons: string[]
}

export function RecommendedProperties({ className, preferences }: RecommendedPropertiesProps) {
  const [properties, setProperties] = useState<MatchedProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState("")
  const [showBestOnly, setShowBestOnly] = useState(true)
  const [totalMatches, setTotalMatches] = useState(0)
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set())
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchRecommendedProperties()
    fetchSavedProperties()
  }, [showBestOnly])

  const fetchRecommendedProperties = async (offset = 0) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError("Please sign in to view recommendations")
        return
      }

      const minScore = showBestOnly ? 80 : 0
      const response = await fetch(
        `/api/investor/matched-properties?minScore=${minScore}&limit=6&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      )

      const result = await response.json()

      if (result.success) {
        if (offset === 0) {
          setProperties(result.properties)
        } else {
          setProperties(prev => [...prev, ...result.properties])
        }
        setTotalMatches(result.total)
        setHasMore(result.properties.length === 6) // If we got less than 6, no more to load
      } else {
        setError(result.error || "Failed to fetch recommendations")
      }
    } catch (error) {
      console.error('Error fetching recommended properties:', error)
      setError("Failed to load recommendations")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const fetchSavedProperties = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch('/api/saved-properties', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const savedIds = new Set(result.savedProperties.map((sp: any) => sp.property_id))
          setSavedProperties(savedIds)
        }
      }
    } catch (error) {
      console.error('Error fetching saved properties:', error)
    }
  }

  const handleSaveProperty = async (propertyId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const isSaved = savedProperties.has(propertyId)
      const url = `/api/properties/${propertyId}/${isSaved ? 'unsave' : 'save'}`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        setSavedProperties(prev => {
          const newSet = new Set(prev)
          if (isSaved) {
            newSet.delete(propertyId)
          } else {
            newSet.add(propertyId)
          }
          return newSet
        })
      }
    } catch (error) {
      console.error('Error saving property:', error)
    }
  }

  const handleLoadMore = () => {
    setLoadingMore(true)
    fetchRecommendedProperties(properties.length)
  }

  const handleRefresh = () => {
    setLoading(true)
    setProperties([])
    fetchRecommendedProperties(0)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Recommended For You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Recommended For You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{error}</p>
            {error.includes("preferences") ? (
              <Link href="/investor/signup">
                <Button>Set Your Preferences</Button>
              </Link>
            ) : (
              <Button onClick={handleRefresh}>Try Again</Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (properties.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Recommended For You
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <PreferencesModal onPreferencesUpdate={() => {
              fetchRecommendedProperties()
              fetchSavedProperties()
            }} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No properties match your current preferences
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Adjust your preferences to see more properties or try showing all matches instead of best matches only.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <PreferencesModal onPreferencesUpdate={() => {
                fetchRecommendedProperties()
                fetchSavedProperties()
              }} />
              <Button 
                variant="outline" 
                onClick={() => setShowBestOnly(false)}
                disabled={!showBestOnly}
              >
                Show All Matches
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-4">
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Recommended For You
        </CardTitle>

        {/* Your Preferences Section */}
        {preferences && (
          <div className="py-4 border rounded-lg bg-gray-50/50 w-full relative">
            <div className="flex justify-between items-center mb-3 px-4">
              <h3 className="text-base font-medium">Your Preferences</h3>
              <PreferencesModal onPreferencesUpdate={() => {
                fetchRecommendedProperties()
                fetchSavedProperties()
              }} />
            </div>
            <div className="grid grid-cols-4 gap-3 text-sm px-4">
              <div>
                <span className="text-gray-600">Budget:</span>
                <div className="font-medium">
                  £{preferences.preference_data.budget.min.toLocaleString()}-£{preferences.preference_data.budget.max.toLocaleString()}/month
                </div>
              </div>
              <div>
                <span className="text-gray-600">Bedrooms:</span>
                <div className="font-medium">
                  {preferences.preference_data.bedrooms.min === preferences.preference_data.bedrooms.max
                    ? `${preferences.preference_data.bedrooms.min} bedroom${preferences.preference_data.bedrooms.min !== 1 ? 's' : ''}`
                    : `${preferences.preference_data.bedrooms.min}-${preferences.preference_data.bedrooms.max} bedrooms`
                  }
                </div>
              </div>
              <div>
                <span className="text-gray-600">Property Types:</span>
                <div className="font-medium">
                  {preferences.preference_data.property_types?.length > 0
                    ? preferences.preference_data.property_types.slice(0, 2).join(', ') +
                      (preferences.preference_data.property_types.length > 2 ? ` +${preferences.preference_data.property_types.length - 2} more` : '')
                    : 'Not specified'
                  }
                </div>
              </div>
              <div>
                <span className="text-gray-600">Locations:</span>
                <div className="font-medium">
                  {preferences.preference_data.locations?.length > 0
                    ? preferences.preference_data.locations.map((loc: any) => loc.city).slice(0, 2).join(', ') +
                      (preferences.preference_data.locations.length > 2 ? ` +${preferences.preference_data.locations.length - 2} more` : '')
                    : 'Not specified'
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {properties.map((property) => {
            // Convert to exact Property interface format
            const convertedProperty = {
              id: property.id,
              title: property.title,
              price: property.price, // Use converted price from API
              monthly_rent: property.monthly_rent,
              deposit: 0,
              address: property.address || '',
              city: property.city,
              state: '',
              bedrooms: parseInt(property.bedrooms) || 0,
              bathrooms: parseInt(property.bathrooms) || 0,
              propertyType: property.property_type as "Studio" | "1BR" | "2BR" | "3BR+" | "House",
              property_type: property.property_type,
              description: '',
              amenities: [],
              images: property.photos || [],
              availableDate: property.available_date || '',
              availability: property.availability || 'vacant',
              property_licence: property.property_licence || 'none',
              property_condition: property.property_condition || 'good',
              landlordId: '',
              landlordName: '',
              landlordPhone: '',
              landlordEmail: '',
              featured: false
            }
            
            return (
              <PropertyCard
                key={property.id}
                property={convertedProperty}
              />
            )
          })}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Loading...
                </>
              ) : (
                "Show More Properties"
              )}
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  )
}