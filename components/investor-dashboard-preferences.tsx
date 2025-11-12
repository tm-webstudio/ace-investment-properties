"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, MapPin, Home, PoundSterling, Calendar, Edit3 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface InvestorDashboardPreferencesProps {
  preferences?: any
}

export function InvestorDashboardPreferences({ preferences: initialPreferences }: InvestorDashboardPreferencesProps) {
  const router = useRouter()
  const [preferences, setPreferences] = useState<any>(initialPreferences)
  const [loading, setLoading] = useState(!initialPreferences)

  useEffect(() => {
    if (!initialPreferences) {
      fetchPreferences()
    }
  }, [initialPreferences])

  const fetchPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch('/api/investor/preferences', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()
      if (result.success && result.preferences) {
        setPreferences(result.preferences)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Settings className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No Preferences Set</h3>
          <p className="text-gray-600 mb-6">
            Set your investment preferences to get personalized property recommendations.
          </p>
          <Link href="/investor/preferences">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Settings className="mr-2 h-4 w-4" />
              Set Up Preferences
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const prefData = preferences.preference_data || {}
  const operatorTypeLabels = {
    sa_operator: "Supported Accommodation Operator",
    supported_living: "Supported Living Provider",
    social_housing: "Social Housing Provider",
    other: "Other"
  }

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Investment Preferences</h2>
          <p className="text-gray-600 mt-1">
            Last updated: {new Date(preferences.updated_at).toLocaleDateString()}
          </p>
        </div>
        <Link href="/investor/preferences">
          <Button variant="outline">
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Preferences
          </Button>
        </Link>
      </div>

      {/* Business Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm text-gray-600">Operator Type:</span>
            <p className="font-medium">
              {operatorTypeLabels[preferences.operator_type as keyof typeof operatorTypeLabels] || preferences.operator_type}
              {preferences.operator_type_other && ` - ${preferences.operator_type_other}`}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Properties Managing:</span>
            <p className="font-medium">{preferences.properties_managing || 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* Property Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm text-gray-600 block mb-2">Property Types:</span>
            <div className="flex flex-wrap gap-2">
              {prefData.property_types?.length > 0 ? (
                prefData.property_types.map((type: string) => (
                  <Badge key={type} variant="secondary" className="capitalize">
                    {type.replace('_', ' ')}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500">No specific types selected</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Bedrooms:</span>
              <p className="font-medium">
                {prefData.bedrooms?.min || 1} - {prefData.bedrooms?.max || 3}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Budget:</span>
              <p className="font-medium">
                £{prefData.budget?.min || 500} - £{prefData.budget?.max || 2000}
                <span className="text-xs text-gray-500 ml-1">
                  ({prefData.budget?.type === 'per_property' ? 'per property' : 'total portfolio'})
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Preferred Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prefData.locations?.length > 0 ? (
            <div className="space-y-3">
              {prefData.locations.map((location: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{location.city}</p>
                  {location.areas?.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Areas: {location.areas.join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Within {location.radius} miles
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No location preferences set</p>
          )}
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prefData.availability?.immediate ? (
            <Badge className="bg-green-100 text-green-800">
              Looking for immediate availability
            </Badge>
          ) : prefData.availability?.available_from ? (
            <p>
              Available from: {new Date(prefData.availability.available_from).toLocaleDateString()}
            </p>
          ) : (
            <p className="text-gray-500">No availability preferences set</p>
          )}
        </CardContent>
      </Card>

      {/* Additional Preferences */}
      {prefData.additional_preferences?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {prefData.additional_preferences.map((pref: string, index: number) => (
                <Badge key={index} variant="outline" className="capitalize">
                  {pref.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
