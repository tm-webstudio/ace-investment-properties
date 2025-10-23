"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { DashboardOverview } from "@/components/dashboard-overview"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

interface UserProfile {
  user_id: string
  first_name: string
  last_name: string
  email: string
  user_type: string
}

interface User {
  id: string
  email: string
  user_metadata?: {
    first_name?: string
    last_name?: string
  }
}

export default function LandlordDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Dashboard session check:', session)
        
        if (session?.user) {
          // Try to fetch user profile first
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          
          console.log('Profile data:', profile, 'Profile error:', profileError)
          
          if (profile) {
            setUser(profile)
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
          <Card className="mb-8 bg-gradient-to-r from-primary/5 via-primary/3 to-accent/5 border-primary/10">
            <CardHeader className="pb-4 pt-4">
              <p className="text-sm font-bold text-primary/70 uppercase tracking-wide mb-1">
                Landlord Dashboard
              </p>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-1">
                Welcome back, {user.first_name} {user.last_name}
              </h1>
              <p className="text-primary/70 text-lg">Manage your properties and applications</p>
            </CardHeader>
          </Card>

          <DashboardNavigation />
          <DashboardOverview userId={user.user_id} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
