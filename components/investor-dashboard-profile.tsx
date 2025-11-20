"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Mail, Phone, MapPin, Save, Settings } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface PreferencesData {
  budget: { min: number; max: number }
  bedrooms: { min: number; max: number }
  property_types: string[]
  locations: { city: string }[]
}

interface InvestorDashboardProfileProps {
  isEditing: boolean
  setIsEditing: (value: boolean) => void
}

export function InvestorDashboardProfile({ isEditing, setIsEditing }: InvestorDashboardProfileProps) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    email: "",
    phone: "",
    city: "",
    company: "",
    bio: "",
    investmentGoals: "",
  })
  const [preferences, setPreferences] = useState<PreferencesData | null>(null)
  const [preferencesForm, setPreferencesForm] = useState<PreferencesData>({
    budget: { min: 1000, max: 3000 },
    bedrooms: { min: 1, max: 4 },
    property_types: [],
    locations: []
  })
  const [newLocation, setNewLocation] = useState("")

  const propertyTypeOptions = [
    { value: "house", label: "House" },
    { value: "flat", label: "Flat" },
    { value: "hmo", label: "HMO" },
    { value: "studio", label: "Studio" },
    { value: "bungalow", label: "Bungalow" },
  ]

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUser(profile)
            const nameParts = (profile.full_name || '').split(' ')
            const firstName = nameParts[0] || ''
            const surname = nameParts.slice(1).join(' ') || ''

            setFormData({
              firstName: firstName,
              surname: surname,
              email: profile.email || '',
              phone: profile.phone || '',
              city: profile.city || '',
              company: profile.company_name || '',
              bio: profile.bio || '',
              investmentGoals: profile.investment_goals || '',
            })
          }

          // Fetch preferences
          const { data: preferencesData } = await supabase
            .from('investor_preferences')
            .select('*')
            .eq('user_id', session.user.id)
            .single()

          if (preferencesData?.preference_data) {
            const prefData = preferencesData.preference_data as PreferencesData
            setPreferences(prefData)
            setPreferencesForm(prefData)
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const fullName = `${formData.firstName} ${formData.surname}`.trim()

        // Update profile
        await supabase
          .from('user_profiles')
          .update({
            full_name: fullName,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            company_name: formData.company,
            bio: formData.bio,
            investment_goals: formData.investmentGoals,
          })
          .eq('id', session.user.id)

        setUser((prev: any) => ({
          ...prev,
          full_name: fullName,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          company_name: formData.company,
          bio: formData.bio,
          investment_goals: formData.investmentGoals,
        }))

        // Update preferences
        const { data: existingPrefs } = await supabase
          .from('investor_preferences')
          .select('id')
          .eq('user_id', session.user.id)
          .single()

        if (existingPrefs) {
          await supabase
            .from('investor_preferences')
            .update({
              preference_data: preferencesForm
            })
            .eq('user_id', session.user.id)
        } else {
          await supabase
            .from('investor_preferences')
            .insert({
              user_id: session.user.id,
              preference_data: preferencesForm
            })
        }

        setPreferences(preferencesForm)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original values
    if (user) {
      const nameParts = (user.full_name || '').split(' ')
      const firstName = nameParts[0] || ''
      const surname = nameParts.slice(1).join(' ') || ''

      setFormData({
        firstName: firstName,
        surname: surname,
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        company: user.company_name || '',
        bio: user.bio || '',
        investmentGoals: user.investment_goals || '',
      })
    }
    // Reset preferences form
    if (preferences) {
      setPreferencesForm(preferences)
    }
    setIsEditing(false)
  }

  const handlePropertyTypeToggle = (type: string) => {
    setPreferencesForm(prev => ({
      ...prev,
      property_types: prev.property_types.includes(type)
        ? prev.property_types.filter(t => t !== type)
        : [...prev.property_types, type]
    }))
  }

  const handleAddLocation = () => {
    if (newLocation.trim() && !preferencesForm.locations.some(l => l.city.toLowerCase() === newLocation.trim().toLowerCase())) {
      setPreferencesForm(prev => ({
        ...prev,
        locations: [...prev.locations, { city: newLocation.trim() }]
      }))
      setNewLocation("")
    }
  }

  const handleRemoveLocation = (city: string) => {
    setPreferencesForm(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l.city !== city)
    }))
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview Skeleton */}
          <Card className="lg:col-span-1 self-start">
            <CardContent className="px-4 py-3">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Skeleton */}
          <Card className="lg:col-span-2">
            <CardHeader className="py-3">
              <div className="flex items-center">
                <div className="h-5 w-5 bg-gray-200 rounded mr-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              </div>

              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview Card */}
        <Card className="lg:col-span-1 self-start">
          <CardContent className="px-4 py-3">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-10 w-10 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl">{`${formData.firstName} ${formData.surname}`.trim()}</CardTitle>
                <p className="text-muted-foreground text-sm mb-3">{formData.company}</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{formData.phone || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{formData.city || 'No city provided'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{formData.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right column - Personal Info and Preferences */}
        <div className="lg:col-span-2 space-y-8">
          {/* Settings Form */}
          <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ""}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Surname</Label>
                <Input
                  id="surname"
                  value={formData.surname || ""}
                  onChange={(e) => handleInputChange('surname', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Smith"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  placeholder="john.smith@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="07123 456789"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city || ""}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={!isEditing}
                  placeholder="London"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={formData.company || ""}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Investment Group Ltd"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="investmentGoals">Investment Goals</Label>
              <Textarea
                id="investmentGoals"
                rows={3}
                value={formData.investmentGoals || ""}
                onChange={(e) => handleInputChange('investmentGoals', e.target.value)}
                disabled={!isEditing}
                placeholder="What are your investment goals and strategies?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                value={formData.bio || ""}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                placeholder="Tell us about yourself and your investment experience..."
              />
            </div>
          </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Investment Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            {/* Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetMin">Minimum Budget (£/month)</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  value={preferencesForm.budget.min}
                  onChange={(e) => setPreferencesForm(prev => ({
                    ...prev,
                    budget: { ...prev.budget, min: parseInt(e.target.value) || 0 }
                  }))}
                  disabled={!isEditing}
                  placeholder="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetMax">Maximum Budget (£/month)</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  value={preferencesForm.budget.max}
                  onChange={(e) => setPreferencesForm(prev => ({
                    ...prev,
                    budget: { ...prev.budget, max: parseInt(e.target.value) || 0 }
                  }))}
                  disabled={!isEditing}
                  placeholder="3000"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedroomsMin">Minimum Bedrooms</Label>
                <Select
                  value={preferencesForm.bedrooms.min.toString()}
                  onValueChange={(value) => setPreferencesForm(prev => ({
                    ...prev,
                    bedrooms: { ...prev.bedrooms, min: parseInt(value) }
                  }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedroomsMax">Maximum Bedrooms</Label>
                <Select
                  value={preferencesForm.bedrooms.max.toString()}
                  onValueChange={(value) => setPreferencesForm(prev => ({
                    ...prev,
                    bedrooms: { ...prev.bedrooms, max: parseInt(value) }
                  }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Property Types */}
            <div className="space-y-2">
              <Label>Property Types</Label>
              <div className="flex flex-wrap gap-3">
                {propertyTypeOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={preferencesForm.property_types.includes(option.value)}
                      onCheckedChange={() => handlePropertyTypeToggle(option.value)}
                      disabled={!isEditing}
                    />
                    <label
                      htmlFor={option.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-2">
              <Label>Preferred Locations</Label>
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Add a city..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddLocation}>
                    Add
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {preferencesForm.locations.map(loc => (
                  <span
                    key={loc.city}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100"
                  >
                    {loc.city}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(loc.city)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
                {preferencesForm.locations.length === 0 && (
                  <span className="text-sm text-muted-foreground">No locations added</span>
                )}
              </div>
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
  )
}
