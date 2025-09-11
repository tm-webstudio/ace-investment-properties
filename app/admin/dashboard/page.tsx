"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AdminDashboardOverview } from "@/components/admin-dashboard-overview"
import { sampleAdmins } from "@/lib/sample-data"

export default function AdminDashboard() {
  // In a real app, this would come from authentication
  const currentAdmin = sampleAdmins[0]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">Manage properties, viewings, and platform operations</p>
          </div>

          <AdminDashboardOverview admin={currentAdmin} />
        </div>
      </main>
      <Footer />
    </div>
  )
}