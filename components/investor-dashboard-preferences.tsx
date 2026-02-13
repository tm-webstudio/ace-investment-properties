"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PropertyCard } from "@/components/property-card"
import { Settings, Edit3 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface InvestorDashboardPreferencesProps {
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
  price: number
  photos: string[]
  available_date?: string
  property_licence?: string
  property_condition?: string
  availability?: string
  matchScore: number
  matchReasons: string[]
}

export function InvestorDashboardPreferences({ preferences: initialPreferences }: InvestorDashboardPreferencesProps) {
  const [preferences, setPreferences] = useState<any>(initialPreferences)
  const [properties, setProperties] = useState<MatchedProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [totalMatches, setTotalMatches] = useState(0)

  useEffect(() => {
    fetchPreferencesAndProperties()
  }, [])

  const fetchPreferencesAndProperties = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setLoading(false)
        return
      }

      // Fetch preferences if not provided
      if (!preferences) {
        const prefResponse = await fetch('/api/investor/preferences', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        const prefResult = await prefResponse.json()
        if (prefResult.success && prefResult.preferences) {
          setPreferences(prefResult.preferences)
        }
      }

      // Fetch matched properties
      const response = await fetch(
        `/api/investor/matched-properties?minScore=60&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      )

      const result = await response.json()
      if (result.success) {
        setProperties(result.properties)
        setTotalMatches(result.total)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }


  if (!preferences) {
    return (
      <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
        <Settings className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p className="text-base font-medium mb-1.5">No Preferences Set</p>
        <p className="text-sm mb-4 max-w-[240px] mx-auto">Set your investment preferences to get personalized property recommendations</p>
        <Link href="/investor/preferences">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Settings className="mr-2 h-4 w-4" />
            Set Up Preferences
          </Button>
        </Link>
      </div>
    )
  }

  const prefData = preferences.preference_data || {}

  return (
    <div className="space-y-6">
      {/* Preferences Summary - Always visible */}
      {preferences && preferences.preference_data && (
        <div className="py-4 border rounded-lg bg-gray-50/50 w-full md:w-1/2">
          <div className="mb-3 px-4">
            <h3 className="text-sm font-bold">Your Preferences</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm px-4">
            <div>
              <span className="text-gray-900">Budget: </span>
              <span className="text-gray-600">
                £{prefData.budget?.min?.toLocaleString() || 500}-£{prefData.budget?.max?.toLocaleString() || 2000}/month
              </span>
            </div>
            <div>
              <span className="text-gray-900">Bedrooms: </span>
              <span className="text-gray-600">
                {prefData.bedrooms?.min === prefData.bedrooms?.max
                  ? `${prefData.bedrooms?.min || 1} bedroom${prefData.bedrooms?.min !== 1 ? 's' : ''}`
                  : `${prefData.bedrooms?.min || 1}-${prefData.bedrooms?.max || 4} bedrooms`
                }
              </span>
            </div>
            <div>
              <span className="text-gray-900">Property Types: </span>
              <span className="text-gray-600">
                {prefData.property_types?.length > 0
                  ? prefData.property_types.slice(0, 2).join(', ') +
                    (prefData.property_types.length > 2 ? ` +${prefData.property_types.length - 2} more` : '')
                  : 'Not specified'
                }
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-900">Locations: </span>
              <span className="text-gray-600">
                {prefData.locations?.length > 0
                  ? prefData.locations.map((loc: any) => {
                      if (loc.localAuthorities && loc.localAuthorities.length > 0) {
                        return `${loc.city} (${loc.localAuthorities.join(', ')})`
                      }
                      return loc.city
                    }).slice(0, 2).join('; ') +
                    (prefData.locations.length > 2 ? ` +${prefData.locations.length - 2} more` : '')
                  : 'Not specified'
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-t-lg"></div>
              <div className="bg-white p-4 rounded-b-lg border border-t-0">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : !preferences ? (
        <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
          <Settings className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-base font-medium mb-1.5">No Preferences Set</p>
          <p className="text-sm mb-4 max-w-[240px] mx-auto">Set your investment preferences to get personalized property recommendations</p>
          <Link href="/investor/preferences">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Settings className="mr-2 h-4 w-4" />
              Set Up Preferences
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Matched Properties Grid */}
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {properties.map((property) => {
            const convertedProperty = {
              id: property.id,
              title: property.title,
              price: property.price,
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
          ) : (
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
          )}
        </>
      )}
    </div>
  )
}
