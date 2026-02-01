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
import { ChevronLeft, ChevronRight, Upload, X, Home, FileText, Camera, CheckCircle, ArrowLeft } from "lucide-react"
import { ImageReorder } from './image-reorder'
import { useRouter } from "next/navigation"
import Link from "next/link"

const cityAreasMap: Record<string, string[]> = {
  "London": [
    "Barking and Dagenham", "Barnet", "Bexley", "Brent", "Bromley", "Camden", "Croydon",
    "Ealing", "Enfield", "Greenwich", "Hackney", "Hammersmith and Fulham", "Haringey",
    "Harrow", "Havering", "Hillingdon", "Hounslow", "Islington", "Kensington and Chelsea",
    "Kingston upon Thames", "Lambeth", "Lewisham", "Merton", "Newham", "Redbridge",
    "Richmond upon Thames", "Southwark", "Sutton", "Tower Hamlets", "Waltham Forest",
    "Wandsworth", "Westminster", "City of London"
  ],
  "Birmingham": [
    "Aston", "Bournville", "Edgbaston", "Erdington", "Hall Green", "Handsworth",
    "Harborne", "Hodge Hill", "Kings Heath", "Ladywood", "Longbridge", "Moseley",
    "Northfield", "Perry Barr", "Selly Oak", "Small Heath", "Solihull", "Sparkbrook",
    "Sutton Coldfield", "Yardley"
  ],
  "Manchester": [
    "Ancoats", "Ardwick", "Blackley", "Cheetham Hill", "Chorlton", "City Centre",
    "Didsbury", "Fallowfield", "Gorton", "Hulme", "Levenshulme", "Moss Side",
    "Old Trafford", "Rusholme", "Salford", "Stockport", "Stretford", "Withington",
    "Wythenshawe"
  ],
  "Liverpool": [
    "Aigburth", "Allerton", "Anfield", "Belle Vale", "Childwall", "City Centre",
    "Crosby", "Everton", "Fairfield", "Kensington", "Kirkdale", "Mossley Hill",
    "Old Swan", "Toxteth", "Walton", "Wavertree", "West Derby", "Woolton"
  ],
  "Leeds": [
    "Armley", "Beeston", "Bramley", "Chapel Allerton", "City Centre", "Crossgates",
    "Farnley", "Gipton", "Harehills", "Headingley", "Holbeck", "Horsforth",
    "Hyde Park", "Kirkstall", "Meanwood", "Morley", "Pudsey", "Roundhay",
    "Seacroft", "Wetherby"
  ],
  "Newcastle": [
    "Benwell", "Byker", "City Centre", "Elswick", "Fenham", "Gosforth",
    "Heaton", "Jesmond", "Kenton", "Newcastle", "Ouseburn", "Shieldfield",
    "Walker", "Wallsend", "Westerhope"
  ],
  "Brighton": [
    "Brighton Marina", "City Centre", "Hanover", "Hove", "Kemptown",
    "Moulsecoomb", "Patcham", "Portslade", "Preston Park", "Saltdean",
    "Shoreham", "Whitehawk", "Woodingdean"
  ],
  "Bristol": [
    "Bedminster", "Bishopston", "Clifton", "City Centre", "Easton",
    "Filton", "Fishponds", "Henleaze", "Horfield", "Kingswood",
    "Knowle", "Redland", "Southville", "St Pauls", "Stoke Bishop",
    "Westbury-on-Trym"
  ],
  "Coventry": [
    "Canley", "Chapelfields", "City Centre", "Earlsdon", "Foleshill",
    "Hillfields", "Holbrooks", "Radford", "Stoke", "Tile Hill",
    "Walsgrave", "Whitley", "Wyken"
  ],
  "Leicester": [
    "Aylestone", "Belgrave", "City Centre", "Clarendon Park", "Evington",
    "Highfields", "Knighton", "Oadby", "Spinney Hills", "Stoneygate",
    "West End", "Wigston"
  ],
  "Nottingham": [
    "Beeston", "Bestwood", "Bulwell", "City Centre", "Clifton",
    "Hucknall", "Hyson Green", "Lenton", "Mapperley", "Radford",
    "Sherwood", "Sneinton", "West Bridgford", "Wollaton"
  ],
  "Oxford": [
    "City Centre", "Cowley", "Headington", "Iffley", "Jericho",
    "Littlemore", "Marston", "Summertown", "Wolvercote"
  ],
  "Cambridge": [
    "Arbury", "Castle", "Cherry Hinton", "Chesterton", "City Centre",
    "Coleridge", "Kings Hedges", "Newnham", "Petersfield", "Romsey",
    "Trumpington"
  ]
}

