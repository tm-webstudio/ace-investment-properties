"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bed, Bath, Heart, MoreVertical, Edit, Eye, Trash2, Users } from "lucide-react"
import { format } from "date-fns"
import { supabase } from "@/lib/supabase"
import type { Property } from "@/lib/sample-data"

interface PropertyCardProps {
  property: Property
  variant?: 'default' | 'landlord' // 'default' shows heart, 'landlord' shows dropdown
  onPropertyDeleted?: () => void // Callback for when property is deleted
}

export function PropertyCard({ property, variant = 'default', onPropertyDeleted }: PropertyCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if clicking on non-interactive elements
    if (variant === 'landlord' && !(e.target as HTMLElement).closest('[data-dropdown-trigger]')) {
      window.location.href = `/properties/${property.id}`
    }
  }

  const handleDeleteProperty = async () => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        alert('Please log in to delete properties')
        return
      }

      const response = await fetch(`/api/landlord/properties/${property.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete property')
      }

      if (data.success) {
        // Call the callback to refresh the property list
        if (onPropertyDeleted) {
          onPropertyDeleted()
        }
        alert('Property deleted successfully')
      } else {
        throw new Error(data.error || 'Failed to delete property')
      }
    } catch (error: any) {
      console.error('Error deleting property:', error)
      alert(`Error deleting property: ${error.message}`)
    } finally {
      setIsDeleting(false)
    }
  }
  if (variant === 'landlord') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-border/50 hover:border-accent/20 p-0 gap-3.5 rounded-none">
        <div className="relative overflow-hidden cursor-pointer" onClick={handleCardClick}>
          <Image
            src={(property.images || property.photos)?.[0] || "/placeholder.svg"}
            alt={property.title || `${property.property_type} in ${property.city}`}
            width={400}
            height={250}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            {(() => {
              // Use available_date for landlord variant
              const availableDateStr = property.availableDate || property.available_date;
              const todayStr = '2025-09-04';
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
          <div className="absolute top-4 right-4 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="bg-white/95 hover:bg-white shadow-lg border border-gray-200/50 transition-all duration-200 hover:shadow-xl data-[state=open]:bg-white data-[state=open]:shadow-xl"
                  data-dropdown-trigger
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <MoreVertical className="h-4 w-4 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="z-50 min-w-[180px] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                sideOffset={8}
                data-dropdown-trigger
              >
                <DropdownMenuItem asChild>
                  <Link href={`/properties/${property.id}`} className="cursor-pointer transition-colors duration-150">
                    <Eye className="mr-2 h-4 w-4" />
                    View Listing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/landlord/properties/${property.id}/edit`} className="cursor-pointer transition-colors duration-150">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Property
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer transition-colors duration-150">
                  <Users className="mr-2 h-4 w-4" />
                  View Applications
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 cursor-pointer transition-colors duration-150 focus:text-red-700 focus:bg-red-50"
                  onClick={(e) => {
                    e.preventDefault()
                    handleDeleteProperty()
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Delete Listing'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <CardContent className="px-5 pb-4 pr-4 pl-4 cursor-pointer" onClick={handleCardClick}>
          <div className="space-y-2.5">
            <div className="mb-1.5">
              <h3 className="font-serif text-lg font-semibold text-card-foreground mb-1 line-clamp-1">
                {property.title}
              </h3>
              <div className="text-base font-semibold text-accent">
                £{(property.price || property.monthly_rent)?.toLocaleString()} pcm
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                <span>
                  {property.bedrooms} bed{property.bedrooms !== '1' ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                <span>
                  {property.bathrooms} bath{property.bathrooms !== '1' ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(property.amenities || []).slice(0, 3).map((amenity) => (
                <Badge key={amenity} variant="secondary" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {(property.amenities || []).length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{(property.amenities || []).length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant with heart icon
  return (
    <Link href={`/properties/${property.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-border/50 hover:border-accent/20 cursor-pointer p-0 gap-3.5 rounded-none">
        <div className="relative overflow-hidden">
          <Image
            src={property.images[0] || "/placeholder.svg"}
            alt={property.title}
            width={400}
            height={250}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
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

        <CardContent className="px-5 pb-4 pr-4 pl-4">
          <div className="space-y-2.5">
            <div className="mb-1.5">
              <h3 className="font-serif text-lg font-semibold text-card-foreground mb-1 line-clamp-1">
                {property.title}
              </h3>
              <div className="text-base font-semibold text-accent">
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
