"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { InvestorDashboardNavigation } from "@/components/investor-dashboard-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Phone, MapPin, TrendingUp, Save, Edit3 } from "lucide-react"
import { sampleInvestors } from "@/lib/sample-data"

export default function InvestorProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [investor, setInvestor] = useState(sampleInvestors[0])
  const [formData, setFormData] = useState({
    name: investor.name,
    email: investor.email,
    phone: investor.phone,
    address: "456 Investment Street, London",
    company: "Smith Investment Group",
    bio: "Experienced property investor focused on high-yield rental properties in London and surrounding areas. Looking for opportunities in emerging markets with strong growth potential.",
    investmentGoals: "Building a diversified portfolio of rental properties across London with target yield of 8%+",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    // In a real app, this would make an API call to update the profile
    setInvestor(prev => ({
      ...prev,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    }))
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: investor.name,
      email: investor.email,
      phone: investor.phone,
      address: "456 Investment Street, London",
      company: "Smith Investment Group",
      bio: "Experienced property investor focused on high-yield rental properties in London and surrounding areas. Looking for opportunities in emerging markets with strong growth potential.",
      investmentGoals: "Building a diversified portfolio of rental properties across London with target yield of 8%+",
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              Profile Settings
            </h1>
            <p className="text-muted-foreground text-md">Manage your account information and investment preferences</p>
          </div>

          <InvestorDashboardNavigation 
            customButton={
              !isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : null
            }
          />
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Overview Card */}
              <Card className="lg:col-span-1">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-xl">{formData.name}</CardTitle>
                  <p className="text-muted-foreground">{formData.company}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formData.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formData.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{investor.savedProperties.length} Saved Properties</span>
                  </div>
                </CardContent>
              </Card>

              {/* Settings Form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                      placeholder="Tell us about your investment experience and interests..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="investmentGoals">Investment Goals</Label>
                    <Textarea
                      id="investmentGoals"
                      rows={3}
                      value={formData.investmentGoals}
                      onChange={(e) => handleInputChange('investmentGoals', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                      placeholder="Describe your investment goals and criteria..."
                    />
                  </div>

                  {isEditing && (
                    <div className="flex gap-4 pt-4">
                      <Button 
                        onClick={handleSave}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}