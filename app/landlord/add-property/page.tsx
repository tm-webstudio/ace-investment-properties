import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AddPropertyForm } from "@/components/add-property-form"
import { PageHeader } from "@/components/page-header"

export default function AddPropertyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeader
            category="Add Property"
            title="List Your Property"
            subtitle="Add a new property to your portfolio"
            variant="primary"
          />

          <AddPropertyForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
