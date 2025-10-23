"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { InvestorDashboardNavigation } from "@/components/investor-dashboard-navigation"
import { InvestorDashboardOverview } from "@/components/investor-dashboard-overview"
import { Card, CardHeader } from "@/components/ui/card"
import { sampleInvestors } from "@/lib/sample-data"

export default function InvestorDashboard() {
  // In a real app, this would come from authentication
  const currentInvestor = sampleInvestors[0]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="mb-8 bg-gradient-to-r from-primary/5 via-primary/3 to-accent/5 border-primary/10">
            <CardHeader className="pb-4 pt-4">
              <p className="text-sm font-bold text-primary/70 uppercase tracking-wide mb-1">
                Investor Dashboard
              </p>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-1">
                Welcome back, {currentInvestor.name}
              </h1>
              <p className="text-primary/70 text-lg">Track your property investments and opportunities</p>
            </CardHeader>
          </Card>

          <InvestorDashboardNavigation />
          <InvestorDashboardOverview investor={currentInvestor} />
        </div>
      </main>
      <Footer />
    </div>
  )
}