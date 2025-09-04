import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { AddPropertyForm } from "@/components/add-property-form"

export default function AddPropertyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">Add New Property</h1>
            <p className="text-muted-foreground text-lg">List your property and start finding quality tenants</p>
          </div>

          <DashboardNavigation />
          <AddPropertyForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
