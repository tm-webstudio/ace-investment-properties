"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AdminDashboardOverview } from "@/components/admin-dashboard-overview"
import { Card, CardHeader } from "@/components/ui/card"
import { sampleAdmins } from "@/lib/sample-data"

export default function AdminDashboard() {
  // In a real app, this would come from authentication
  const currentAdmin = sampleAdmins[0]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="mb-8 bg-gradient-to-r from-primary/5 via-primary/3 to-accent/5 border-primary/10">
            <CardHeader className="pb-4 pt-4">
              <p className="text-sm font-bold text-primary/70 uppercase tracking-wide mb-1">
                Admin Dashboard
              </p>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-1">
                System Administration
              </h1>
              <p className="text-primary/70 text-lg">Manage properties, viewings, and platform operations</p>
            </CardHeader>
          </Card>

          <AdminDashboardOverview admin={currentAdmin} />
        </div>
      </main>
      <Footer />
    </div>
  )
}