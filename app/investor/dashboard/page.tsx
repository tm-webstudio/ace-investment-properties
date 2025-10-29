"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { InvestorDashboardNavigation } from "@/components/investor-dashboard-navigation"
import { InvestorDashboardOverview } from "@/components/investor-dashboard-overview"
import { RecommendedProperties } from "@/components/recommended-properties"
import { PreferencesWidget } from "@/components/preferences-widget"
import { Card, CardHeader } from "@/components/ui/card"
import { sampleInvestors } from "@/lib/sample-data"
import { supabase } from "@/lib/supabase"

export default function InvestorDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [preferences, setPreferences] = useState<any>(null)
  
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
        .select('user_type')
        .eq('id', user.id)
        .single()

      if (profile?.user_type !== 'investor') {
        router.push('/dashboard')
        return
      }

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
          <Card className="mb-8 bg-gradient-to-r from-green-50 via-green-100/50 to-green-50 border-green-200/30">
            <CardHeader className="pb-4 pt-4">
              <p className="text-sm font-bold text-green-700/70 uppercase tracking-wide mb-1">
                Investor Dashboard
              </p>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-green-900 mb-1">
                Welcome back, {currentInvestor.name}
              </h1>
              <p className="text-green-800/70 text-md">Track your property investments and opportunities</p>
            </CardHeader>
          </Card>

          <InvestorDashboardNavigation />
          
          {/* Main Dashboard Content */}
          <div className="space-y-8">
            {/* Recommended Properties */}
            <RecommendedProperties preferences={preferences} />
            
            {/* Dashboard Overview */}
            <InvestorDashboardOverview investor={currentInvestor} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}