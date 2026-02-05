"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { DashboardNavigationHeader } from "@/components/dashboard-navigation-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { AdminDashboardOverview } from "@/components/admin-dashboard-overview"
import { AdminDashboardProperties } from "@/components/admin-dashboard-properties"
import { AdminDashboardUsers } from "@/components/admin-dashboard-users"
import { AdminDashboardInvestors } from "@/components/admin-dashboard-investors"
import { AdminDashboardViewings } from "@/components/admin-dashboard-viewings"
import { AdminDashboardReports } from "@/components/admin-dashboard-reports"
import { AdminDashboardSettings } from "@/components/admin-dashboard-settings"
import { Card, CardHeader } from "@/components/ui/card"
import { sampleAdmins } from "@/lib/sample-data"
import { AdminDashboardNavigation } from "@/components/admin-dashboard-navigation"
import { supabase } from "@/lib/supabase"

function AdminDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  // In a real app, this would come from authentication
  const currentAdmin = sampleAdmins[0]
  const [activeTab, setActiveTab] = useState(() => {
    // Initialize activeTab from URL parameter or default to "dashboard"
    return searchParams.get('tab') || "dashboard"
  })

  useEffect(() => {
    checkAuth()
  }, [])

  // Update URL when tab changes
  useEffect(() => {
    const currentTab = searchParams.get('tab')
    if (currentTab !== activeTab) {
      // Update URL without page reload
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set('tab', activeTab)
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [activeTab, searchParams])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      setUser(user)

      // Check if user is an admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile?.user_type !== 'admin') {
        setIsLoading(false)
        return
      }

      setUserProfile(profile)
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
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Admin Access Required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You need administrator privileges to access this dashboard.
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
          <Card className="mb-4 bg-gradient-to-r from-red-50 via-red-100/50 to-red-50 border-red-200/30">
            <CardHeader className="md:pb-4 md:pt-4">
              <p className="text-sm font-bold text-red-700/70 uppercase tracking-wide mb-1">
                Admin Dashboard
              </p>
              <h1 className="font-serif text-2xl md:text-4xl font-medium text-red-900 mb-1">
                System Administration
              </h1>
              <p className="text-red-800/70 text-sm">Manage properties, viewings, and platform operations</p>
            </CardHeader>
          </Card>

          <AdminDashboardNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === "dashboard" && <AdminDashboardOverview admin={currentAdmin} onTabChange={setActiveTab} />}
          {activeTab === "properties" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-lg md:text-xl font-medium text-gray-900">Properties</h2>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  Review and manage all property listings on the platform
                </p>
              </div>
              <AdminDashboardProperties currentTab={activeTab} />
            </div>
          )}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-lg md:text-xl font-medium text-gray-900">Landlords</h2>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  Manage landlord accounts and their property listings
                </p>
              </div>
              <AdminDashboardUsers />
            </div>
          )}
          {activeTab === "investors" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-lg md:text-xl font-medium text-gray-900">Investors</h2>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  Manage investor accounts and their preferences
                </p>
              </div>
              <AdminDashboardInvestors />
            </div>
          )}
          {activeTab === "viewings" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-lg md:text-xl font-medium text-gray-900">Viewings</h2>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  Monitor and manage all property viewing requests
                </p>
              </div>
              <AdminDashboardViewings />
            </div>
          )}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-lg md:text-xl font-medium text-gray-900">Documents</h2>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  Review and manage property documents submitted by landlords
                </p>
              </div>
              <AdminDashboardReports />
            </div>
          )}
        </div>
      </main>
      <DashboardFooter />
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  )
}
