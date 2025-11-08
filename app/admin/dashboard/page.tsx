"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AdminDashboardOverview } from "@/components/admin-dashboard-overview"
import { AdminDashboardProperties } from "@/components/admin-dashboard-properties"
import { AdminDashboardUsers } from "@/components/admin-dashboard-users"
import { AdminDashboardViewings } from "@/components/admin-dashboard-viewings"
import { AdminDashboardReports } from "@/components/admin-dashboard-reports"
import { AdminDashboardSettings } from "@/components/admin-dashboard-settings"
import { Card, CardHeader } from "@/components/ui/card"
import { sampleAdmins } from "@/lib/sample-data"
import { AdminDashboardNavigation } from "@/components/admin-dashboard-navigation"

export default function AdminDashboard() {
  // In a real app, this would come from authentication
  const currentAdmin = sampleAdmins[0]
  const [activeTab, setActiveTab] = useState("dashboard")

  const getPageSubtitle = () => {
    switch (activeTab) {
      case "properties":
        return "View and manage all property listings"
      case "pending-properties":
        return "Review and approve pending property submissions"
      case "landlords":
        return "Manage landlord accounts and profiles"
      case "investors":
        return "Manage investor accounts and profiles"
      case "viewings":
        return "Monitor and manage property viewings"
      case "documents":
        return "Review and manage landlord documents"
      case "settings":
        return "Configure platform settings and preferences"
      default:
        return "Manage properties, viewings, and platform operations"
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="mb-8 bg-gradient-to-r from-red-50 via-red-100/50 to-red-50 border-red-200/30">
            <CardHeader className="pb-4 pt-4">
              <p className="text-sm font-bold text-red-700/70 uppercase tracking-wide mb-1">
                Admin Dashboard
              </p>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-red-900 mb-1">
                System Administration
              </h1>
              <p className="text-red-800/70 text-md">{getPageSubtitle()}</p>
            </CardHeader>
          </Card>

          <AdminDashboardNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === "dashboard" && <AdminDashboardOverview admin={currentAdmin} />}
          {activeTab === "properties" && <AdminDashboardProperties />}
          {activeTab === "pending-properties" && <AdminDashboardProperties pendingOnly={true} />}
          {activeTab === "landlords" && <AdminDashboardUsers userType="landlord" />}
          {activeTab === "investors" && <AdminDashboardUsers userType="investor" />}
          {activeTab === "viewings" && <AdminDashboardViewings />}
          {activeTab === "documents" && <AdminDashboardReports />}
          {activeTab === "settings" && <AdminDashboardSettings />}
        </div>
      </main>
      <Footer />
    </div>
  )
}