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
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Upload, X, Home, FileText, Camera, CheckCircle } from "lucide-react"
import { ImageReorder } from './image-reorder'
import { useRouter } from "next/navigation"

interface PropertyFormData {
  // Basic Info
  propertyType: string
  address: string
  city: string
  state: string
  postcode: string
  monthlyRent: string
  securityDeposit: string
  availableDate: string

  // Details
  bedrooms: string
  bathrooms: string
  description: string
  amenities: string[]

  // Photos
  photos: (File | string)[]
  primaryPhotoIndex: number

  // Contact (optional)
  contactName?: string
  contactEmail?: string
  contactPhone?: string

  // Terms
  agreeToTerms: boolean
}

export function AddPropertyForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<PropertyFormData>({
    propertyType: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    monthlyRent: "",
    securityDeposit: "",
    availableDate: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
    amenities: [],
    photos: [],
    primaryPhotoIndex: 0,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    agreeToTerms: false,
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const amenityOptions = [
    "Pet-friendly",
    "Parking",
    "Gym",
    "Pool",
    "Balcony",
    "In-unit laundry",
    "Dishwasher",
    "Air conditioning",
    "Heating",
    "Hardwood floors",
    "Carpet",
    "Tile floors",
    "Walk-in closet",
    "Storage unit",
    "Elevator",
    "Doorman",
    "Security system",
    "Garden access",
  ]

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked ? [...formData.amenities, amenity] : formData.amenities.filter((a) => a !== amenity)
    handleInputChange("amenities", newAmenities)
  }

  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isDragOver, setIsDragOver] = useState(false)
  const [userToken, setUserToken] = useState<string | null>(null)

  // Get current user session on component mount
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        setUserToken(session.access_token)
      }
    }
    getSession()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserToken(session?.access_token || null)
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

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a valid image type. Allowed: JPEG, PNG, WebP`)
        return false
      }
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size: 10MB`)
        return false
      }
      return true
    })

    if (formData.photos.length + validFiles.length > maxFiles) {
      alert(`Too many images. Maximum ${maxFiles} images allowed.`)
      return
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
        alert(`Successfully uploaded ${result.count} image(s)`)
      } else if (response.status === 207) {
        // Partial success case (207 Multi-Status)
        if (result.images && result.images.length > 0) {
          const imageUrls = result.images.map((img: any) => img.url)
          handleInputChange("photos", [...formData.photos, ...imageUrls])
        }
        if (result.successful && result.failed) {
          alert(`Uploaded ${result.successful} image(s). ${result.failed} failed: ${result.errors?.join(', ')}`)
        } else {
          alert(`Some images uploaded successfully`)
        }
      } else {
        // Full failure case
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error: any) {
      console.error('Error uploading images:', error)
      alert('Failed to upload images: ' + error.message)
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
        if (!draftId) {
          setDraftId(result.draft.id)
        }
        console.log(`Step ${step} saved successfully`)
        return true
      } else {
        console.error('Failed to save draft:', result.error)
        if (result.details) {
          console.error('Validation details:', JSON.stringify(result.details, null, 2))
          console.error('Step data that failed:', JSON.stringify(stepData, null, 2))
        }
        alert(`Failed to save step ${step}: ${result.error}${result.details ? '\nSee console for details' : ''}`)
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
          propertyType: formData.propertyType || '',
          bedrooms: formData.bedrooms || '',
          bathrooms: formData.bathrooms || '',
          monthlyRent: formData.monthlyRent || '',
          securityDeposit: formData.securityDeposit || '',
          availableDate: formData.availableDate || '',
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
          )
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
      // Save current step before moving to next
      const stepData = getCurrentStepData(currentStep)
      const saved = await saveDraft(currentStep, stepData)
      
      if (saved) {
        setCurrentStep(currentStep + 1)
      } else {
        alert('Failed to save progress. Please try again.')
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      
      // First save the final step (step 4) as draft
      const step4Data = getCurrentStepData(4)
      await saveDraft(4, step4Data)
      
      // Then attempt to publish
      const publishHeaders: { [key: string]: string } = { 'Content-Type': 'application/json' }
      if (userToken) {
        publishHeaders.Authorization = `Bearer ${userToken}`
      }
      
      const response = await fetch('/api/properties/publish', {
        method: 'POST',
        headers: publishHeaders,
        body: JSON.stringify({
          ...(sessionId ? { sessionId } : {}),
          ...(draftId ? { draftId } : {}),
          contactInfo: {
            contactName: formData.contactName || '',
            contactEmail: formData.contactEmail || '',
            contactPhone: formData.contactPhone || ''
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Property published successfully!')
        router.push("/landlord/properties")
      } else if (result.requiresSignup) {
        alert(`${result.message}\n\nYour property draft has been saved. Please sign up to continue.`)
        // Optionally redirect to signup with draft ID
        router.push(`/auth/signup?draftId=${result.draftId}`)
      } else if (result.requiresConversion) {
        alert(`${result.message}\n\nWould you like to convert your account to a landlord account?`)
        // Optionally redirect to conversion
        router.push('/auth/convert-to-landlord')
      } else {
        alert('Failed to publish property: ' + result.error)
      }
    } catch (error) {
      console.error('Error publishing property:', error)
      alert('An error occurred while publishing. Your draft has been saved.')
    } finally {
      setIsLoading(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.propertyType &&
          formData.bedrooms &&
          formData.bathrooms &&
          formData.description &&
          formData.monthlyRent &&
          formData.securityDeposit &&
          formData.availableDate
        )
      case 2:
        return formData.address && formData.city && formData.postcode
      case 3:
        return formData.photos.length > 0
      case 4:
        return formData.agreeToTerms
      default:
        return false
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="px-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Step {currentStep} of {totalSteps}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Basic Info</span>
              <span>Address</span>
              <span>Photos</span>
              <span>Review</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 1 && (
              <>
                <Home className="h-5 w-5" />
                Basic Information
              </>
            )}
            {currentStep === 2 && (
              <>
                <Home className="h-5 w-5" />
                Property Address
              </>
            )}
            {currentStep === 3 && (
              <>
                <Camera className="h-5 w-5" />
                Photos
              </>
            )}
            {currentStep === 4 && (
              <>
                <CheckCircle className="h-5 w-5" />
                Review & Publish
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
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
                    <SelectItem value="1BR">1 Bedroom</SelectItem>
                    <SelectItem value="2BR">2 Bedroom</SelectItem>
                    <SelectItem value="3BR+">3+ Bedroom</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div>
                  <Label htmlFor="securityDeposit">Security Deposit *</Label>
                  <Input
                    id="securityDeposit"
                    type="number"
                    value={formData.securityDeposit}
                    onChange={(e) => handleInputChange("securityDeposit", e.target.value)}
                    placeholder="2500"
                  />
                </div>
                <div>
                  <Label htmlFor="availableDate">Available Date *</Label>
                  <Input
                    id="availableDate"
                    type="date"
                    value={formData.availableDate}
                    onChange={(e) => handleInputChange("availableDate", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Property Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your property, highlighting key features and amenities..."
                  rows={6}
                />
              </div>

              <div>
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {amenityOptions.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                        className="border-2 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label htmlFor={amenity} className="text-sm font-normal cursor-pointer flex-1">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
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
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-accent bg-accent/10' 
                    : 'border-muted-foreground/25 hover:border-accent/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
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
                  disabled={uploadingImages || formData.photos.length >= 10}
                />
                <Label htmlFor="photo-upload">
                  <Button 
                    className="bg-accent hover:bg-accent/90 text-accent-foreground" 
                    asChild
                    disabled={uploadingImages || formData.photos.length >= 10}
                  >
                    <span>
                      {uploadingImages ? 'Uploading...' : formData.photos.length >= 10 ? 'Maximum reached' : 'Choose Photos'}
                    </span>
                  </Button>
                </Label>
                {uploadingImages && (
                  <div className="mt-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Uploading images...</p>
                  </div>
                )}
              </div>

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
            </div>
          )}

          {/* Step 4: Review & Publish */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="font-serif text-xl font-semibold mb-4">Property Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <strong>Property Type:</strong> {formData.propertyType}
                    </div>
                    <div>
                      <strong>Address:</strong> {formData.address}, {formData.city}, {formData.postcode}
                    </div>
                    <div>
                      <strong>Monthly Rent:</strong> £{Number.parseInt(formData.monthlyRent || "0").toLocaleString()}
                    </div>
                    <div>
                      <strong>Security Deposit:</strong> £
                      {Number.parseInt(formData.securityDeposit || "0").toLocaleString()}
                    </div>
                    <div>
                      <strong>Available Date:</strong> {new Date(formData.availableDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <strong>Bedrooms:</strong> {formData.bedrooms}
                    </div>
                    <div>
                      <strong>Bathrooms:</strong> {formData.bathrooms}
                    </div>
                    <div>
                      <strong>Photos:</strong> {formData.photos.length} uploaded
                    </div>
                    <div>
                      <strong>Amenities:</strong> {formData.amenities.length} selected
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-4 rounded-md border border-muted-foreground/20 hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                    className="border-2 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor="terms" className="text-sm font-normal cursor-pointer flex-1">
                    I agree to the terms and conditions and confirm that all information provided is accurate
                  </Label>
                </div>
              </div>
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
          <Button
            onClick={handleSubmit}
            disabled={!isStepValid() || isLoading}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isLoading ? 'Publishing...' : 'Publish Property'}
          </Button>
        )}
      </div>
    </div>
  )
}
