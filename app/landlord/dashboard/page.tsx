import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { DashboardOverview } from "@/components/dashboard-overview"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { sampleLandlords } from "@/lib/sample-data"

export default function LandlordDashboard() {
  // In a real app, this would come from authentication
  const currentLandlord = sampleLandlords[0]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome back, {currentLandlord.name}
            </h1>
            <p className="text-muted-foreground text-lg">Manage your properties and applications</p>
          </div>

          <DashboardNavigation />
          <DashboardOverview landlord={currentLandlord} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
