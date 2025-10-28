"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, X } from "lucide-react"
import { OnboardingStep1 } from "@/components/onboarding/step-1"
import { OnboardingStep2 } from "@/components/onboarding/step-2"
import { OnboardingStep3 } from "@/components/onboarding/step-3"
import { InvestorSignupStep4 } from "@/components/investor-signup/step-4"

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

interface Step4Data {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export default function InvestorSignup() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [error, setError] = useState("")
  const [draftId, setDraftId] = useState<string | null>(null)

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

  const [step4Data, setStep4Data] = useState<Step4Data>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  })

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft()
    }, 30000)

    return () => clearInterval(interval)
  }, [step1Data, step2Data, step3Data, step4Data])

  // Load draft on mount
  useEffect(() => {
    loadDraft()
  }, [])

  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem('investor-signup-draft')
      if (savedDraft) {
        const draft = JSON.parse(savedDraft)
        setStep1Data(draft.step1Data || step1Data)
        setStep2Data(draft.step2Data || step2Data)
        setStep3Data({
          ...draft.step3Data,
          availableFrom: draft.step3Data?.availableFrom ? new Date(draft.step3Data.availableFrom) : null
        } || step3Data)
        setStep4Data(draft.step4Data || step4Data)
        setCurrentStep(draft.currentStep || 1)
        setDraftId(draft.draftId || null)
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
  }

  const saveDraft = async () => {
    try {
      const draftData = {
        step1Data,
        step2Data,
        step3Data: {
          ...step3Data,
          availableFrom: step3Data.availableFrom?.toISOString()
        },
        step4Data: {
          ...step4Data,
          password: "", // Don't save password
          confirmPassword: ""
        },
        currentStep,
        draftId,
        lastSaved: new Date().toISOString()
      }
      
      localStorage.setItem('investor-signup-draft', JSON.stringify(draftData))
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }

  const clearDraft = () => {
    localStorage.removeItem('investor-signup-draft')
    setDraftId(null)
  }

  const handleSaveAndFinishLater = async () => {
    setIsSavingDraft(true)
    await saveDraft()
    setIsSavingDraft(false)
    router.push('/?message=Draft saved! You can continue your signup later.')
  }

  const handleStep1Change = (data: Partial<Step1Data>) => {
    setStep1Data(prev => ({ ...prev, ...data }))
  }

  const handleStep2Change = (data: Partial<Step2Data>) => {
    setStep2Data(prev => ({ ...prev, ...data }))
  }

  const handleStep3Change = (data: Partial<Step3Data>) => {
    setStep3Data(prev => ({ ...prev, ...data }))
  }

  const handleStep4Change = (data: Partial<Step4Data>) => {
    setStep4Data(prev => ({ ...prev, ...data }))
  }

  const validateStep1 = (): boolean => {
    if (!step1Data.operatorType) {
      setError("Please select your operator type")
      return false
    }
    if (step1Data.operatorType === "other" && !step1Data.operatorTypeOther) {
      setError("Please specify your operator type")
      return false
    }
    return true
  }

  const validateStep2 = (): boolean => {
    if (step2Data.propertyTypes.length === 0) {
      setError("Please select at least one property type")
      return false
    }
    if (step2Data.budgetMin >= step2Data.budgetMax) {
      setError("Maximum budget must be greater than minimum budget")
      return false
    }
    return true
  }

  const validateStep3 = (allowSkip = false): boolean => {
    if (allowSkip) {
      return true // Allow skipping Step 3
    }
    if (step3Data.locations.length === 0) {
      setError("Please add at least one location")
      return false
    }
    if (!step3Data.immediateAvailability && !step3Data.availableFrom) {
      setError("Please select when you need properties")
      return false
    }
    return true
  }

  const validateStep4 = (): boolean => {
    if (!step4Data.firstName || !step4Data.lastName || !step4Data.email || !step4Data.password || !step4Data.confirmPassword) {
      setError("All fields are required")
      return false
    }
    if (step4Data.password !== step4Data.confirmPassword) {
      setError("Passwords don't match")
      return false
    }
    if (step4Data.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }
    if (!step4Data.acceptTerms) {
      setError("Please accept the terms and conditions")
      return false
    }
    return true
  }

  const handleNext = () => {
    setError("")
    
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3)
      }
    } else if (currentStep === 3) {
      if (validateStep3()) {
        setCurrentStep(4)
      }
    } else if (currentStep === 4) {
      handleSignup()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError("")
    }
  }

  const handleSignup = async () => {
    if (!validateStep4()) return

    setIsLoading(true)
    setError("")

    try {
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
        }
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: step4Data.email,
          password: step4Data.password,
          first_name: step4Data.firstName,
          last_name: step4Data.lastName,
          user_type: 'investor',
          preferences: preferencesData
        }),
      })

      const data = await response.json()

      if (data.success) {
        clearDraft() // Clear the saved draft
        if (data.matchedProperties !== undefined) {
          router.push(`/auth/signin?message=Account created successfully! We found ${data.matchedProperties} properties matching your criteria. Please check your email for verification.`)
        } else {
          router.push('/auth/signin?message=Account created successfully! Please check your email for verification.')
        }
      } else {
        setError(data.error?.message || 'Failed to create account')
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError('Network error. Please check if the backend server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const progress = (currentStep / 4) * 100

  const stepTitles = {
    1: "About Your Business",
    2: "Property Preferences", 
    3: "Location & Availability",
    4: "Create Account"
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <Card className="mb-8 bg-gradient-to-r from-primary/5 via-primary/3 to-accent/5 border-primary/10">
            <CardHeader className="pb-4 pt-4">
              <p className="text-sm font-bold text-primary/70 uppercase tracking-wide mb-1">
                Investor Signup
              </p>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-1">
                Join as an Investor
              </h1>
              <p className="text-primary/70 text-lg">Tell us about your investment preferences and create your account</p>
            </CardHeader>
          </Card>

          {/* Progress */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Step {currentStep} of 4</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2 mb-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <div className={`${currentStep >= 1 ? 'text-primary font-medium' : ''}`}>
                  Business
                </div>
                <div className={`${currentStep >= 2 ? 'text-primary font-medium' : ''}`}>
                  Preferences
                </div>
                <div className={`${currentStep >= 3 ? 'text-primary font-medium' : ''}`}>
                  Location
                </div>
                <div className={`${currentStep >= 4 ? 'text-primary font-medium' : ''}`}>
                  Account
                </div>
              </div>
            </CardHeader>
          </Card>

        {/* Main Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{stepTitles[currentStep as keyof typeof stepTitles]}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {currentStep === 1 && (
              <OnboardingStep1
                data={step1Data}
                onChange={handleStep1Change}
              />
            )}

            {currentStep === 2 && (
              <OnboardingStep2
                data={step2Data}
                onChange={handleStep2Change}
              />
            )}

            {currentStep === 3 && (
              <OnboardingStep3
                data={step3Data}
                onChange={handleStep3Change}
              />
            )}

            {currentStep === 4 && (
              <InvestorSignupStep4
                data={step4Data}
                onChange={handleStep4Change}
              />
            )}
          </CardContent>
        </Card>


        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep === 3 ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setError("")
                  if (validateStep3(true)) {
                    setCurrentStep(4)
                  }
                }}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                Skip for now
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Account...
                </>
              ) : currentStep === 4 ? (
                "Create Account"
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Alternative Actions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in here
            </Link>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Are you a landlord?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Create landlord account
            </Link>
          </p>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}