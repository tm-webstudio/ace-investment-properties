"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Phone, MapPin, TrendingUp, Save, Edit3 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function InvestorDashboardProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
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
            setFormData({
              name: profile.full_name || '',
              email: profile.email || '',
              phone: profile.phone || '',
              address: profile.address || '',
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
        await supabase
          .from('user_profiles')
          .update({
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            company_name: formData.company,
            bio: formData.bio,
            investment_goals: formData.investmentGoals,
          })
          .eq('id', session.user.id)

        setUser((prev: any) => ({ ...prev, ...formData }))
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        company: user.company_name || '',
        bio: user.bio || '',
        investmentGoals: user.investment_goals || '',
      })
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              <span className="text-sm">{formData.address || 'No address provided'}</span>
            </div>
          </CardContent>
        </Card>

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
              <Label htmlFor="investmentGoals">Investment Goals</Label>
              <Textarea
                id="investmentGoals"
                rows={3}
                value={formData.investmentGoals}
                onChange={(e) => handleInputChange('investmentGoals', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
                placeholder="What are your investment goals?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
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
