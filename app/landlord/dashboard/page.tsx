"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { DashboardNavigationHeader } from "@/components/dashboard-navigation-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { DashboardOverview } from "@/components/dashboard-overview"
import { DashboardDocuments } from "@/components/dashboard-documents"
import { DashboardProfile } from "@/components/dashboard-profile"
import { DashboardProperties } from "@/components/dashboard-properties"
import { ViewingRequests } from "@/components/viewing-requests"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { PageHeader } from "@/components/page-header"
import { PropertySubmissionConfirmationModal } from "@/components/property-submission-confirmation-modal"
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

function LandlordDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      try {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Dashboard session check:', !!session)

        if (!session?.user) {
          console.log('No session found')
          setLoading(false)
          return
        }

        // Try to fetch user profile first
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        console.log('Profile data:', profile, 'Profile error:', profileError)

        if (profile) {
          // Check if user is a landlord
          if (profile.user_type !== 'landlord') {
            console.log('User is not a landlord')
            setLoading(false)
            return
          }

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
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  // Check for confirmation modal query parameter (only on initial load)
  useEffect(() => {
    const showConfirmation = searchParams.get('showConfirmation')
    if (showConfirmation === 'true') {
      setShowConfirmationModal(true)
      // Remove the query parameter from URL immediately
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, []) // Empty dependency array - only run once on mount

  // Reset editing state when switching away from profile tab
  useEffect(() => {
    if (activeTab !== 'profile') {
      setIsEditingProfile(false)
    }
  }, [activeTab])


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
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
              You need to be logged in as a landlord to access this dashboard.
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:py-8">
          <PageHeader
            category="Landlord Dashboard"
            title={`Welcome, ${user?.first_name || 'User'} ${user?.last_name || ''}`}
            subtitle="Manage your properties and applications"
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
      <DashboardFooter />

      {/* Property Submission Confirmation Modal */}
      <PropertySubmissionConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
      />
    </div>
  )
}

export default function LandlordDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <LandlordDashboardContent />
    </Suspense>
  )
}
