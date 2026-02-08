import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PropertyTitle } from "@/components/property-title"
import { Bed, Bath, MapPin, Info } from "lucide-react"
import { format } from "date-fns"
import type { Property } from "@/lib/sample-data"
import dynamic from 'next/dynamic'

// Dynamically import PropertyMap (Leaflet requires window object)
const PropertyMap = dynamic(
  () => import('@/components/PropertyMap').then(mod => ({ default: mod.PropertyMap })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted h-[300px] flex items-center justify-center rounded-lg">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-2 animate-pulse" />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    )
  }
)

interface PropertyDetailsProps {
  property: Property
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div>
          <h1 className="font-sans text-xl md:text-2xl font-semibold text-foreground">
            <PropertyTitle
              address={property.address}
              city={property.city}
              postcode={property.postcode}
            />
          </h1>
          <div className="text-lg md:text-xl font-semibold text-accent mt-1">
            £{property.price.toLocaleString()} pcm
          </div>
          <div className="mt-2">
            {(() => {
              // Use string comparison for more reliable date checking
              const availableDateStr = property.availableDate;
              const todayStr = format(new Date(), 'yyyy-MM-dd'); // Current date
              const isAvailableNow = availableDateStr <= todayStr;

              // Debug logging
              console.log('Property:', property.title, 'Available:', availableDateStr, 'Today:', todayStr, 'IsAvailableNow:', isAvailableNow);

              return (
                <Badge className={`font-semibold flex items-center gap-1.5 ${
                  isAvailableNow
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}>
                  {isAvailableNow && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                  )}
                  {isAvailableNow ? 'Available Now' : `Available ${format(new Date(availableDateStr), 'dd/MM/yyyy')}`}
                </Badge>
              );
            })()}
          </div>
        </div>

        {/* Key Stats */}
        <div className="flex flex-wrap gap-4 text-muted-foreground text-base">
          <div className="flex items-center">
            <Bed className="h-[18px] w-[18px] mr-1.5" />
            <span>
              {property.bedrooms} bedroom{property.bedrooms !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center">
            <Bath className="h-[18px] w-[18px] mr-1.5" />
            <span>
              {property.bathrooms} bathroom{property.bathrooms !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Property Details */}
      <div className="space-y-6">
        <h2 className="text-xl font-serif font-semibold">Property Details</h2>

        <div>
          <h3 className="font-medium text-foreground mb-3">Features</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
            {property.amenities.map((amenity) => (
              <li key={amenity} className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span className="text-muted-foreground">{amenity}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Property Type
              </span>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="font-semibold text-foreground">{property.propertyType}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Bedrooms
              </span>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="font-semibold text-foreground">{property.bedrooms}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Bathrooms
              </span>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="font-semibold text-foreground">{property.bathrooms}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Pet Policy
              </span>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="font-semibold text-foreground">
              {property.amenities.includes("Pet-friendly") ? "Pet Friendly" : "No Pets"}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Description */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-semibold">Description</h2>
        <p className="text-muted-foreground leading-relaxed">{property.description}</p>
      </div>


      {/* Location with Map */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent>
          {property.latitude && property.longitude ? (
            <PropertyMap
              latitude={property.latitude}
              longitude={property.longitude}
              address={property.address}
              city={property.city}
              postcode={property.postcode}
            />
          ) : (
            <div className="bg-muted h-[300px] flex items-center justify-center rounded-lg">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Map will be available soon</p>
                <p className="text-sm mt-2">
                  {property.city}
                  {property.postcode && `, ${property.postcode.split(' ')[0]}`}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
