import { MinimalHeader } from "@/components/minimal-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { AddPropertyForm } from "@/components/add-property-form"
import { PageHeader } from "@/components/page-header"

export default function AddPropertyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MinimalHeader />
      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <PageHeader
            category="Submit Property"
            title="List Your Property"
            subtitle="Submit a new property to your portfolio"
            variant="primary"
          />

          <AddPropertyForm />
        </div>
      </main>
      <DashboardFooter />
    </div>
  )
}
