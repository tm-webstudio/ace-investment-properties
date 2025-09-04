import { sampleProperties } from "@/lib/sample-data"
import { PropertyCard } from "@/components/property-card"

interface SimilarPropertiesProps {
  currentPropertyId: string
  propertyType: string
}

export function SimilarProperties({ currentPropertyId, propertyType }: SimilarPropertiesProps) {
  const similarProperties = sampleProperties
    .filter((property) => property.id !== currentPropertyId && property.propertyType === propertyType)
    .slice(0, 3)

  if (similarProperties.length === 0) {
    return null
  }

  return (
    <section className="mt-16">
      <div className="mb-8">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">Similar Properties</h2>
        <p className="text-muted-foreground">Other {propertyType} properties you might be interested in</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  )
}