interface PropertyFormData {
  // Basic Info
  availability: string
  propertyType: string
  propertyLicence?: string
  propertyCondition: string
  address: string
  city: string
  specificArea: string
  postcode: string
  monthlyRent: string
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
}

interface EditPropertyFormProps {
  propertyId: string
  initialData?: any
  isAdmin?: boolean
  returnUrl?: string
}

export function EditPropertyForm({ propertyId, initialData, isAdmin = false, returnUrl }: EditPropertyFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Normalize property type from database to form values
  const normalizePropertyType = (type: string | undefined): string => {
    if (!type) return ""
    const t = type.toLowerCase()
    if (t === "studio" || t === "0br") return "Studio"
    if (t === "1br" || t === "1 bedroom" || t === "1bed") return "1BR"
    if (t === "2br" || t === "2 bedroom" || t === "2bed") return "2BR"
    if (t === "3br" || t === "3 bedroom" || t === "3bed") return "3BR"
    if (t === "3br+" || t === "4br" || t === "4 bedroom" || t === "4bed" || t === "5br" || t === "5 bedroom") return "3BR+"
    if (t === "house" || t === "detached" || t === "semi-detached" || t === "terraced") return "House"
    if (t === "apartment") return "Apartment"
    if (t === "flat") return "Flat"
    // Return original if it matches expected values
    if (["Studio", "1BR", "2BR", "3BR", "3BR+", "House", "Apartment", "Flat"].includes(type)) return type
    return type // Return as-is if unknown
  }

  // Helper to create form data from initialData
  const createFormDataFromInitial = (data: any): PropertyFormData => ({
    availability: data?.availability || "vacant",
    propertyType: normalizePropertyType(data?.property_type),
    propertyLicence: data?.property_licence || "",
    propertyCondition: data?.property_condition || "",
    address: data?.address || "",
    city: data?.city || "",
    specificArea: data?.specific_area || data?.county || "",
    postcode: data?.postcode || "",
    monthlyRent: data?.monthly_rent != null ? String(data.monthly_rent) : "",
    availableDate: data?.available_date || "",
    bedrooms: data?.bedrooms != null ? String(data.bedrooms) : "",
    bathrooms: data?.bathrooms != null ? String(data.bathrooms) : "",
    description: data?.description || "",
    amenities: data?.amenities || [],
    photos: data?.photos || [],
    primaryPhotoIndex: 0,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  })

  const [formData, setFormData] = useState<PropertyFormData>(() => createFormDataFromInitial(initialData))
  const [initialFormData, setInitialFormData] = useState<PropertyFormData>(() => createFormDataFromInitial(initialData))

  // Update form data when initialData loads (for async loading)
  useEffect(() => {
    if (initialData) {
      const newFormData = createFormDataFromInitial(initialData)
      setFormData(newFormData)
      setInitialFormData(newFormData)
    }
  }, [initialData])

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

      // Clear specific area when city changes
      if (field === 'city') {
        updated.specificArea = ''
      }

      return updated
    })
  }

  const handleImagesReorder = (newImages: (File | string)[]) => {
    setFormData(prev => ({ ...prev, photos: newImages }))
  }

  const handlePrimaryImageChange = (index: number) => {
    setFormData(prev => ({ ...prev, primaryPhotoIndex: index }))
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
      // First check for stored access token from our auth flow
      const accessToken = localStorage.getItem('accessToken')
      
      if (accessToken) {
        console.log('Edit form: Found access token, verifying with Supabase')
        
        // Verify the stored token
        const { data: { user }, error } = await supabase.auth.getUser(accessToken)
        
        if (user && !error) {
          console.log('Edit form: Token is valid, user authenticated:', user.id)
          setUserToken(accessToken)
          return
        } else {
          console.log('Edit form: Stored token is invalid, clearing localStorage')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }
      
      // Fallback to regular session check
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
        alert(`File ${file.name} is too large. Maximum size is 10MB`)
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
      // For edit mode, just add images to local state without API upload
      // In a real app, you would upload to a property-specific endpoint
      const newImageUrls = validFiles.map(file => URL.createObjectURL(file))
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newImageUrls]
      }))
      
      alert(`Successfully added ${validFiles.length} image(s) to edit queue`)
    } catch (error: any) {
      console.error('Error adding images:', error)
      alert('Failed to add images: ' + error.message)
    } finally {
      setUploadingImages(false)
      setUploadProgress({})
      // Clear the input
      event.target.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      // Create a mock event to reuse handlePhotoUpload
      const mockEvent = {
        target: { files }
      } as React.ChangeEvent<HTMLInputElement>
      
      await handlePhotoUpload(mockEvent)
    }
  }

  const removePhoto = (index: number) => {
    const photoToRemove = formData.photos[index]
    
    // If it's a blob URL, revoke it to free memory
    if (typeof photoToRemove === 'string' && photoToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(photoToRemove)
    }

    const newPhotos = formData.photos.filter((_, i) => i !== index)
    setFormData(prev => ({
      ...prev,
      photos: newPhotos,
      primaryPhotoIndex: prev.primaryPhotoIndex >= newPhotos.length ? 0 : prev.primaryPhotoIndex
    }))
  }

  const validateForm = (): boolean => {
    const baseValidation = !!(
      formData.availability &&
      formData.propertyType &&
      formData.address &&
      formData.city &&
      formData.postcode &&
      formData.monthlyRent &&
      formData.bedrooms !== "" &&
      formData.bathrooms !== "" &&
      formData.description &&
      formData.photos?.length > 0
    )

    const dateRequired = (formData.availability === 'tenanted' || formData.availability === 'upcoming')
      ? !!formData.availableDate
      : true

    return baseValidation && dateRequired
  }

  const hasFormChanged = (): boolean => {
    // Compare all fields to check if anything has changed
    const changed =
      formData.availability !== initialFormData.availability ||
      formData.propertyType !== initialFormData.propertyType ||
      formData.propertyLicence !== initialFormData.propertyLicence ||
      formData.propertyCondition !== initialFormData.propertyCondition ||
      formData.address !== initialFormData.address ||
      formData.city !== initialFormData.city ||
      formData.specificArea !== initialFormData.specificArea ||
      formData.postcode !== initialFormData.postcode ||
      formData.monthlyRent !== initialFormData.monthlyRent ||
      formData.availableDate !== initialFormData.availableDate ||
      formData.bedrooms !== initialFormData.bedrooms ||
      formData.bathrooms !== initialFormData.bathrooms ||
      formData.description !== initialFormData.description ||
      JSON.stringify(formData.amenities) !== JSON.stringify(initialFormData.amenities) ||
      JSON.stringify(formData.photos) !== JSON.stringify(initialFormData.photos)

    return changed
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Create the update payload
      const updateData = {
        availability: formData.availability,
        property_type: formData.propertyType,
        property_licence: formData.propertyLicence,
        property_condition: formData.propertyCondition,
        address: formData.address,
        city: formData.city,
        specific_area: formData.specificArea,
        postcode: formData.postcode,
        monthly_rent: parseFloat(formData.monthlyRent),
        available_date: formData.availableDate,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        description: formData.description,
        amenities: formData.amenities,
        photos: formData.photos,
      }

      // Update property via API (use admin or landlord endpoint based on isAdmin prop)
      const apiEndpoint = isAdmin
        ? `/api/admin/properties/${propertyId}`
        : `/api/landlord/properties/${propertyId}`

      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()

      console.log('Update response:', result)
      console.log('Update data sent:', updateData)

      if (result.success) {
        // Redirect to dashboard with success message
        const redirectUrl = returnUrl || (isAdmin ? '/admin/dashboard' : '/landlord/dashboard')
        router.push(`${redirectUrl}?updated=true`)
      } else {
        console.error('Update failed:', result)
        alert(`Update failed: ${result.error || 'Unknown error'}${result.details ? '\nDetails: ' + result.details : ''}`)
      }
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update property. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">Edit Property</h1>
              <Link href={returnUrl || (isAdmin ? '/admin/dashboard' : '/landlord/dashboard')}>
                <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <p className="text-muted-foreground">Update your property information</p>
          </div>

          {/* Form */}
          <div className="space-y-8">
            {/* Basic Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-accent" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 py-4">
                {/* Availability and Available Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="availability" className="mb-2 block">Availability *</Label>
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
                      <Label htmlFor="availableDate" className="mb-2 block">Available Date *</Label>
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
                    <Label htmlFor="propertyType" className="mb-2 block">Property Type *</Label>
                    <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Studio">Studio</SelectItem>
                        <SelectItem value="1BR">1 Bedroom</SelectItem>
                        <SelectItem value="2BR">2 Bedroom</SelectItem>
                        <SelectItem value="3BR">3 Bedroom</SelectItem>
                        <SelectItem value="3BR+">3+ Bedroom</SelectItem>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="Flat">Flat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="propertyLicence" className="mb-2 block">Property Licence</Label>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bedrooms" className="mb-2 block">Bedrooms *</Label>
                    <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bedrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Studio</SelectItem>
                        <SelectItem value="1">1 Bedroom</SelectItem>
                        <SelectItem value="2">2 Bedrooms</SelectItem>
                        <SelectItem value="3">3 Bedrooms</SelectItem>
                        <SelectItem value="4">4 Bedrooms</SelectItem>
                        <SelectItem value="5">5+ Bedrooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bathrooms" className="mb-2 block">Bathrooms *</Label>
                    <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange("bathrooms", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bathrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Bathroom</SelectItem>
                        <SelectItem value="1.5">1.5 Bathrooms</SelectItem>
                        <SelectItem value="2">2 Bathrooms</SelectItem>
                        <SelectItem value="2.5">2.5 Bathrooms</SelectItem>
                        <SelectItem value="3">3 Bathrooms</SelectItem>
                        <SelectItem value="3.5">3.5 Bathrooms</SelectItem>
                        <SelectItem value="4">4+ Bathrooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="propertyCondition" className="mb-2 block">Property Condition</Label>
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
                    <Label htmlFor="monthlyRent" className="mb-2 block">Monthly Rent (£) *</Label>
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
                  <Label htmlFor="description" className="mb-2 block">Property Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your property, highlighting key features and amenities..."
                    rows={8}
                    className="min-h-[150px] resize-y"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.description.length}/1000 characters
                  </p>
                </div>

                <div>
                  <Label className="mb-2 block">Features</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {amenityOptions.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/20 transition-colors">
                        <Checkbox
                          id={amenity}
                          checked={formData.amenities.includes(amenity)}
                          onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                          className="border border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label htmlFor={amenity} className="text-sm font-normal cursor-pointer flex-1 mb-0">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-accent" />
                  Property Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="address" className="mb-2 block">Property Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="123 High Street, Apartment 4B"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="mb-2 block">City/Town *</Label>
                    <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="London">London</SelectItem>
                        <SelectItem value="Birmingham">Birmingham</SelectItem>
                        <SelectItem value="Manchester">Manchester</SelectItem>
                        <SelectItem value="Liverpool">Liverpool</SelectItem>
                        <SelectItem value="Leeds">Leeds</SelectItem>
                        <SelectItem value="Newcastle">Newcastle</SelectItem>
                        <SelectItem value="Brighton">Brighton</SelectItem>
                        <SelectItem value="Bristol">Bristol</SelectItem>
                        <SelectItem value="Coventry">Coventry</SelectItem>
                        <SelectItem value="Leicester">Leicester</SelectItem>
                        <SelectItem value="Nottingham">Nottingham</SelectItem>
                        <SelectItem value="Oxford">Oxford</SelectItem>
                        <SelectItem value="Cambridge">Cambridge</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="specificArea" className="mb-2 block">Specific Area (optional)</Label>
                    <Select
                      value={formData.specificArea || ""}
                      onValueChange={(value) => handleInputChange("specificArea", value)}
                      disabled={!formData.city || !cityAreasMap[formData.city]}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={!formData.city ? "Select city first" : "Select area"} />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.city && cityAreasMap[formData.city] && cityAreasMap[formData.city].map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="postcode" className="mb-2 block">Postcode *</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => handleInputChange("postcode", e.target.value)}
                    placeholder="SW1A 1AA"
                    className="uppercase"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Photos Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-accent" />
                  Property Photos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 py-4">
                {formData.photos.length > 0 && (
                  <ImageReorder
                    images={formData.photos}
                    primaryImageIndex={formData.primaryPhotoIndex}
                    onImagesReorder={handleImagesReorder}
                    onPrimaryImageChange={handlePrimaryImageChange}
                    onImageRemove={removePhoto}
                    disabled={uploadingImages}
                  />
                )}

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
                  <div className="flex justify-center">
                    <Button 
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      disabled={uploadingImages || formData.photos.length >= 10}
                    >
                      {uploadingImages ? 'Uploading...' : formData.photos.length >= 10 ? 'Maximum reached' : 'Choose Photos'}
                    </Button>
                  </div>
                  {uploadingImages && (
                    <div className="mt-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Uploading images...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>


            {/* Submit Section */}
            <Card>
              <CardContent className="py-3">
                <div className="flex justify-between items-center">
                  <Link href={returnUrl || (isAdmin ? '/admin/dashboard' : '/landlord/dashboard')}>
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !hasFormChanged()}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Updating..." : "Update Property"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}