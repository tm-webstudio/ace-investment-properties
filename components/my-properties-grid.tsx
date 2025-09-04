import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MapPin, Bed, Bath, MoreVertical, Edit, Eye, Trash2, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Property } from "@/lib/sample-data"
import Home from "lucide-react/dist/esm/icons/home" // Import the Home icon

interface MyPropertiesGridProps {
  properties: Property[]
}

export function MyPropertiesGrid({ properties }: MyPropertiesGridProps) {
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
            <Link href="/landlord/add-property">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Add Your First Property</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <Image
                  src={property.images[0] || "/placeholder.svg"}
                  alt={property.title}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-accent text-accent-foreground">£{property.price.toLocaleString()}/month</Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="bg-white/90 hover:bg-white">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Listing
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Property
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        View Applications
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Listing
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-card-foreground mb-2">{property.title}</h3>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {property.address}, {property.city}, {property.state}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>{property.bedrooms} bed</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span>{property.bathrooms} bath</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Available {new Date(property.availableDate).toLocaleDateString()}</Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      <span>3 applications</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/properties/${property.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
