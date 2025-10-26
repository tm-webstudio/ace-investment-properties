"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import { PropertyMatchCard } from "@/components/property-match-card"
import { Settings, Filter, RefreshCw, Heart } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface RecommendedPropertiesProps {
  className?: string
}

interface MatchedProperty {
  id: string
  title?: string
  address: string
  city: string
  property_type: string
  bedrooms: string
  bathrooms: string
  monthly_rent: number
  photos: string[]
  available_date?: string
  matchScore: number
  matchReasons: string[]
}

export function RecommendedProperties({ className }: RecommendedPropertiesProps) {
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
            <Link href="/investor/preferences">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Edit Preferences
              </Button>
            </Link>
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
              <Link href="/investor/preferences">
                <Button>Edit Preferences</Button>
              </Link>
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Recommended For You
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            {totalMatches} properties match your preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/investor/preferences">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Edit Preferences
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Show:</span>
            <div className="flex items-center gap-2">
              <Toggle
                pressed={showBestOnly}
                onPressedChange={setShowBestOnly}
                aria-label="Show best matches only"
                size="sm"
              >
                Best matches only (80%+)
              </Toggle>
            </div>
          </div>
          {!showBestOnly && (
            <Badge variant="secondary" className="text-xs">
              Showing all matches
            </Badge>
          )}
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyMatchCard
              key={property.id}
              property={property}
              onSave={handleSaveProperty}
              isSaved={savedProperties.has(property.id)}
            />
          ))}
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