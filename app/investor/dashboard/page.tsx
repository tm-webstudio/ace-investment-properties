"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { DashboardNavigationHeader } from "@/components/dashboard-navigation-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { PageHeader } from "@/components/page-header"
import { InvestorDashboardNavigation } from "@/components/investor-dashboard-navigation"
import { InvestorDashboardOverview } from "@/components/investor-dashboard-overview"
import { InvestorDashboardProfile } from "@/components/investor-dashboard-profile"
import { InvestorDashboardPreferences } from "@/components/investor-dashboard-preferences"
import { InvestorDashboardSavedProperties } from "@/components/investor-dashboard-saved-properties"
import { InvestorViewingRequests } from "@/components/investor-viewing-requests"
import { RecommendedProperties } from "@/components/recommended-properties"
import { Button } from "@/components/ui/button"
import { Edit3, Settings } from "lucide-react"
import { sampleInvestors } from "@/lib/sample-data"
import { supabase } from "@/lib/supabase"

function InvestorDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [preferences, setPreferences] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  // Handle tab from URL query parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['dashboard', 'preferences', 'saved-properties', 'viewings', 'profile'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // In a real app, this would come from user data
  const currentInvestor = sampleInvestors[0]

  useEffect(() => {
    checkAuthAndPreferences()
  }, [])

  const checkAuthAndPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      setUser(user)

      // Check if user is an investor
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile?.user_type !== 'investor') {
        setIsLoading(false)
        return
      }

      setUserProfile(profile)

      // Fetch investor preferences
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        try {
          const response = await fetch('/api/investor/preferences', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          })
          const result = await response.json()
          if (result.success && result.preferences) {
            setPreferences(result.preferences)
          }
        } catch (prefError) {
          console.error('Error fetching preferences:', prefError)
        }
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Error checking auth:', error)
      setIsLoading(false)
    }
  }

  // Reset editing state when switching away from profile tab
  useEffect(() => {
    if (activeTab !== 'profile') {
      setIsEditingProfile(false)
    }
  }, [activeTab])

  const getPageSubtitle = () => {
    switch (activeTab) {
      case "profile":
        return "Manage your account information and preferences"
      case "preferences":
        return "Set your investment criteria and property preferences"
      case "saved-properties":
        return "View and manage your saved properties"
      case "viewings":
        return "Track your property viewing appointments"
      default:
        return "Track your property investments and opportunities"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Header with Logo */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-center z-10">
          <Link href="/" className="flex justify-center">
            <span className="font-serif font-bold text-xl text-primary">
              Ace Investment Properties
            </span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Access Required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You need to be logged in as an investor to access this dashboard.
            </p>
          </div>
        </div>

        <div className="mt-8 mx-auto w-full max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-4">
              <a
                href="/auth/signin"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Sign In
              </a>
              <a
                href="/"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNavigationHeader />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeader
            category="Investor Dashboard"
            title={`Welcome back, ${userProfile?.full_name || 'Investor'}`}
            subtitle={getPageSubtitle()}
            variant="green"
          />

          <InvestorDashboardNavigation
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
              ) : activeTab !== "profile" ? (
                <Link href="/investor/preferences">
                  <Button
                    className="
                      group bg-accent hover:bg-accent/90 text-accent-foreground
                      transition-all duration-200 ease-out
                      hover:scale-[1.02] hover:-translate-y-px
                      hover:shadow-md hover:shadow-accent/15
                      active:scale-[0.98] active:transition-none
                    "
                  >
                    <Settings className="mr-2 h-4 w-4 transition-all duration-200 ease-out group-hover:scale-105" />
                    <span className="relative z-10 font-medium">Edit Preferences</span>
                  </Button>
                </Link>
              ) : undefined
            }
          />

          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <RecommendedProperties preferences={preferences} />
              <InvestorDashboardOverview investor={currentInvestor} />
            </div>
          )}
          {activeTab === "preferences" && <InvestorDashboardPreferences preferences={preferences} />}
          {activeTab === "saved-properties" && <InvestorDashboardSavedProperties />}
          {activeTab === "viewings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Viewings</h2>
                <p className="text-gray-600 mt-1">
                  Track and manage your property viewing appointments
                </p>
              </div>
              <InvestorViewingRequests variant="full" />
            </div>
          )}
          {activeTab === "profile" && <InvestorDashboardProfile isEditing={isEditingProfile} setIsEditing={setIsEditingProfile} />}
        </div>
      </main>
      <DashboardFooter />
    </div>
  )
}

export default function InvestorDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <InvestorDashboardContent />
    </Suspense>
  )
}