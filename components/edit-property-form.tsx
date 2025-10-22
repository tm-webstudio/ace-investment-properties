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

interface PropertyFormData {
  // Basic Info
  propertyType: string
  propertyLicence?: string
  propertyCondition: string
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
}

interface EditPropertyFormProps {
  propertyId: string
  initialData?: any
}

export function EditPropertyForm({ propertyId, initialData }: EditPropertyFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<PropertyFormData>({
    propertyType: initialData?.property_type || "",
    propertyLicence: initialData?.property_licence || "",
    propertyCondition: initialData?.property_condition || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.county || "",
    postcode: initialData?.postcode || "",
    monthlyRent: initialData?.monthly_rent?.toString() || "",
    securityDeposit: initialData?.security_deposit?.toString() || "",
    availableDate: initialData?.available_date || "",
    bedrooms: initialData?.bedrooms?.toString() || "",
    bathrooms: initialData?.bathrooms?.toString() || "",
    description: initialData?.description || "",
    amenities: initialData?.amenities || [],
    photos: initialData?.photos || [],
    primaryPhotoIndex: 0,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  })

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
    return !!(
      formData.propertyType &&
      formData.address &&
      formData.city &&
      formData.state &&
      formData.postcode &&
      formData.monthlyRent &&
      formData.securityDeposit &&
      formData.availableDate &&
      formData.bedrooms &&
      formData.bathrooms &&
      formData.description &&
      formData.photos.length > 0
    )
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      // Create the update payload
      const updateData = {
        property_type: formData.propertyType,
        property_licence: formData.propertyLicence,
        property_condition: formData.propertyCondition,
        address: formData.address,
        city: formData.city,
        county: formData.state,
        postcode: formData.postcode,
        monthly_rent: parseFloat(formData.monthlyRent),
        security_deposit: parseFloat(formData.securityDeposit),
        available_date: formData.availableDate,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        description: formData.description,
        amenities: formData.amenities,
        photos: formData.photos,
      }

      // Update property via API
      const response = await fetch(`/api/landlord/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()

      if (result.success) {
        // Redirect to properties list with success message
        router.push('/landlord/properties?updated=true')
      } else {
        alert(`Update failed: ${result.error}`)
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
            <div className="flex items-center gap-4 mb-4">
              <Link href="/landlord/properties">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Properties
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold mb-2">Edit Property</h1>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="propertyType">Property Type *</Label>
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
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="propertyLicence">Property Licence</Label>
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
                    <Label htmlFor="bedrooms">Bedrooms *</Label>
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
                    <Label htmlFor="bathrooms">Bathrooms *</Label>
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
                  <div>
                    <Label htmlFor="propertyCondition">Property Condition</Label>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="monthlyRent">Monthly Rent (£) *</Label>
                    <Input
                      id="monthlyRent"
                      type="number"
                      value={formData.monthlyRent}
                      onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
                      placeholder="2500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="securityDeposit">Security Deposit (£) *</Label>
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
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.description.length}/1000 characters
                  </p>
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
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <Link href="/landlord/properties">
                    <Button variant="ghost">Cancel</Button>
                  </Link>
                  <Button
                    onClick={handleSubmit}
                    disabled={!validateForm() || isLoading}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
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