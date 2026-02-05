"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Save, RotateCcw, AlertTriangle, Settings } from "lucide-react"
import { OnboardingStep2 } from "@/components/onboarding/step-2"
import { OnboardingStep3 } from "@/components/onboarding/step-3"
import { supabase } from "@/lib/supabase"

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
  region: string
  city: string
  localAuthorities: string[]
}

interface Step3Data {
  locations: Location[]
  additionalPreferences: string
  availableFrom: Date | null
  immediateAvailability: boolean
}

interface PreferencesModalProps {
  onPreferencesUpdate?: () => void
}

export function PreferencesModal({ onPreferencesUpdate }: PreferencesModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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
    additionalPreferences: "",
    availableFrom: null,
    immediateAvailability: false
  })

  useEffect(() => {
    if (open) {
      fetchPreferences()
    }
  }, [open])


  const fetchPreferences = async () => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError("Authentication required")
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

      // First fetch current preferences to maintain business data
      const currentResponse = await fetch('/api/investor/preferences', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const currentResult = await currentResponse.json()
      const currentPrefs = currentResult.preferences

      const preferencesData = {
        // Keep existing business data
        operator_type: currentPrefs?.operator_type || "sa_operator",
        operator_type_other: currentPrefs?.operator_type_other,
        properties_managing: currentPrefs?.properties_managing || 0,
        // Update only property and location preferences
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
        
        // Call callback to refresh parent component
        if (onPreferencesUpdate) {
          onPreferencesUpdate()
        }
        
        // Close modal after a short delay
        setTimeout(() => {
          setOpen(false)
          setSuccess("")
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
    fetchPreferences() // Reload original data
    setError("")
    setSuccess("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Edit Preferences
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Preferences</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading preferences...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Error/Success Messages */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {success && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 text-green-700">
                    <Save className="h-5 w-5" />
                    <span>{success}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Form Sections */}
            <div className="space-y-6">
              {/* Property Preferences */}
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

              {/* Location & Availability */}
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
            <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t">
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
                <Button 
                  variant="ghost" 
                  disabled={isSaving}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
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
        )}
      </DialogContent>
    </Dialog>
  )
}