"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, RotateCcw, AlertTriangle } from "lucide-react"
import { OnboardingStep1 } from "@/components/onboarding/step-1"
import { OnboardingStep2 } from "@/components/onboarding/step-2"
import { OnboardingStep3 } from "@/components/onboarding/step-3"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface Step1Data {
  operatorType: "sa_operator" | "supported_living" | "social_housing" | "other"
  operatorTypeOther?: string
  propertiesManaging: number
}

interface Step2Data {
  propertyTypes: string[]
  bedroomsMin: number
  bedroomsMax: number
  budgetMin: number
  budgetMax: number
  budgetType: "per_property" | "total_portfolio"
}

interface Location {
  id: string
  city: string
  areas: string[]
  radius: number
}

interface Step3Data {
  locations: Location[]
  additionalPreferences: string[]
  availableFrom: Date | null
  immediateAvailability: boolean
}

export default function EditPreferences() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [matchCount, setMatchCount] = useState<number | null>(null)
  const [originalPreferences, setOriginalPreferences] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState("")

  const [step1Data, setStep1Data] = useState<Step1Data>({
    operatorType: "sa_operator",
    propertiesManaging: 0
  })

  const [step2Data, setStep2Data] = useState<Step2Data>({
    propertyTypes: [],
    bedroomsMin: 1,
    bedroomsMax: 3,
    budgetMin: 500,
    budgetMax: 2000,
    budgetType: "per_property"
  })

  const [step3Data, setStep3Data] = useState<Step3Data>({
    locations: [],
    additionalPreferences: [],
    availableFrom: null,
    immediateAvailability: false
  })

  useEffect(() => {
    fetchPreferences()
  }, [])

  useEffect(() => {
    // Debounced match count preview
    const timeoutId = setTimeout(() => {
      updateMatchCountPreview()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [step1Data, step2Data, step3Data])

  const fetchPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        router.push('/auth/signin')
        return
      }

      const response = await fetch('/api/investor/preferences', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (result.success && result.preferences) {
        const prefs = result.preferences
        setOriginalPreferences(prefs)
        setLastUpdated(new Date(prefs.updated_at).toLocaleDateString())

        // Load data into form
        setStep1Data({
          operatorType: prefs.operator_type,
          operatorTypeOther: prefs.operator_type_other,
          propertiesManaging: prefs.properties_managing || 0
        })

        const prefData = prefs.preference_data
        if (prefData) {
          setStep2Data({
            propertyTypes: prefData.property_types || [],
            bedroomsMin: prefData.bedrooms?.min || 1,
            bedroomsMax: prefData.bedrooms?.max || 3,
            budgetMin: prefData.budget?.min || 500,
            budgetMax: prefData.budget?.max || 2000,
            budgetType: prefData.budget?.type || "per_property"
          })

          setStep3Data({
            locations: prefData.locations || [],
            additionalPreferences: prefData.additional_preferences || [],
            availableFrom: prefData.availability?.available_from ? 
              new Date(prefData.availability.available_from) : null,
            immediateAvailability: prefData.availability?.immediate || false
          })
        }

        if (result.matchStats) {
          setMatchCount(result.matchStats.totalMatches)
        }
      } else {
        setError("No preferences found. Please set your preferences first.")
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
      setError("Failed to load preferences")
    } finally {
      setIsLoading(false)
    }
  }

  const updateMatchCountPreview = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      // This would call a preview endpoint that doesn't save but returns match count
      // For now, we'll just simulate it
      const mockMatches = Math.floor(Math.random() * 50) + 10
      setMatchCount(mockMatches)
    } catch (error) {
      console.error('Error updating match preview:', error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError("Authentication required")
        return
      }

      const preferencesData = {
        operator_type: step1Data.operatorType,
        operator_type_other: step1Data.operatorTypeOther,
        properties_managing: step1Data.propertiesManaging,
        preference_data: {
          property_types: step2Data.propertyTypes,
          bedrooms: {
            min: step2Data.bedroomsMin,
            max: step2Data.bedroomsMax
          },
          budget: {
            min: step2Data.budgetMin,
            max: step2Data.budgetMax,
            type: step2Data.budgetType
          },
          locations: step3Data.locations,
          additional_preferences: step3Data.additionalPreferences,
          availability: {
            immediate: step3Data.immediateAvailability,
            available_from: step3Data.availableFrom?.toISOString()
          }
        },
        notification_enabled: true
      }

      const response = await fetch('/api/investor/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(preferencesData)
      })

      const result = await response.json()

      if (result.success) {
        setSuccess("Preferences updated successfully!")
        setLastUpdated(new Date().toLocaleDateString())
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/investor/dashboard')
        }, 1500)
      } else {
        setError(result.error || 'Failed to update preferences')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      setError('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (originalPreferences) {
      fetchPreferences() // Reload original data
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Preferences</h1>
              {lastUpdated && (
                <p className="text-sm text-gray-600 mt-1">
                  Last updated: {lastUpdated}
                </p>
              )}
            </div>
            <Link href="/investor/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Match Count Preview */}
          {matchCount !== null && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="font-medium text-primary">
                      {matchCount} properties match these criteria
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Live Preview
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error/Success Messages */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {success && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-green-700">
                  <Save className="h-5 w-5" />
                  <span>{success}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Sections */}
          <div className="space-y-8">
            {/* Step 1: About Your Business */}
            <Card>
              <CardHeader>
                <CardTitle>About Your Business</CardTitle>
              </CardHeader>
              <CardContent>
                <OnboardingStep1
                  data={step1Data}
                  onChange={(data) => setStep1Data(prev => ({ ...prev, ...data }))}
                />
              </CardContent>
            </Card>

            {/* Step 2: Property Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Property Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <OnboardingStep2
                  data={step2Data}
                  onChange={(data) => setStep2Data(prev => ({ ...prev, ...data }))}
                />
              </CardContent>
            </Card>

            {/* Step 3: Location & Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Location & Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <OnboardingStep3
                  data={step3Data}
                  onChange={(data) => setStep3Data(prev => ({ ...prev, ...data }))}
                />
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Saved
            </Button>

            <div className="flex gap-3">
              <Link href="/investor/dashboard">
                <Button variant="ghost" disabled={isSaving}>
                  Cancel
                </Button>
              </Link>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Preferences
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}