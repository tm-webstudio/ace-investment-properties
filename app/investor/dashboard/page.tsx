"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { InvestorDashboardNavigation } from "@/components/investor-dashboard-navigation"
import { InvestorDashboardOverview } from "@/components/investor-dashboard-overview"
import { sampleInvestors } from "@/lib/sample-data"

export default function InvestorDashboard() {
  // In a real app, this would come from authentication
  const currentInvestor = sampleInvestors[0]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome back, {currentInvestor.name}
            </h1>
            <p className="text-muted-foreground text-lg">Track your property investments and opportunities</p>
          </div>

          <InvestorDashboardNavigation />
          <InvestorDashboardOverview investor={currentInvestor} />
        </div>
      </main>
      <Footer />
    </div>
  )
}