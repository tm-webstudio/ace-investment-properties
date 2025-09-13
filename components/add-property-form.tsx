"use client"

import type React from "react"

import { useState } from "react"
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
  photos: File[]
  primaryPhotoIndex: number

  // Terms
  agreeToTerms: boolean
}

export function AddPropertyForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
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

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    handleInputChange("photos", [...formData.photos, ...files])
  }

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index)
    handleInputChange("photos", newPhotos)
    if (formData.primaryPhotoIndex >= newPhotos.length) {
      handleInputChange("primaryPhotoIndex", Math.max(0, newPhotos.length - 1))
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    // In a real app, this would submit to an API
    console.log("Property submitted:", formData)
    router.push("/landlord/properties")
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
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Upload Property Photos</h3>
                <p className="text-muted-foreground mb-4">
                  Add high-quality photos to showcase your property. The first photo will be the main listing image.
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <Label htmlFor="photo-upload">
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                    <span>Choose Photos</span>
                  </Button>
                </Label>
              </div>

              {formData.photos.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-4">Uploaded Photos ({formData.photos.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(photo) || "/placeholder.svg"}
                            alt={`Property photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {index === formData.primaryPhotoIndex && (
                          <Badge className="absolute bottom-2 left-2 bg-accent text-accent-foreground">Primary</Badge>
                        )}
                        {index !== formData.primaryPhotoIndex && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleInputChange("primaryPhotoIndex", index)}
                          >
                            Set as Primary
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm">
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
            disabled={!isStepValid()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!isStepValid()}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Publish Property
          </Button>
        )}
      </div>
    </div>
  )
}
