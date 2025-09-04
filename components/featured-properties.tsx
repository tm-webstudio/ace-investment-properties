import { sampleProperties } from "@/lib/sample-data"
import { PropertyCard } from "@/components/property-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function FeaturedProperties() {
  const featuredProperties = sampleProperties.filter((property) => property.featured).slice(0, 6)

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Rental Properties</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Discover our handpicked selection of premium rental properties available now
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12 gap-5">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="text-center">
          <Link href="/properties">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
