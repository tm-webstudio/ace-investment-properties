"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { KeyRound as Pound, MapPin, Home, Calendar, Heart } from "lucide-react"
import { useRouter } from "next/navigation"

interface PreferencesData {
  budgetRange: number[]
  locations: string[]
  propertyTypes: string[]
  amenities: string[]
  moveInTimeline: string
}

export function ClientPreferencesForm() {
  const router = useRouter()
  const [preferences, setPreferences] = useState<PreferencesData>({
    budgetRange: [1500, 3500],
    locations: [],
    propertyTypes: [],
    amenities: [],
    moveInTimeline: "",
  })

  const locationOptions = [
    "San Francisco",
    "Oakland",
    "Berkeley",
    "San Jose",
    "Palo Alto",
    "Mountain View",
    "Fremont",
    "Hayward",
  ]

  const propertyTypeOptions = [
    { value: "Studio", label: "Studio" },
    { value: "1BR", label: "1 Bedroom" },
    { value: "2BR", label: "2 Bedroom" },
    { value: "3BR+", label: "3+ Bedroom" },
    { value: "House", label: "House" },
  ]

  const amenityOptions = [
    "Pet-friendly",
    "Parking",
    "Gym",
    "Pool",
    "Balcony",
    "In-unit laundry",
    "Dishwasher",
    "Air conditioning",
    "Heating",
    "Hardwood floors",
    "Walk-in closet",
    "Storage unit",
    "Elevator",
    "Security system",
    "Garden access",
  ]

  const timelineOptions = [
    { value: "asap", label: "ASAP" },
    { value: "1month", label: "Within 1 month" },
    { value: "2months", label: "Within 2 months" },
    { value: "3months", label: "Within 3 months" },
    { value: "flexible", label: "Flexible" },
  ]

  const handleLocationToggle = (location: string) => {
    const newLocations = preferences.locations.includes(location)
      ? preferences.locations.filter((l) => l !== location)
      : [...preferences.locations, location]
    setPreferences((prev) => ({ ...prev, locations: newLocations }))
  }

  const handlePropertyTypeToggle = (type: string) => {
    const newTypes = preferences.propertyTypes.includes(type)
      ? preferences.propertyTypes.filter((t) => t !== type)
      : [...preferences.propertyTypes, type]
    setPreferences((prev) => ({ ...prev, propertyTypes: newTypes }))
  }

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = preferences.amenities.includes(amenity)
      ? preferences.amenities.filter((a) => a !== amenity)
      : [...preferences.amenities, amenity]
    setPreferences((prev) => ({ ...prev, amenities: newAmenities }))
  }

  const handleSubmit = () => {
    // In a real app, this would save to user profile
    console.log("Preferences saved:", preferences)
    router.push("/properties")
  }

  return (
    <div className="space-y-6">
      {/* Budget Range */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pound className="h-5 w-5" />
            Budget Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="px-2">
            <Slider
              value={preferences.budgetRange}
              onValueChange={(value) => setPreferences((prev) => ({ ...prev, budgetRange: value }))}
              max={8000}
              min={500}
              step={100}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>£{preferences.budgetRange[0].toLocaleString()}</span>
            <span>£{preferences.budgetRange[1].toLocaleString()}</span>
          </div>
          <p className="text-center text-lg font-semibold">
            £{preferences.budgetRange[0].toLocaleString()} - £{preferences.budgetRange[1].toLocaleString()} per month
          </p>
        </CardContent>
      </Card>

      {/* Preferred Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Preferred Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {locationOptions.map((location) => (
              <Button
                key={location}
                variant={preferences.locations.includes(location) ? "default" : "outline"}
                onClick={() => handleLocationToggle(location)}
                className={
                  preferences.locations.includes(location)
                    ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                    : "bg-transparent"
                }
              >
                {location}
              </Button>
            ))}
          </div>
          {preferences.locations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Selected:</span>
              {preferences.locations.map((location) => (
                <Badge key={location} variant="secondary">
                  {location}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {propertyTypeOptions.map((type) => (
              <Button
                key={type.value}
                variant={preferences.propertyTypes.includes(type.value) ? "default" : "outline"}
                onClick={() => handlePropertyTypeToggle(type.value)}
                className={
                  preferences.propertyTypes.includes(type.value)
                    ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                    : "bg-transparent"
                }
              >
                {type.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Must-Have Amenities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Must-Have Amenities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {amenityOptions.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={preferences.amenities.includes(amenity)}
                  onCheckedChange={() => handleAmenityToggle(amenity)}
                />
                <Label htmlFor={amenity} className="text-sm font-normal cursor-pointer">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
          {preferences.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Selected:</span>
              {preferences.amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary">
                  {amenity}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Move-in Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Move-in Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences.moveInTimeline}
            onValueChange={(value) => setPreferences((prev) => ({ ...prev, moveInTimeline: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="When are you looking to move?" />
            </SelectTrigger>
            <SelectContent>
              {timelineOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 text-lg"
        >
          Save Preferences & Find Properties
        </Button>
      </div>
    </div>
  )
}
