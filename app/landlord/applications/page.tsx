import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { ApplicationsTable } from "@/components/applications-table"

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">Applications</h1>
            <p className="text-muted-foreground text-md">Review and manage rental applications</p>
          </div>

          <DashboardNavigation />
          <ApplicationsTable />
        </div>
      </main>
      <Footer />
    </div>
  )
}
