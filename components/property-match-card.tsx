"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MapPin, Bed, Bath, Calendar, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface PropertyMatchCardProps {
  property: {
    id: string
    title?: string
    address: string
    city: string
    property_type: string
    bedrooms: string
    bathrooms: string
    monthly_rent: number
    photos: string[]
    available_date?: string
    matchScore: number
    matchReasons: string[]
  }
  onSave?: (propertyId: string) => void
  isSaved?: boolean
}

export function PropertyMatchCard({ property, onSave, isSaved = false }: PropertyMatchCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-orange-500"
  }

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-green-700"
    if (score >= 60) return "text-yellow-700"
    return "text-orange-700"
  }

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(property.id)
    } finally {
      setSaving(false)
    }
  }

  const primaryImage = property.photos?.[0] || "/placeholder-property.jpg"
  const propertyTitle = property.title || `${property.bedrooms} Bedroom ${property.property_type}`

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative">
        {/* Property Image */}
        <div className="aspect-[4/3] relative overflow-hidden">
          <Image
            src={primaryImage}
            alt={propertyTitle}
            fill
            className={cn(
              "object-cover transition-transform group-hover:scale-105",
              isImageLoading && "animate-pulse bg-gray-200"
            )}
            onLoad={() => setIsImageLoading(false)}
            onError={() => setIsImageLoading(false)}
          />
          
          {/* Match Score Badge */}
          <div className="absolute top-3 left-3">
            <Badge 
              className={cn(
                "text-white font-semibold text-xs px-2 py-1",
                getScoreColor(property.matchScore)
              )}
            >
              {property.matchScore}% Match
            </Badge>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full transition-all",
              "bg-white/90 hover:bg-white shadow-sm",
              isSaved ? "text-red-500" : "text-gray-600 hover:text-red-500"
            )}
          >
            <Heart 
              className={cn(
                "h-4 w-4 transition-all",
                isSaved && "fill-current"
              )}
            />
          </button>
        </div>

        <CardContent className="p-4">
          {/* Property Title & Location */}
          <div className="space-y-2 mb-3">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {propertyTitle}
            </h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{property.address}, {property.city}</span>
            </div>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms}</span>
            </div>
            {property.available_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(property.available_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-3">
            <span className="text-2xl font-bold text-gray-900">
              £{property.monthly_rent.toLocaleString()}
            </span>
            <span className="text-gray-600 text-sm">/month</span>
          </div>

          {/* Match Reasons */}
          <div className="mb-4">
            <div className={cn(
              "text-xs font-medium mb-2",
              getScoreTextColor(property.matchScore)
            )}>
              Why this matches:
            </div>
            <div className="flex flex-wrap gap-1">
              {property.matchReasons.slice(0, 3).map((reason, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700"
                >
                  {reason}
                </Badge>
              ))}
              {property.matchReasons.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-gray-100 text-gray-600">
                  +{property.matchReasons.length - 3} more
                </Badge>
              )}
            </div>
          </div>

        </CardContent>
      </div>
    </Card>
  )
}