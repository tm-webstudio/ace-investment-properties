"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, CheckCircle } from "lucide-react"

interface PreferencesWidgetProps {
  preferences: {
    operator_type: string
    operator_type_other?: string
    properties_managing: number
    preference_data: {
      property_types: string[]
      bedrooms: { min: number; max: number }
      budget: { min: number; max: number; type: string }
      locations: Array<{ city: string; areas: string[]; radius: number }>
      additional_preferences: string[]
    }
    updated_at: string
  }
}

export function PreferencesWidget({ preferences }: PreferencesWidgetProps) {
  const formatOperatorType = (type: string, other?: string) => {
    switch (type) {
      case 'sa_operator': return 'SA Operator'
      case 'supported_living': return 'Supported/Assisted Living'
      case 'social_housing': return 'Social Housing/EA/TA'
      case 'other': return other || 'Other'
      default: return type
    }
  }

  const formatPropertyTypes = (types: string[]) => {
    return types.map(type => {
      switch (type) {
        case 'houses': return 'Houses'
        case 'flats': return 'Flats/Apartments'
        case 'hmo': return 'HMO'
        case 'studios': return 'Studios'
        case 'commercial': return 'Commercial to Residential'
        default: return type
      }
    }).join(', ')
  }

  const formatLocations = (locations: Array<{ city: string; areas: string[]; radius: number }>) => {
    if (!locations || locations.length === 0) return 'Not specified'
    return locations.map(loc => loc.city).join(', ')
  }

  const lastUpdated = new Date(preferences.updated_at).toLocaleDateString()

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Your Preferences</CardTitle>
        <Settings className="h-5 w-5 text-gray-500" />
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Operator Type */}
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm text-gray-700">
            {formatOperatorType(preferences.operator_type, preferences.operator_type_other)}
          </span>
        </div>

        {/* Bedrooms */}
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm text-gray-700">
            {preferences.preference_data.bedrooms.min === preferences.preference_data.bedrooms.max 
              ? `${preferences.preference_data.bedrooms.min} bedroom${preferences.preference_data.bedrooms.min !== 1 ? 's' : ''}`
              : `${preferences.preference_data.bedrooms.min}-${preferences.preference_data.bedrooms.max} bedrooms`
            }
          </span>
        </div>

        {/* Locations */}
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm text-gray-700 line-clamp-1">
            {formatLocations(preferences.preference_data.locations)}
          </span>
        </div>

        {/* Budget */}
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm text-gray-700">
            £{preferences.preference_data.budget.min.toLocaleString()}-£{preferences.preference_data.budget.max.toLocaleString()}/month
          </span>
        </div>

        {/* Property Types */}
        {preferences.preference_data.property_types && preferences.preference_data.property_types.length > 0 && (
          <div className="pt-2">
            <div className="text-xs text-gray-500 mb-1">Property types:</div>
            <div className="flex flex-wrap gap-1">
              {preferences.preference_data.property_types.slice(0, 2).map((type, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {formatPropertyTypes([type])}
                </Badge>
              ))}
              {preferences.preference_data.property_types.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{preferences.preference_data.property_types.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="pt-2 border-t">
          <div className="text-xs text-gray-500 mb-2">
            Last updated: {lastUpdated}
          </div>
          <Link href="/investor/preferences">
            <Button variant="outline" size="sm" className="w-full">
              Edit Preferences
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}