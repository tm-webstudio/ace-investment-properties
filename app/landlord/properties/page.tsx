import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { MyPropertiesGrid } from "@/components/my-properties-grid"
import { sampleProperties, sampleLandlords } from "@/lib/sample-data"

export default function MyPropertiesPage() {
  // In a real app, this would come from authentication
  const currentLandlord = sampleLandlords[0]
  const myProperties = sampleProperties.filter((property) => currentLandlord.properties.includes(property.id))

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">My Properties</h1>
            <p className="text-muted-foreground text-lg">Manage your rental listings</p>
          </div>

          <DashboardNavigation />
          <MyPropertiesGrid properties={myProperties} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
