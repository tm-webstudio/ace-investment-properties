"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { InvestorDashboardNavigation } from "@/components/investor-dashboard-navigation"
import { InvestorDashboardOverview } from "@/components/investor-dashboard-overview"
import { InvestorDashboardProfile } from "@/components/investor-dashboard-profile"
import { RecommendedProperties } from "@/components/recommended-properties"
import { sampleInvestors } from "@/lib/sample-data"
import { supabase } from "@/lib/supabase"

export default function InvestorDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [preferences, setPreferences] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("dashboard")

  // In a real app, this would come from user data
  const currentInvestor = sampleInvestors[0]

  useEffect(() => {
    checkAuthAndPreferences()
  }, [])

  const checkAuthAndPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/signin')
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
        router.push('/dashboard')
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

  const getPageSubtitle = () => {
    switch (activeTab) {
      case "profile":
        return "Manage your account information and preferences"
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
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
          />

          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <RecommendedProperties preferences={preferences} />
              <InvestorDashboardOverview investor={currentInvestor} />
            </div>
          )}
          {activeTab === "profile" && <InvestorDashboardProfile />}
        </div>
      </main>
      <Footer />
    </div>
  )
}