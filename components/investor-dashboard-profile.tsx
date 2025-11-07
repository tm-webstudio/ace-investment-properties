"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Phone, MapPin, Save } from "lucide-react"
import { supabase } from "@/lib/supabase"

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
    setIsEditing(false)
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

        {/* Settings Form */}
        <Card className="lg:col-span-2">
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
  )
}
