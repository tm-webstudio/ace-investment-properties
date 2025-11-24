"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import { PropertyCard } from "@/components/property-card"
import { PreferencesModal } from "@/components/preferences-modal"
import { Settings, Filter, RefreshCw, ChevronLeft, ChevronRight, Edit3 } from "lucide-react"
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
  const [showBestOnly, setShowBestOnly] = useState(false)
  const [totalMatches, setTotalMatches] = useState(0)
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set())
  const [hasMore, setHasMore] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    fetchRecommendedProperties()
    fetchSavedProperties()
  }, [showBestOnly])

  useEffect(() => {
    updateScrollButtons()
  }, [properties])

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

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' })
      setTimeout(updateScrollButtons, 100)
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' })
      setTimeout(updateScrollButtons, 100)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between mb-1">
            <CardTitle>
              Recommended For You
            </CardTitle>
            <Link href="/investor/dashboard?tab=preferences">
              <Button variant="outline" size="sm" className="bg-transparent">
                View All
              </Button>
            </Link>
          </div>

          {/* Your Preferences Section */}
          {preferences && preferences.preference_data && (
            <div className="py-4 border rounded-lg bg-gray-50/50 w-full md:w-1/2 relative">
              <div className="mb-3 px-4">
                <h3 className="text-sm font-bold">Your Preferences</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm px-4">
                <div>
                  <span className="text-gray-900">Budget: </span>
                  <span className="text-gray-600">
                    £{preferences.preference_data.budget.min.toLocaleString()}-£{preferences.preference_data.budget.max.toLocaleString()}/month
                  </span>
                </div>
                <div>
                  <span className="text-gray-900">Bedrooms: </span>
                  <span className="text-gray-600">
                    {preferences.preference_data.bedrooms.min === preferences.preference_data.bedrooms.max
                      ? `${preferences.preference_data.bedrooms.min} bedroom${preferences.preference_data.bedrooms.min !== 1 ? 's' : ''}`
                      : `${preferences.preference_data.bedrooms.min}-${preferences.preference_data.bedrooms.max} bedrooms`
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-900">Property Types: </span>
                  <span className="text-gray-600">
                    {preferences.preference_data.property_types?.length > 0
                      ? preferences.preference_data.property_types.slice(0, 2).join(', ') +
                        (preferences.preference_data.property_types.length > 2 ? ` +${preferences.preference_data.property_types.length - 2} more` : '')
                      : 'Not specified'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-900">Locations: </span>
                  <span className="text-gray-600">
                    {preferences.preference_data.locations?.length > 0
                      ? preferences.preference_data.locations.map((loc: any) => loc.city).slice(0, 2).join(', ') +
                        (preferences.preference_data.locations.length > 2 ? ` +${preferences.preference_data.locations.length - 2} more` : '')
                      : 'Not specified'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-none w-[23.5%] min-w-[200px]">
                <div className="border rounded-lg overflow-hidden">
                  <div className="w-full h-48 bg-gray-200 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                    <div className="flex gap-4">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                      <div className="h-6 bg-gray-200 rounded w-12 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader className="space-y-4">
          <CardTitle>
            Recommended For You
          </CardTitle>

          {/* Your Preferences Section */}
          {preferences && preferences.preference_data && (
            <div className="py-4 border rounded-lg bg-gray-50/50 w-full md:w-1/2 relative">
              <div className="mb-3 px-4">
                <h3 className="text-sm font-bold">Your Preferences</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm px-4">
                <div>
                  <span className="text-gray-900">Budget: </span>
                  <span className="text-gray-600">
                    £{preferences.preference_data.budget.min.toLocaleString()}-£{preferences.preference_data.budget.max.toLocaleString()}/month
                  </span>
                </div>
                <div>
                  <span className="text-gray-900">Bedrooms: </span>
                  <span className="text-gray-600">
                    {preferences.preference_data.bedrooms.min === preferences.preference_data.bedrooms.max
                      ? `${preferences.preference_data.bedrooms.min} bedroom${preferences.preference_data.bedrooms.min !== 1 ? 's' : ''}`
                      : `${preferences.preference_data.bedrooms.min}-${preferences.preference_data.bedrooms.max} bedrooms`
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-900">Property Types: </span>
                  <span className="text-gray-600">
                    {preferences.preference_data.property_types?.length > 0
                      ? preferences.preference_data.property_types.slice(0, 2).join(', ') +
                        (preferences.preference_data.property_types.length > 2 ? ` +${preferences.preference_data.property_types.length - 2} more` : '')
                      : 'Not specified'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-900">Locations: </span>
                  <span className="text-gray-600">
                    {preferences.preference_data.locations?.length > 0
                      ? preferences.preference_data.locations.map((loc: any) => loc.city).slice(0, 2).join(', ') +
                        (preferences.preference_data.locations.length > 2 ? ` +${preferences.preference_data.locations.length - 2} more` : '')
                      : 'Not specified'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
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
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>
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
          </div>

          {/* Your Preferences Section */}
          {preferences && preferences.preference_data && (
            <div className="py-4 border rounded-lg bg-gray-50/50 w-full md:w-1/2 relative">
              <div className="mb-3 px-4">
                <h3 className="text-sm font-bold">Your Preferences</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm px-4">
                <div>
                  <span className="text-gray-900">Budget: </span>
                  <span className="text-gray-600">
                    £{preferences.preference_data.budget.min.toLocaleString()}-£{preferences.preference_data.budget.max.toLocaleString()}/month
                  </span>
                </div>
                <div>
                  <span className="text-gray-900">Bedrooms: </span>
                  <span className="text-gray-600">
                    {preferences.preference_data.bedrooms.min === preferences.preference_data.bedrooms.max
                      ? `${preferences.preference_data.bedrooms.min} bedroom${preferences.preference_data.bedrooms.min !== 1 ? 's' : ''}`
                      : `${preferences.preference_data.bedrooms.min}-${preferences.preference_data.bedrooms.max} bedrooms`
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-900">Property Types: </span>
                  <span className="text-gray-600">
                    {preferences.preference_data.property_types?.length > 0
                      ? preferences.preference_data.property_types.slice(0, 2).join(', ') +
                        (preferences.preference_data.property_types.length > 2 ? ` +${preferences.preference_data.property_types.length - 2} more` : '')
                      : 'Not specified'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-900">Locations: </span>
                  <span className="text-gray-600">
                    {preferences.preference_data.locations?.length > 0
                      ? preferences.preference_data.locations.map((loc: any) => loc.city).slice(0, 2).join(', ') +
                        (preferences.preference_data.locations.length > 2 ? ` +${preferences.preference_data.locations.length - 2} more` : '')
                      : 'Not specified'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 text-muted-foreground min-h-[280px] flex flex-col items-center justify-center">
            <Settings className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-base font-medium mb-1.5">No Matching Properties</p>
            <p className="text-sm mb-4 max-w-[200px] mx-auto">Try adjusting your preferences to see more properties</p>
            <Link href="/investor/preferences">
              <Button variant="outline">
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Preferences
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between mb-1">
          <CardTitle>
            Recommended For You
          </CardTitle>
          <Link href="/investor/dashboard?tab=preferences">
            <Button variant="outline" size="sm" className="bg-transparent">
              View All
            </Button>
          </Link>
        </div>

        {/* Your Preferences Section */}
        {preferences && (
          <div className="py-4 border rounded-lg bg-gray-50/50 w-full md:w-1/2 relative">
            <div className="mb-3 px-4">
              <h3 className="text-sm font-bold">Your Preferences</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm px-4">
              <div>
                <span className="text-gray-900">Budget: </span>
                <span className="text-gray-600">
                  £{preferences.preference_data.budget.min.toLocaleString()}-£{preferences.preference_data.budget.max.toLocaleString()}/month
                </span>
              </div>
              <div>
                <span className="text-gray-900">Bedrooms: </span>
                <span className="text-gray-600">
                  {preferences.preference_data.bedrooms.min === preferences.preference_data.bedrooms.max
                    ? `${preferences.preference_data.bedrooms.min} bedroom${preferences.preference_data.bedrooms.min !== 1 ? 's' : ''}`
                    : `${preferences.preference_data.bedrooms.min}-${preferences.preference_data.bedrooms.max} bedrooms`
                  }
                </span>
              </div>
              <div>
                <span className="text-gray-900">Property Types: </span>
                <span className="text-gray-600">
                  {preferences.preference_data.property_types?.length > 0
                    ? preferences.preference_data.property_types.slice(0, 2).join(', ') +
                      (preferences.preference_data.property_types.length > 2 ? ` +${preferences.preference_data.property_types.length - 2} more` : '')
                    : 'Not specified'
                  }
                </span>
              </div>
              <div>
                <span className="text-gray-900">Locations: </span>
                <span className="text-gray-600">
                  {preferences.preference_data.locations?.length > 0
                    ? preferences.preference_data.locations.map((loc: any) => loc.city).slice(0, 2).join(', ') +
                      (preferences.preference_data.locations.length > 2 ? ` +${preferences.preference_data.locations.length - 2} more` : '')
                    : 'Not specified'
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Properties Carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 pb-4 scroll-smooth"
            onScroll={updateScrollButtons}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory'
            }}
          >
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
                <div
                  key={property.id}
                  className="flex-none w-4/5 sm:w-1/2 lg:w-[23.5%]"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <PropertyCard
                    property={convertedProperty}
                  />
                </div>
              )
            })}
          </div>

          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {!loading && canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg p-2 hover:bg-gray-50 transition-colors z-10"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {!loading && canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg p-2 hover:bg-gray-50 transition-colors z-10"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

      </CardContent>
    </Card>
  )
}