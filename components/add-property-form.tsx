"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, ChevronRight, Upload, X, Home, FileText, Camera, CheckCircle, MapPin, Bed, Bath, PoundSterling, AlertCircle, Loader2 } from "lucide-react"
import { ImageReorder } from './image-reorder'
import { FormProgressBar } from './form-progress-bar'
import { useRouter } from "next/navigation"
import Image from "next/image"

interface PropertyFormData {
  // Basic Info
  availability: string
  propertyType: string
  propertyLicence?: string
  propertyCondition: string
  address: string
  city: string
  state: string
  postcode: string
  monthlyRent: string
  availableDate: string

  // Details
  bedrooms: string
  bathrooms: string
  description: string
  amenities: string[]

  // Block-specific fields
  numberOfUnits?: string
  totalFloors?: string

  // Photos
  photos: (File | string)[]
  primaryPhotoIndex: number
  noPhotosYet: boolean

  // Contact (optional)
  contactName?: string
  contactEmail?: string
  contactPhone?: string

  // Terms
  agreeToTerms: boolean
  confirmPropertyAccuracy: boolean
}

export function AddPropertyForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [formData, setFormData] = useState<PropertyFormData>({
    availability: "",
    propertyType: "",
    propertyLicence: "",
    propertyCondition: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    monthlyRent: "",
    availableDate: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
    amenities: [],
    numberOfUnits: "",
    totalFloors: "",
    photos: [],
    primaryPhotoIndex: 0,
    noPhotosYet: false,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    agreeToTerms: false,
    confirmPropertyAccuracy: false,
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const amenityOptions = [
    "Furnished",
    "Unfurnished",
    "Wheelchair access",
    "Pet-friendly",
    "Parking",
    "Gym",
    "Pool",
    "Balcony",
    "Dishwasher",
    "Air conditioning",
    "Elevator",
    "Concierge",
    "Garden access",
  ]

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }

      // Clear available date when vacant is selected
      if (field === 'availability' && value === 'vacant') {
        updated.availableDate = ''
      }

      // Clear photo errors when noPhotosYet is checked
      if (field === 'noPhotosYet' && value === true) {
        setFormErrors(prev => ({ ...prev, photos: '' }))
      }

      return updated
    })
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked ? [...formData.amenities, amenity] : formData.amenities.filter((a) => a !== amenity)
    handleInputChange("amenities", newAmenities)
  }

  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isDragOver, setIsDragOver] = useState(false)
  const [userToken, setUserToken] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [authTab, setAuthTab] = useState('signup')
  const [authLoading, setAuthLoading] = useState(false)
  const [pendingPropertyToken, setPendingPropertyToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auth form states
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    acceptedTerms: false
  })

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  const [authErrors, setAuthErrors] = useState<Record<string, string>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Get current user session on component mount
  useEffect(() => {
    // Generate session ID for tracking anonymous users
    if (!sessionId) {
      const newSessionId = crypto.randomUUID()
      setSessionId(newSessionId)
    }

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        setUserToken(session.access_token)
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
      }
    }
    getSession()
    
    // Listen for auth changes (but don't update if we're in the middle of submitting)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserToken(session?.access_token || null)
      setIsLoggedIn(!!session?.access_token)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Validate files first
    const maxFiles = 10
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    const errors: string[] = []
    
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name} is not a valid image type`)
        return false
      }
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large (max 10MB)`)
        return false
      }
      return true
    })

    if (formData.photos.length + validFiles.length > maxFiles) {
      errors.push(`Too many images. Maximum ${maxFiles} allowed`)
    }

    if (errors.length > 0) {
      setFormErrors(prev => ({ ...prev, photos: errors.join(', ') }))
      return
    } else {
      setFormErrors(prev => ({ ...prev, photos: '' }))
    }

    if (validFiles.length === 0) return

    setUploadingImages(true)
    setUploadProgress({})

    try {
      // Create FormData for upload
      const uploadFormData = new FormData()
      validFiles.forEach(file => {
        uploadFormData.append('images', file)
      })
      
      if (sessionId) {
        uploadFormData.append('sessionId', sessionId)
      }
      if (draftId) {
        uploadFormData.append('draftId', draftId)
      }

      // Upload images to API  
      const uploadOptions: RequestInit = {
        method: 'POST',
        body: uploadFormData
      }
      
      if (userToken) {
        uploadOptions.headers = {
          'Authorization': `Bearer ${userToken}`
        }
      }
      
      const response = await fetch('/api/properties/images/upload', uploadOptions)
      const result = await response.json()

      if (result.success) {
        // Full success case
        const imageUrls = result.images.map((img: any) => img.url)
        handleInputChange("photos", [...formData.photos, ...imageUrls])
      } else if (response.status === 207) {
        // Partial success case (207 Multi-Status)
        if (result.images && result.images.length > 0) {
          const imageUrls = result.images.map((img: any) => img.url)
          handleInputChange("photos", [...formData.photos, ...imageUrls])
        }
        if (result.successful && result.failed) {
          console.log(`Uploaded ${result.successful} image(s). ${result.failed} failed: ${result.errors?.join(', ')}`)
        } else {
          console.log(`Some images uploaded successfully`)
        }
      } else {
        // Full failure case
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error: any) {
      console.error('Error uploading images:', error)
      console.error('Failed to upload images: ' + error.message)
    } finally {
      setUploadingImages(false)
      setUploadProgress({})
      // Clear the input
      event.target.value = ''
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return
    
    // Create a fake event to reuse existing upload logic
    const fakeEvent = {
      target: { files, value: '' }
    } as any
    
    handlePhotoUpload(fakeEvent)
  }

  const removePhoto = async (index: number) => {
    const photoToRemove = formData.photos[index]
    
    // If it's a URL (uploaded image), delete from storage
    if (typeof photoToRemove === 'string' && photoToRemove.startsWith('http')) {
      try {
        const deleteHeaders: { [key: string]: string } = { 'Content-Type': 'application/json' }
        if (userToken) {
          deleteHeaders.Authorization = `Bearer ${userToken}`
        }

        const response = await fetch('/api/properties/images/delete', {
          method: 'DELETE',
          headers: deleteHeaders,
          body: JSON.stringify({
            imageUrls: [photoToRemove],
            sessionId,
            draftId
          })
        })

        const result = await response.json()
        if (!result.success) {
          console.error('Failed to delete image from storage:', result.error)
          // Continue with local removal even if storage deletion fails
        }
      } catch (error) {
        console.error('Error deleting image:', error)
        // Continue with local removal even if storage deletion fails
      }
    }

    const newPhotos = formData.photos.filter((_, i) => i !== index)
    handleInputChange("photos", newPhotos)
    if (formData.primaryPhotoIndex >= newPhotos.length) {
      handleInputChange("primaryPhotoIndex", Math.max(0, newPhotos.length - 1))
    }
  }

  // Save draft to API
  const saveDraft = async (step: number, stepData: any) => {
    try {
      setIsLoading(true)
      
      // Debug logging
      console.log(`Saving step ${step} with data:`, JSON.stringify(stepData, null, 2))
      
      const headers: { [key: string]: string } = { 'Content-Type': 'application/json' }
      if (userToken) {
        headers.Authorization = `Bearer ${userToken}`
      }
      
      const response = await fetch('/api/properties/draft', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          stepData,
          step,
          ...(sessionId ? { sessionId } : {})
        })
      })

      const result = await response.json()
      
      if (result.success) {
        if (!sessionId) {
          setSessionId(result.sessionId)
        }
        // Always update draftId to ensure we have the correct reference
        setDraftId(result.draft.id)
        console.log(`Step ${step} saved successfully, draftId: ${result.draft.id}`)
        return true
      } else {
        console.error('Failed to save draft:', result.error)
        if (result.details) {
          console.error('Validation details:', JSON.stringify(result.details, null, 2))
          console.error('Step data that failed:', JSON.stringify(stepData, null, 2))
        }
        console.error(`Failed to save step ${step}: ${result.error}${result.details ? '\nSee console for details' : ''}`)
        return false
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Get current step data based on step number
  const getCurrentStepData = (step: number) => {
    switch (step) {
      case 1:
        return {
          availability: formData.availability || '',
          propertyType: formData.propertyType || '',
          propertyLicence: formData.propertyLicence || '',
          bedrooms: formData.bedrooms || '',
          bathrooms: formData.bathrooms || '',
          monthlyRent: formData.monthlyRent || '',
          availableDate: formData.availability === 'vacant' ? 'immediate' : (formData.availableDate || ''),
          description: formData.description || '',
          amenities: formData.amenities || []
        }
      case 2:
        return {
          address: formData.address || '',
          city: formData.city || '',
          state: formData.state || '',
          postcode: formData.postcode || ''
        }
      case 3:
        return {
          photos: formData.photos.map(photo =>
            typeof photo === 'string' ? photo : URL.createObjectURL(photo)
          ),
          noPhotosYet: formData.noPhotosYet
        }
      case 4:
        return {
          contactName: formData.contactName || '',
          contactEmail: formData.contactEmail || '',
          contactPhone: formData.contactPhone || ''
        }
      default:
        return {}
    }
  }

  const nextStep = async () => {
    if (currentStep < totalSteps) {
      // Clear any previous errors
      setFormErrors({})
      
      // Save current step before moving to next
      const stepData = getCurrentStepData(currentStep)
      const saved = await saveDraft(currentStep, stepData)
      
      if (saved) {
        setCurrentStep(currentStep + 1)
      } else {
        setFormErrors({ general: 'Failed to save progress. Please try again.' })
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      // Clear any errors when going back
      setFormErrors({})
      setCurrentStep(currentStep - 1)
    }
  }

  const validateSignupForm = () => {
    const errors: Record<string, string> = {}

    if (!signupForm.email) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(signupForm.email)) errors.email = 'Invalid email format'

    if (!signupForm.password) errors.password = 'Password is required'
    else if (signupForm.password.length < 6) errors.password = 'Password must be at least 6 characters'

    if (!signupForm.confirmPassword) errors.confirmPassword = 'Please confirm your password'
    else if (signupForm.password !== signupForm.confirmPassword) errors.confirmPassword = 'Passwords do not match'

    if (!signupForm.firstName) errors.firstName = 'First name is required'
    if (!signupForm.lastName) errors.lastName = 'Last name is required'
    if (!signupForm.acceptedTerms) errors.acceptedTerms = 'You must accept the terms and conditions'

    setAuthErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateLoginForm = () => {
    const errors: Record<string, string> = {}

    if (!loginForm.email) errors.email = 'Email is required'
    if (!loginForm.password) errors.password = 'Password is required'

    setAuthErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateSignupForm()) return

    setAuthLoading(true)
    setIsSubmitting(true)
    setAuthErrors({})

    try {
      // First create a pending property if we don't have one
      let propertyToken = pendingPropertyToken
      
      if (!propertyToken) {
        // Create pending property from form data
        const pendingResponse = await fetch('/api/properties/create-pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyData: {
              availability: formData.availability,
              propertyType: formData.propertyType,
              propertyLicence: formData.propertyLicence,
              propertyCondition: formData.propertyCondition,
              bedrooms: formData.bedrooms,
              bathrooms: formData.bathrooms,
              monthlyRent: formData.monthlyRent,
              availableDate: formData.availableDate,
              description: formData.description,
              amenities: formData.amenities,
              address: formData.address,
              city: formData.city,
              county: formData.state,
              postcode: formData.postcode,
              photos: formData.photos.filter(photo => typeof photo === 'string') // Only include uploaded photo URLs
            },
            contactInfo: {
              contactName: signupForm.firstName + ' ' + signupForm.lastName,
              contactEmail: signupForm.email,
              contactPhone: signupForm.phone
            }
          })
        })
        
        const pendingResult = await pendingResponse.json()
        
        if (pendingResult.success) {
          propertyToken = pendingResult.pendingPropertyToken
          setPendingPropertyToken(propertyToken)
        } else {
          throw new Error(pendingResult.error || 'Failed to create pending property')
        }
      }

      // Now create account using our new API
      const response = await fetch('/api/auth/signup-and-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupForm.email,
          password: signupForm.password,
          firstName: signupForm.firstName,
          lastName: signupForm.lastName,
          phone: signupForm.phone,
          pendingPropertyToken: propertyToken,
          acceptedTerms: true
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      if (data.success && data.session) {
        // Set the session in Supabase client - this is critical!
        await supabase.auth.setSession({
          access_token: data.session.accessToken,
          refresh_token: data.session.refreshToken
        })

        // Also store in localStorage as backup
        localStorage.setItem('accessToken', data.session.accessToken)
        localStorage.setItem('refreshToken', data.session.refreshToken)

        // Now publish the property (don't update local state since we're navigating away)
        const publishResponse = await fetch('/api/properties/publish', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.session.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pendingPropertyToken: propertyToken
          })
        })

        const publishResult = await publishResponse.json()

        if (publishResult.success) {
          // Use hard navigation to ensure session is fully loaded on dashboard
          window.location.href = '/landlord/dashboard'
        } else {
          // Only update state on error so user can see the error message
          setIsLoggedIn(true)
          setUserToken(data.session.accessToken)
          setAuthErrors({ general: 'Account created but failed to publish property: ' + publishResult.error })
        }
      }

    } catch (error: any) {
      console.error('Signup error:', error)
      setAuthErrors({ general: error.message })
      setIsSubmitting(false)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateLoginForm()) return

    setAuthLoading(true)
    setIsSubmitting(true)
    setAuthErrors({})

    try {
      // First create a pending property if we don't have one
      let propertyToken = pendingPropertyToken
      
      if (!propertyToken) {
        // Create pending property from form data
        const pendingResponse = await fetch('/api/properties/create-pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyData: {
              availability: formData.availability,
              propertyType: formData.propertyType,
              propertyLicence: formData.propertyLicence,
              propertyCondition: formData.propertyCondition,
              bedrooms: formData.bedrooms,
              bathrooms: formData.bathrooms,
              monthlyRent: formData.monthlyRent,
              availableDate: formData.availableDate,
              description: formData.description,
              amenities: formData.amenities,
              address: formData.address,
              city: formData.city,
              county: formData.state,
              postcode: formData.postcode,
              photos: formData.photos.filter(photo => typeof photo === 'string') // Only include uploaded photo URLs
            },
            contactInfo: {
              contactName: formData.contactName || loginForm.email, // Use form data or email as fallback
              contactEmail: formData.contactEmail || loginForm.email,
              contactPhone: formData.contactPhone || ''
            }
          })
        })
        
        const pendingResult = await pendingResponse.json()
        
        if (pendingResult.success) {
          propertyToken = pendingResult.pendingPropertyToken
          setPendingPropertyToken(propertyToken)
        } else {
          throw new Error(pendingResult.error || 'Failed to create pending property')
        }
      }

      // Now login using our new API
      const response = await fetch('/api/auth/login-and-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
          pendingPropertyToken: propertyToken
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      if (data.success && data.session) {
        // Set the session in Supabase client - this is critical!
        await supabase.auth.setSession({
          access_token: data.session.accessToken,
          refresh_token: data.session.refreshToken
        })

        // Also store in localStorage as backup
        localStorage.setItem('accessToken', data.session.accessToken)
        localStorage.setItem('refreshToken', data.session.refreshToken)

        // Now publish the property (don't update local state since we're navigating away)
        const publishResponse = await fetch('/api/properties/publish', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.session.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pendingPropertyToken: propertyToken
          })
        })

        const publishResult = await publishResponse.json()

        if (publishResult.success) {
          // Use hard navigation to ensure session is fully loaded on dashboard
          window.location.href = '/landlord/dashboard'
        } else {
          // Only update state on error so user can see the error message
          setIsLoggedIn(true)
          setUserToken(data.session.accessToken)
          setAuthErrors({ general: 'Logged in but failed to publish property: ' + publishResult.error })
        }
      }

    } catch (error: any) {
      console.error('Login error:', error)
      setAuthErrors({ general: error.message })
      setIsSubmitting(false)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      
      // Validate that all required fields are filled before proceeding
      const requiredFields = [
        { field: 'availability', label: 'Availability' },
        { field: 'propertyType', label: 'Property Type' },
        { field: 'propertyLicence', label: 'Property Licence' },
        { field: 'propertyCondition', label: 'Property Condition' },
        { field: 'monthlyRent', label: 'Monthly Rent' },
        { field: 'description', label: 'Description' },
        { field: 'address', label: 'Address' },
        { field: 'city', label: 'City' },
        { field: 'postcode', label: 'Postcode' }
      ]

      // Add bedrooms/bathrooms for non-Block properties
      if (formData.propertyType !== 'Block') {
        requiredFields.push({ field: 'bedrooms', label: 'Bedrooms' })
        requiredFields.push({ field: 'bathrooms', label: 'Bathrooms' })
      }

      // Add Block-specific required fields
      if (formData.propertyType === 'Block') {
        requiredFields.push({ field: 'numberOfUnits', label: 'Number of Units/Flats' })
      }

      // Only require available date if tenanted or upcoming
      if (formData.availability === 'tenanted' || formData.availability === 'upcoming') {
        requiredFields.push({ field: 'availableDate', label: 'Available Date' })
      }
      
      const missingFields = requiredFields.filter(req => !formData[req.field as keyof typeof formData])
      
      if (missingFields.length > 0) {
        setFormErrors(prev => ({ 
          ...prev, 
          general: `Please fill in the following required fields: ${missingFields.map(f => f.label).join(', ')}`
        }))
        return
      }
      
      if (formData.photos.length === 0 && !formData.noPhotosYet) {
        setFormErrors(prev => ({
          ...prev,
          photos: 'Please add at least one photo of your property or check the box below if you don\'t have photos yet'
        }))
        return
      }
      
      // Clear any previous errors
      setFormErrors({})
      
      // Ensure all steps are saved before publishing
      console.log('Saving all steps before publishing...')
      
      // Save each step sequentially
      for (let step = 1; step <= 4; step++) {
        const stepData = getCurrentStepData(step)
        console.log(`Saving step ${step}:`, stepData)
        const saved = await saveDraft(step, stepData)
        if (!saved) {
          setFormErrors(prev => ({ 
            ...prev, 
            general: `Failed to save step ${step}. Please check all required fields and try again.`
          }))
          return
        }
      }
      
      console.log('All steps saved successfully. Proceeding with publish...')
      
      // Check if user is authenticated
      if (isLoggedIn && userToken) {
        // User is authenticated, try to publish directly with new API
        console.log('Publishing as authenticated user with token')
        
        // For authenticated users, we need a pending property token
        let propertyToken = pendingPropertyToken
        
        if (!propertyToken) {
          // Create pending property from form data
          const pendingResponse = await fetch('/api/properties/create-pending', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              propertyData: {
                availability: formData.availability,
              propertyType: formData.propertyType,
                bedrooms: formData.bedrooms,
                bathrooms: formData.bathrooms,
                monthlyRent: formData.monthlyRent,
                availableDate: formData.availableDate,
                description: formData.description,
                amenities: formData.amenities,
                address: formData.address,
                city: formData.city,
                county: formData.state,
                postcode: formData.postcode,
                photos: formData.photos.filter(photo => typeof photo === 'string') // Only include uploaded photo URLs
              },
              contactInfo: {
                contactName: formData.contactName || '',
                contactEmail: formData.contactEmail || '',
                contactPhone: formData.contactPhone || ''
              }
            })
          })
          
          const pendingResult = await pendingResponse.json()
          
          if (pendingResult.success) {
            propertyToken = pendingResult.pendingPropertyToken
            setPendingPropertyToken(propertyToken)
          } else {
            throw new Error(pendingResult.error || 'Failed to create pending property')
          }
        }
        
        // Now publish with auth token
        console.log('Sending publish request with token:', propertyToken)
        console.log('Using auth token:', userToken)
        
        const publishResponse = await fetch('/api/properties/publish', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pendingPropertyToken: propertyToken
          })
        })

        console.log('Publish response status:', publishResponse.status)
        console.log('Publish response ok:', publishResponse.ok)

        if (!publishResponse.ok) {
          const errorText = await publishResponse.text()
          console.error('Publish response error text:', errorText)
          throw new Error(`HTTP ${publishResponse.status}: ${errorText}`)
        }

        const publishResult = await publishResponse.json()
        console.log('Publish response:', publishResult)

        if (publishResult.success) {
          // Use hard navigation to ensure session is fully loaded on dashboard
          window.location.href = '/landlord/dashboard'
        } else {
          console.error('Failed to publish property:', publishResult)
          alert(`Failed to publish property: ${publishResult.error}\nDetails: ${publishResult.details || 'No additional details'}\nCode: ${publishResult.code || 'Unknown'}`)
        }
      } else {
        // User is not authenticated, use old flow to create pending property
        console.log('Publishing without authentication - creating pending property')
        
        const publishHeaders: { [key: string]: string } = { 'Content-Type': 'application/json' }
        
        const publishPayload = {
          ...(sessionId ? { sessionId } : {}),
          ...(draftId ? { draftId } : {}),
          contactInfo: {
            contactName: formData.contactName || '',
            contactEmail: formData.contactEmail || '',
            contactPhone: formData.contactPhone || ''
          }
        }
        
        console.log('Publish payload:', publishPayload)
        
        const response = await fetch('/api/properties/publish', {
          method: 'POST',
          headers: publishHeaders,
          body: JSON.stringify(publishPayload)
        })

        const result = await response.json()

        if (result.success) {
          // Use hard navigation to ensure session is fully loaded on dashboard
          window.location.href = '/landlord/dashboard'
        } else if (result.status === 'signup_required') {
          // Store the pending property token for later use in authentication
          setPendingPropertyToken(result.pendingPropertyToken)
          // The authentication section is already visible on this page for non-logged-in users
          console.log('Your property has been saved. Please create an account or sign in below to complete publishing.')
        } else if (result.requiresSignup) {
          console.log(`${result.message}\n\nYour property draft has been saved. Please sign up to continue.`)
          // Optionally redirect to signup with draft ID
          router.push(`/auth/signup?draftId=${result.draftId}`)
        } else if (result.requiresConversion) {
          console.log(`${result.message}\n\nWould you like to convert your account to a landlord account?`)
          // Optionally redirect to conversion
          router.push('/auth/convert-to-landlord')
        } else {
          console.error('Failed to publish property:', result)
          alert(`Failed to publish property: ${result.error}\nDetails: ${result.details || 'No additional details'}`)
        }
      }
    } catch (error) {
      console.error('Error publishing property:', error)
      console.error('An error occurred while publishing. Your draft has been saved.')
    } finally {
      setIsLoading(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        const step1Valid = (
          formData.propertyType &&
          formData.bedrooms &&
          formData.bathrooms &&
          formData.description &&
          formData.monthlyRent
        )
        // Only require available date if tenanted or upcoming
        const availableDateValid = (formData.availability === 'vacant') ||
          (formData.availability && formData.availableDate)
        return step1Valid && availableDateValid
      case 2:
        return formData.address && formData.city && formData.postcode
      case 3:
        return formData.photos.length > 0 || formData.noPhotosYet
      case 4:
        // Only require confirmPropertyAccuracy checkbox when user is logged in
        return isLoggedIn === true ? formData.confirmPropertyAccuracy : true
      default:
        return false
    }
  }

  return (
    <div className="space-y-4 [&>*_label:not(.mb-0)]:mb-3 [&>*_label:not(.mb-0)]:block">
      {/* Progress Bar */}
      <FormProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        steps={[
          { label: 'Basic Info' },
          { label: 'Address' },
          { label: 'Photos' },
          { label: 'Review' }
        ]}
      />

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 1 && (
              <>
                <Home className="h-5 w-5 text-accent" />
                Basic Information
              </>
            )}
            {currentStep === 2 && (
              <>
                <Home className="h-5 w-5 text-accent" />
                Property Address
              </>
            )}
            {currentStep === 3 && (
              <>
                <Camera className="h-5 w-5 text-accent" />
                Photos
              </>
            )}
            {currentStep === 4 && (
              <>
                <CheckCircle className="h-5 w-5 text-accent" />
                Review & Publish
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Availability and Available Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="availability">Availability *</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) => handleInputChange("availability", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacant">Vacant</SelectItem>
                      <SelectItem value="tenanted">Tenanted</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
{(formData.availability === 'tenanted' || formData.availability === 'upcoming') && (
                  <div>
                    <Label htmlFor="availableDate">Available Date *</Label>
                    <Input
                      id="availableDate"
                      type="date"
                      value={formData.availableDate}
                      onChange={(e) => handleInputChange("availableDate", e.target.value)}
                    />
                  </div>
                )}
                <div></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => handleInputChange("propertyType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Flat">Flat</SelectItem>
                      <SelectItem value="Block">Block</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="propertyLicence">Property Licence *</Label>
                  <Select
                    value={formData.propertyLicence || ""}
                    onValueChange={(value) => handleInputChange("propertyLicence", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select licence type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Licence Required</SelectItem>
                      <SelectItem value="hmo">HMO Licence</SelectItem>
                      <SelectItem value="c2">C2 Licence</SelectItem>
                      <SelectItem value="selective">Selective Licence</SelectItem>
                      <SelectItem value="additional">Additional Licence</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div></div>
              </div>

              {formData.propertyType !== "Block" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms *</Label>
                    <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Studio</SelectItem>
                        <SelectItem value="1">1 Bedroom</SelectItem>
                        <SelectItem value="2">2 Bedrooms</SelectItem>
                        <SelectItem value="3">3 Bedrooms</SelectItem>
                        <SelectItem value="4">4+ Bedrooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Bathrooms *</Label>
                    <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange("bathrooms", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Bathroom</SelectItem>
                        <SelectItem value="1.5">1.5 Bathrooms</SelectItem>
                        <SelectItem value="2">2 Bathrooms</SelectItem>
                        <SelectItem value="2.5">2.5 Bathrooms</SelectItem>
                        <SelectItem value="3">3+ Bathrooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {formData.propertyType === "Block" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="numberOfUnits">Number of Units/Flats *</Label>
                    <Input
                      id="numberOfUnits"
                      type="number"
                      min="1"
                      placeholder="e.g., 10"
                      value={formData.numberOfUnits}
                      onChange={(e) => handleInputChange("numberOfUnits", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalFloors">Total Floors</Label>
                    <Input
                      id="totalFloors"
                      type="number"
                      min="1"
                      placeholder="e.g., 5"
                      value={formData.totalFloors}
                      onChange={(e) => handleInputChange("totalFloors", e.target.value)}
                    />
                  </div>
                  <div></div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="propertyCondition">Property Condition *</Label>
                  <Select
                    value={formData.propertyCondition || ""}
                    onValueChange={(value) => handleInputChange("propertyCondition", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="newly-renovated">Newly Renovated</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="needs-work">Needs Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="monthlyRent">Monthly Rent *</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    value={formData.monthlyRent}
                    onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
                    placeholder="2500"
                  />
                </div>
              </div>

              <div>
                <Label>Features</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {amenityOptions.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center space-x-3 px-3 py-2 border rounded-md cursor-pointer transition-colors"
                      onClick={() => handleAmenityChange(amenity, !formData.amenities.includes(amenity))}
                    >
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label htmlFor={amenity} className="text-sm font-normal cursor-pointer flex-1 mb-0">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Property Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your property, highlighting key features and amenities..."
                  rows={8}
                  className="min-h-[150px] resize-y"
                />
              </div>
            </div>
          )}

          {/* Step 2: Property Address */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Property Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="123 High Street, Apartment 4B"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City/Town *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="London"
                  />
                </div>
                <div>
                  <Label htmlFor="state">County</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Greater London">Greater London</SelectItem>
                      <SelectItem value="West Midlands">West Midlands</SelectItem>
                      <SelectItem value="Greater Manchester">Greater Manchester</SelectItem>
                      <SelectItem value="West Yorkshire">West Yorkshire</SelectItem>
                      <SelectItem value="Merseyside">Merseyside</SelectItem>
                      <SelectItem value="South Yorkshire">South Yorkshire</SelectItem>
                      <SelectItem value="Tyne and Wear">Tyne and Wear</SelectItem>
                      <SelectItem value="Essex">Essex</SelectItem>
                      <SelectItem value="Kent">Kent</SelectItem>
                      <SelectItem value="Hampshire">Hampshire</SelectItem>
                      <SelectItem value="Surrey">Surrey</SelectItem>
                      <SelectItem value="Hertfordshire">Hertfordshire</SelectItem>
                      <SelectItem value="Berkshire">Berkshire</SelectItem>
                      <SelectItem value="Buckinghamshire">Buckinghamshire</SelectItem>
                      <SelectItem value="East Sussex">East Sussex</SelectItem>
                      <SelectItem value="West Sussex">West Sussex</SelectItem>
                      <SelectItem value="Oxfordshire">Oxfordshire</SelectItem>
                      <SelectItem value="Cambridgeshire">Cambridgeshire</SelectItem>
                      <SelectItem value="Suffolk">Suffolk</SelectItem>
                      <SelectItem value="Norfolk">Norfolk</SelectItem>
                      <SelectItem value="Bedfordshire">Bedfordshire</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="postcode">Postcode *</Label>
                <Input
                  id="postcode"
                  value={formData.postcode}
                  onChange={(e) => handleInputChange("postcode", e.target.value)}
                  placeholder="SW1A 1AA"
                  className="uppercase"
                />
              </div>
            </div>
          )}

          {/* Step 3: Photos */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {formData.photos.length > 0 && (
                <ImageReorder
                  images={formData.photos}
                  primaryImageIndex={formData.primaryPhotoIndex}
                  onImagesReorder={(newImages) => handleInputChange("photos", newImages)}
                  onPrimaryImageChange={(index) => handleInputChange("primaryPhotoIndex", index)}
                  onImageRemove={removePhoto}
                  disabled={uploadingImages}
                />
              )}

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  formData.noPhotosYet
                    ? 'border-gray-200 bg-slate-50 opacity-50'
                    : isDragOver
                      ? 'border-accent bg-accent/10'
                      : 'border-muted-foreground/25 hover:border-accent/50'
                }`}
                onDragOver={formData.noPhotosYet ? undefined : handleDragOver}
                onDragLeave={formData.noPhotosYet ? undefined : handleDragLeave}
                onDrop={formData.noPhotosYet ? undefined : handleDrop}
              >
                <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors ${
                  isDragOver ? 'text-accent' : 'text-muted-foreground'
                }`} />
                <h3 className="text-lg font-semibold mb-2">
                  {isDragOver ? 'Drop Photos Here' : 'Upload Property Photos'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isDragOver
                    ? 'Release to upload your images'
                    : 'Drag and drop images here, or click to browse. Maximum 10 images, 10MB each. Supported formats: JPEG, PNG, WebP.'
                  }
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploadingImages || formData.photos.length >= 10 || formData.noPhotosYet}
                />
                <div className="flex justify-center">
                  <Label htmlFor="photo-upload">
                    <Button
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      asChild
                      disabled={uploadingImages || formData.photos.length >= 10 || formData.noPhotosYet}
                    >
                      <span>
                        {uploadingImages ? 'Uploading...' : formData.photos.length >= 10 ? 'Maximum reached' : 'Choose Photos'}
                      </span>
                    </Button>
                  </Label>
                </div>
                {uploadingImages && (
                  <div className="mt-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Uploading images...</p>
                  </div>
                )}

                {formErrors.photos && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
                      <p className="text-sm text-red-700">{formErrors.photos}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-md border border-muted-foreground/20 hover:bg-slate-100 transition-colors">
                <Checkbox
                  id="noPhotosYet"
                  checked={formData.noPhotosYet}
                  onCheckedChange={(checked) => handleInputChange("noPhotosYet", checked as boolean)}
                  className="border border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="noPhotosYet"
                    className="text-sm font-medium cursor-pointer mb-0 leading-tight"
                  >
                    I don't have photos at the moment
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1 leading-tight">
                    You can add photos later after your property is listed
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Publish */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {formErrors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                    <p className="text-sm text-red-700">{formErrors.general}</p>
                  </div>
                </div>
              )}
              
              {formErrors.photos && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                    <p className="text-sm text-red-700">{formErrors.photos}</p>
                  </div>
                </div>
              )}
              
              <div className="rounded-lg px-4 py-4 border">
                <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">Property Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    {formData.photos.length > 0 ? (
                      <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                        <Image
                          src={typeof formData.photos[formData.primaryPhotoIndex] === 'string'
                            ? formData.photos[formData.primaryPhotoIndex] as string
                            : URL.createObjectURL(formData.photos[formData.primaryPhotoIndex] as File)}
                          alt={`${formData.propertyType} in ${formData.city}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video relative rounded-lg overflow-hidden mb-4 bg-slate-100 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <Camera className="h-16 w-16 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No photos yet</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">{formData.address.replace(/^\d+\s*/, '')}, {formData.city.charAt(0).toUpperCase() + formData.city.slice(1).toLowerCase()}, {(formData.postcode?.split(' ')[0] || formData.postcode).toUpperCase()}</h3>
                      <div className="text-lg font-semibold text-accent mt-1">
                        £{Number.parseInt(formData.monthlyRent || "0").toLocaleString()} pcm
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge 
                          variant={
                            formData.availability === 'vacant' ? 'default' : 
                            formData.availability === 'tenanted' ? 'destructive' : 
                            formData.availability === 'upcoming' ? 'default' :
                            'secondary'
                          }
                          className={`text-xs font-semibold ${
                            formData.availability === 'vacant' ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 
                            formData.availability === 'upcoming' ? 'bg-orange-500 text-white hover:bg-orange-600' : ''
                          }`}
                        >
                          {formData.availability === 'vacant' ? 'Vacant' :
                           formData.availability === 'tenanted' ? 'Tenanted' :
                           formData.availability === 'upcoming' ? 'Upcoming' :
                           'Available'}
                        </Badge>
                        {(() => {
                          const getLicenceDisplay = (licence: string) => {
                            switch (licence) {
                              case 'hmo': return 'HMO Licence'
                              case 'c2': return 'C2 Licence'
                              case 'selective': return 'Selective Licence'
                              case 'additional': return 'Additional Licence'
                              case 'other': return 'Licensed'
                              case 'none': return null
                              default: return null
                            }
                          }
                          
                          const licenceDisplay = getLicenceDisplay(formData.propertyLicence);
                          
                          if (!licenceDisplay) {
                            return null;
                          }
                          
                          return (
                            <Badge className="text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                              {licenceDisplay}
                            </Badge>
                          );
                        })()}
                        
                        {(() => {
                          const getConditionDisplay = (condition: string) => {
                            switch (condition) {
                              case 'excellent': return 'Excellent'
                              case 'newly-renovated': return 'Newly Renovated'
                              case 'good': return 'Good'
                              case 'fair': return 'Fair'
                              case 'needs-work': return 'Needs Work'
                              default: return null
                            }
                          }
                          
                          const conditionDisplay = getConditionDisplay(formData.propertyCondition);
                          
                          if (!conditionDisplay) {
                            return null;
                          }
                          
                          return (
                            <Badge className="text-xs font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300">
                              {conditionDisplay}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <span className="capitalize">{formData.propertyType}</span>
                      </div>
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span className="text-sm">{formData.bedrooms} bed</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        <span className="text-sm">{formData.bathrooms} bath</span>
                      </div>
                    </div>


                    <div className="space-y-2 text-sm">
                      {formData.availability !== 'vacant' && formData.availableDate && (
                        <div><strong>Available Date:</strong> {new Date(formData.availableDate).toLocaleDateString()}</div>
                      )}
                      <div><strong>Features:</strong> {formData.amenities.length > 0 ? formData.amenities.join(', ') : 'None selected'}</div>
                    </div>

                    {formData.description && (
                      <div className="mt-4">
                        <strong className="text-sm">Description:</strong>
                        <div className="mt-1">
                          <p className={`text-sm text-muted-foreground ${formData.description.length > 200 ? (showFullDescription ? '' : 'line-clamp-3') : ''}`}>
                            {formData.description}
                          </p>
                          {formData.description.length > 200 && (
                            <button
                              onClick={() => setShowFullDescription(!showFullDescription)}
                              className="text-xs text-primary hover:underline mt-1"
                            >
                              {showFullDescription ? 'See less' : 'See more'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submitting State - Show while publishing */}
              {isSubmitting && (
                <div className="rounded-lg px-4 py-4 border border-accent/30 bg-accent/5">
                  <div className="flex items-center justify-center gap-3 p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    <div className="text-center">
                      <p className="font-medium text-lg">Publishing Your Property...</p>
                      <p className="text-sm text-muted-foreground mt-1">Please wait while we process your listing</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Property Accuracy Confirmation - Show only when logged in and not submitting */}
              {(isLoggedIn === true && !isSubmitting) && (
                <div className="rounded-lg px-4 py-4 border">
                  <div className="flex items-center space-x-3 p-3 rounded-md border border-muted-foreground/20 hover:bg-slate-100 transition-colors">
                    <Checkbox
                      id="property-accuracy"
                      checked={formData.confirmPropertyAccuracy}
                      onCheckedChange={(checked) => handleInputChange("confirmPropertyAccuracy", checked as boolean)}
                      className="border border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="property-accuracy" className="text-sm font-medium cursor-pointer flex-1 leading-tight mb-0">
                      I confirm that all property information provided is accurate and complete
                    </Label>
                  </div>
                </div>
              )}

              {/* Auth Section - Show only if user is not logged in and not submitting */}
              {(isLoggedIn === false && !isSubmitting) && (
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle>Create Your Account to Publish</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={authTab} onValueChange={setAuthTab}>
                      <TabsList className="grid w-full grid-cols-2 bg-muted/15 p-1">
                        <TabsTrigger value="signup" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Create Account</TabsTrigger>
                        <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Log In</TabsTrigger>
                      </TabsList>

                      <TabsContent value="signup" className="space-y-4 mt-6">
                        <form onSubmit={handleSignup} className="space-y-4">
                          {authErrors.general && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{authErrors.general}</AlertDescription>
                            </Alert>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name *</Label>
                              <Input
                                id="firstName"
                                value={signupForm.firstName}
                                onChange={(e) => setSignupForm(prev => ({ ...prev, firstName: e.target.value }))}
                                className={authErrors.firstName ? 'border-red-500' : ''}
                              />
                              {authErrors.firstName && (
                                <p className="text-sm text-red-500 mt-1">{authErrors.firstName}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name *</Label>
                              <Input
                                id="lastName"
                                value={signupForm.lastName}
                                onChange={(e) => setSignupForm(prev => ({ ...prev, lastName: e.target.value }))}
                                className={authErrors.lastName ? 'border-red-500' : ''}
                              />
                              {authErrors.lastName && (
                                <p className="text-sm text-red-500 mt-1">{authErrors.lastName}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="signupEmail">Email *</Label>
                            <Input
                              id="signupEmail"
                              type="email"
                              value={signupForm.email}
                              onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                              className={authErrors.email ? 'border-red-500' : ''}
                            />
                            {authErrors.email && (
                              <p className="text-sm text-red-500 mt-1">{authErrors.email}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="signupPhone">Phone Number</Label>
                            <Input
                              id="signupPhone"
                              type="tel"
                              value={signupForm.phone}
                              onChange={(e) => setSignupForm(prev => ({ ...prev, phone: e.target.value }))}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="signupPassword">Password *</Label>
                              <Input
                                id="signupPassword"
                                type="password"
                                value={signupForm.password}
                                onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                                className={authErrors.password ? 'border-red-500' : ''}
                              />
                              {authErrors.password && (
                                <p className="text-sm text-red-500 mt-1">{authErrors.password}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="confirmPassword">Confirm Password *</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={signupForm.confirmPassword}
                                onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className={authErrors.confirmPassword ? 'border-red-500' : ''}
                              />
                              {authErrors.confirmPassword && (
                                <p className="text-sm text-red-500 mt-1">{authErrors.confirmPassword}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 rounded-md border border-muted-foreground/20 hover:bg-slate-100 transition-colors">
                            <Checkbox
                              id="terms"
                              checked={signupForm.acceptedTerms}
                              onCheckedChange={(checked) => setSignupForm(prev => ({ ...prev, acceptedTerms: checked as boolean }))}
                              className={`border data-[state=checked]:bg-primary data-[state=checked]:border-primary ${authErrors.acceptedTerms ? 'border-red-500' : 'border-muted-foreground/40'}`}
                            />
                            <Label htmlFor="terms" className="text-sm font-medium cursor-pointer flex-1 leading-tight mb-0">
                              I agree to the Terms of Service and Privacy Policy, and confirm that all information provided is accurate
                            </Label>
                          </div>
                          {authErrors.acceptedTerms && (
                            <p className="text-sm text-red-500">{authErrors.acceptedTerms}</p>
                          )}

                          <Button type="submit" className="w-full h-11" disabled={authLoading}>
                            {authLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating Account & Publishing...
                              </>
                            ) : (
                              'Create Account & Publish Property'
                            )}
                          </Button>
                        </form>
                      </TabsContent>

                      <TabsContent value="login" className="space-y-4 mt-6">
                        <form onSubmit={handleLogin} className="space-y-4">
                          {authErrors.general && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{authErrors.general}</AlertDescription>
                            </Alert>
                          )}

                          <div>
                            <Label htmlFor="loginEmail">Email *</Label>
                            <Input
                              id="loginEmail"
                              type="email"
                              value={loginForm.email}
                              onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                              className={authErrors.email ? 'border-red-500' : ''}
                            />
                            {authErrors.email && (
                              <p className="text-sm text-red-500 mt-1">{authErrors.email}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="loginPassword">Password *</Label>
                            <Input
                              id="loginPassword"
                              type="password"
                              value={loginForm.password}
                              onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                              className={authErrors.password ? 'border-red-500' : ''}
                            />
                            {authErrors.password && (
                              <p className="text-sm text-red-500 mt-1">{authErrors.password}</p>
                            )}
                          </div>

                          <Button type="submit" className="w-full h-11" disabled={authLoading}>
                            {authLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Logging In & Publishing...
                              </>
                            ) : (
                              'Login & Publish Property'
                            )}
                          </Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="bg-transparent">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentStep < totalSteps ? (
          <Button
            onClick={nextStep}
            disabled={!isStepValid() || isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? 'Saving...' : 'Next'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <>
            {isLoggedIn === true ? (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isLoading}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isLoading ? 'Publishing...' : 'Publish Property'}
              </Button>
            ) : (
              <div className="flex items-center justify-center px-4 py-2 bg-muted/30 rounded-md border border-dashed text-sm font-medium text-muted-foreground leading-none">
                Complete
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
