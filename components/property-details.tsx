import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Bed, Bath, MapPin } from "lucide-react"
import { format } from "date-fns"
import type { Property } from "@/lib/sample-data"

interface PropertyDetailsProps {
  property: Property
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">{property.title}</h1>
          <div className="text-2xl font-semibold text-accent mt-2">
            £{property.price.toLocaleString()} pcm
          </div>
          <div className="mt-3">
            {(() => {
              // Use string comparison for more reliable date checking
              const availableDateStr = property.availableDate;
              const todayStr = '2025-09-04'; // Current date
              const isAvailableNow = availableDateStr <= todayStr;
              
              // Debug logging
              console.log('Property:', property.title, 'Available:', availableDateStr, 'Today:', todayStr, 'IsAvailableNow:', isAvailableNow);
              
              return (
                <Badge className={`font-semibold ${
                  isAvailableNow 
                    ? 'bg-accent text-accent-foreground hover:bg-accent/90' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}>
                  {isAvailableNow ? 'Available Now' : `Available ${format(new Date(availableDateStr), 'dd/MM/yyyy')}`}
                </Badge>
              );
            })()}
          </div>
        </div>

        {/* Key Stats */}
        <div className="flex flex-wrap gap-6 text-muted-foreground">
          <div className="flex items-center">
            <Bed className="h-5 w-5 mr-2" />
            <span className="font-medium">
              {property.bedrooms} bedroom{property.bedrooms !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center">
            <Bath className="h-5 w-5 mr-2" />
            <span className="font-medium">
              {property.bathrooms} bathroom{property.bathrooms !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Description */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-semibold">Description</h2>
        <p className="text-muted-foreground leading-relaxed">{property.description}</p>
      </div>

      <Separator />

      {/* Property Details */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Type</span>
                  <span className="font-medium">{property.propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Rent</span>
                  <span className="font-medium">£{property.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Security Deposit</span>
                  <span className="font-medium">£{property.deposit.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bedrooms</span>
                  <span className="font-medium">{property.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bathrooms</span>
                  <span className="font-medium">{property.bathrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Date</span>
                  <span className="font-medium">{format(new Date(property.availableDate), 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pet Policy</span>
                  <span className="font-medium">
                    {property.amenities.includes("Pet-friendly") ? "Pet Friendly" : "No Pets"}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-3">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="py-2">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Map Placeholder */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Interactive Map</p>
              <p className="text-sm">
                {property.address}, {property.city}, {property.state}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
