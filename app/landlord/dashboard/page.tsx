"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { DashboardOverview } from "@/components/dashboard-overview"
import { DashboardDocuments } from "@/components/dashboard-documents"
import { DashboardProfile } from "@/components/dashboard-profile"
import { DashboardProperties } from "@/components/dashboard-properties"
import { ViewingRequests } from "@/components/viewing-requests"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { PageHeader } from "@/components/page-header"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Edit3 } from "lucide-react"

interface UserProfile {
  user_id: string
  first_name: string
  last_name: string
  email: string
  user_type: string
}

export default function LandlordDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      try {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Dashboard session check:', !!session)

        if (session?.user) {
          // Try to fetch user profile first
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          console.log('Profile data:', profile, 'Profile error:', profileError)

          if (profile) {
            setUser({
              user_id: profile.id,
              email: profile.email,
              user_type: profile.user_type,
              first_name: profile.full_name?.split(' ')[0] || 'User',
              last_name: profile.full_name?.split(' ').slice(1).join(' ') || ''
            })
          } else {
            // If no profile exists, create a temporary user object from session
            console.log('No profile found, using session data')
            const tempUser: UserProfile = {
              user_id: session.user.id,
              email: session.user.email || '',
              user_type: 'landlord',
              first_name: session.user.user_metadata?.first_name || 'User',
              last_name: session.user.user_metadata?.last_name || ''
            }
            setUser(tempUser)
          }
        } else {
          console.log('No session found')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  // Reset editing state when switching away from profile tab
  useEffect(() => {
    if (activeTab !== 'profile') {
      setIsEditingProfile(false)
    }
  }, [activeTab])

  const getPageTitle = () => {
    switch (activeTab) {
      case "properties":
        return "My Properties"
      case "viewings":
        return "Viewing Requests"
      case "documents":
        return "Property Documents"
      case "profile":
        return `Welcome back, ${user?.first_name || 'User'} ${user?.last_name || ''}`
      default:
        return `Welcome back, ${user?.first_name || 'User'} ${user?.last_name || ''}`
    }
  }

  const getPageSubtitle = () => {
    switch (activeTab) {
      case "properties":
        return "View and manage all your listed properties"
      case "viewings":
        return "Manage viewing requests from potential tenants"
      case "documents":
        return "Manage certificates and licenses for your properties"
      case "profile":
        return "Manage your account information and preferences"
      default:
        return "Manage your properties and applications"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Please log in to access your dashboard</p>
          <a href="/auth/signin" className="text-primary hover:underline">Sign In</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeader
            category="Landlord Dashboard"
            title={getPageTitle()}
            subtitle={getPageSubtitle()}
            variant="blue"
          />

          <DashboardNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            customButton={
              activeTab === "profile" && !isEditingProfile ? (
                <Button
                  onClick={() => setIsEditingProfile(true)}
                  className="
                    group bg-accent hover:bg-accent/90 text-accent-foreground
                    transition-all duration-200 ease-out
                    hover:scale-[1.02] hover:-translate-y-px
                    hover:shadow-md hover:shadow-accent/15
                    active:scale-[0.98] active:transition-none
                  "
                >
                  <Edit3 className="mr-2 h-4 w-4 transition-all duration-200 ease-out group-hover:scale-105" />
                  <span className="relative z-10 font-medium">Edit Profile</span>
                </Button>
              ) : activeTab === "dashboard" || activeTab === "properties" ? undefined : null
            }
          />

          {activeTab === "dashboard" && <DashboardOverview userId={user.user_id} onTabChange={setActiveTab} />}
          {activeTab === "properties" && <DashboardProperties userId={user.user_id} />}
          {activeTab === "viewings" && <ViewingRequests variant="full" />}
          {activeTab === "documents" && <DashboardDocuments />}
          {activeTab === "profile" && <DashboardProfile isEditing={isEditingProfile} setIsEditing={setIsEditingProfile} />}
        </div>
      </main>
      <Footer />
    </div>
  )
}
