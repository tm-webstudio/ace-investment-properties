"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bed, Bath, Heart } from "lucide-react"
import { format } from "date-fns"
import type { Property } from "@/lib/sample-data"

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/properties/${property.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-border/50 hover:border-accent/20 cursor-pointer p-0 gap-3.5 rounded-none">
        <div className="relative overflow-hidden">
          <Image
            src={property.images[0] || "/placeholder.svg"}
            alt={property.title}
            width={400}
            height={250}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            {(() => {
              // Use string comparison for more reliable date checking
              const availableDateStr = property.availableDate;
              const todayStr = '2025-09-04'; // Current date
              const isAvailableNow = availableDateStr <= todayStr;
              
              return (
                <Badge className={`font-semibold shadow-lg ${
                  isAvailableNow 
                    ? 'bg-accent text-accent-foreground hover:bg-accent/90' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}>
                  {isAvailableNow ? 'Available Now' : `Available ${format(new Date(availableDateStr), 'dd/MM/yyyy')}`}
                </Badge>
              );
            })()}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 shadow-lg transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="h-5 w-5" />
          </Button>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <CardContent className="px-6 pb-5 pr-5 pl-5">
          <div className="space-y-3">
            <div className="mb-1.5">
              <h3 className="font-serif text-xl font-semibold text-card-foreground mb-1.5 line-clamp-1">
                {property.title}
              </h3>
              <div className="text-lg font-semibold text-accent">
                £{property.price.toLocaleString()} pcm
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                <span>
                  {property.bedrooms} bed{property.bedrooms !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                <span>
                  {property.bathrooms} bath{property.bathrooms !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {property.amenities.slice(0, 3).map((amenity) => (
                <Badge key={amenity} variant="secondary" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{property.amenities.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
