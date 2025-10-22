"use client"

import { useState, use, useEffect } from "react"
import { notFound } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PropertyGallery } from "@/components/property-gallery"
import { PropertyDetails } from "@/components/property-details"
import { LandlordCard } from "@/components/landlord-card"
import { SimilarProperties } from "@/components/similar-properties"
import { ApplicationModal } from "@/components/application-modal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileUp, KeyRound as Pound, User, Phone } from "lucide-react"
import { sampleProperties } from "@/lib/sample-data"

interface PropertyPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const { id } = use(params)
  const [isOpen, setIsOpen] = useState(false)
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentAddress: "",
    employmentStatus: "",
    employer: "",
    monthlyIncome: "",
    moveInDate: "",
    additionalInfo: "",
    agreeToTerms: false,
  })

  useEffect(() => {
    async function fetchProperty() {
      try {
        setLoading(true)
        
        // First try to find property in sample data (for demo purposes)
        const sampleProperty = sampleProperties.find(p => p.id === id)
        
        if (sampleProperty) {
          setProperty(sampleProperty)
          setLoading(false)
          return
        }
        
        // If not found in sample data, try API
        const response = await fetch(`/api/properties/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound()
          }
          throw new Error('Failed to fetch property')
        }
        
        const data = await response.json()
        if (data.success && data.property) {
          // API already formats the data correctly
          setProperty(data.property)
        } else {
          setError('Property not found')
        }
      } catch (err) {
        console.error('Error fetching property:', err)
        setError('Failed to load property')
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Application submitted:", formData)
    setIsOpen(false)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[22px]">
            <div className="animate-pulse space-y-8">
              <div className="h-64 bg-gray-300 rounded-lg"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-32 bg-gray-300 rounded"></div>
                  <div className="h-24 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !property) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[22px]">
          {/* Property Gallery */}
          <PropertyGallery images={property.images} title={property.title} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 md:mt-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <PropertyDetails property={property} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <ApplicationModal property={property} />
              <LandlordCard
                name={property.landlordName}
                phone={property.landlordPhone}
                email={property.landlordEmail}
              />
            </div>
          </div>

          {/* Similar Properties */}
          <SimilarProperties currentPropertyId={property.id} propertyType={property.propertyType} />
        </div>
        
        {/* Mobile Sticky Book Viewing Button */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-50">
          <div className="flex gap-3">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground text-base py-6">
                  Book Viewing
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif">Apply for {property.title}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="currentAddress">Current Address *</Label>
                    <Input
                      id="currentAddress"
                      value={formData.currentAddress}
                      onChange={(e) => handleInputChange("currentAddress", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Employment Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Pound className="mr-2 h-5 w-5" />
                    Employment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employmentStatus">Employment Status *</Label>
                      <Select
                        value={formData.employmentStatus}
                        onValueChange={(value) => handleInputChange("employmentStatus", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employed">Employed Full-time</SelectItem>
                          <SelectItem value="part-time">Employed Part-time</SelectItem>
                          <SelectItem value="self-employed">Self-employed</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="employer">Employer/Company</Label>
                      <Input
                        id="employer"
                        value={formData.employer}
                        onChange={(e) => handleInputChange("employer", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="monthlyIncome">Monthly Income *</Label>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        placeholder="0"
                        value={formData.monthlyIncome}
                        onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="moveInDate">Preferred Move-in Date *</Label>
                      <Input
                        id="moveInDate"
                        type="date"
                        value={formData.moveInDate}
                        onChange={(e) => handleInputChange("moveInDate", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                  <div>
                    <Label htmlFor="additionalInfo">Tell us about yourself (pets, lifestyle, etc.)</Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Any additional information you'd like to share..."
                      value={formData.additionalInfo}
                      onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>

                {/* Document Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FileUp className="mr-2 h-5 w-5" />
                    Required Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 p-6 text-center">
                      <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Photo ID</p>
                      <p className="text-xs text-muted-foreground">Driver's license or passport</p>
                      <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                        Upload File
                      </Button>
                    </div>
                    <div className="border-2 border-dashed border-muted-foreground/25 p-6 text-center">
                      <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Proof of Income</p>
                      <p className="text-xs text-muted-foreground">Pay stubs or bank statements</p>
                      <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                        Upload File
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Terms and Submit */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the terms and conditions and authorize a background and credit check
                    </Label>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!formData.agreeToTerms}
                      className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      Submit Application
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
            <Button 
              variant="outline" 
              className="bg-transparent px-6 py-6 text-base"
              onClick={() => window.open(`tel:${property.landlordPhone}`, '_self')}
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Us
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
