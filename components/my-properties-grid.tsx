import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Link from "next/link"
import { PropertyCard } from "./property-card"

interface Property {
  id: string
  property_type: string
  bedrooms: string
  bathrooms: string
  monthly_rent: number
  available_date: string
  description: string
  amenities: string[]
  address: string
  city: string
  localAuthority: string
  postcode: string
  photos: string[]
  status: string
  published_at: string
  created_at: string
  updated_at: string
  availability: string
}

interface MyPropertiesGridProps {
  properties: Property[]
  onPropertyDeleted?: () => void
}

export function MyPropertiesGrid({ properties, onPropertyDeleted }: MyPropertiesGridProps) {
  return (
    <div className="space-y-6">
      {properties.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              <Home className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Properties Yet</h3>
              <p>Start building your rental portfolio by adding your first property.</p>
            </div>
            <Link href="/landlord/submit-property">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Submit Your First Property</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} variant="landlord" onPropertyDeleted={onPropertyDeleted} />
          ))}
        </div>
      )}
    </div>
  )
}
