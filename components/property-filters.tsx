"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter } from "lucide-react"
import { format } from "date-fns"

interface PropertyFiltersProps {
  onFilterChange: (filters: any) => void
}

export function PropertyFilters({ onFilterChange }: PropertyFiltersProps) {
  const [priceRange, setPriceRange] = useState([500, 5000])
  const [propertyType, setPropertyType] = useState("all")
  const [city, setCity] = useState("all")
  const [amenities, setAmenities] = useState<string[]>([])
  const [availableDate, setAvailableDate] = useState<Date>()

  const amenityOptions = [
    "Pet-friendly",
    "Parking",
    "Gym",
    "Pool",
    "Balcony",
    "In-unit laundry",
    "Dishwasher",
    "Air conditioning",
  ]

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked ? [...amenities, amenity] : amenities.filter((a) => a !== amenity)
    setAmenities(newAmenities)
    applyFilters({ amenities: newAmenities })
  }

  const applyFilters = (overrides = {}) => {
    const filters = {
      priceRange,
      propertyType,
      city,
      amenities,
      availableDate,
      ...overrides,
    }
    onFilterChange(filters)
  }

  const clearFilters = () => {
    setPriceRange([500, 5000])
    setPropertyType("all")
    setCity("all")
    setAmenities([])
    setAvailableDate(undefined)
    onFilterChange({})
  }

  return (
    <Card className="rounded-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Price Range</Label>
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={(value) => {
                  setPriceRange(value)
                  applyFilters({ priceRange: value })
                }}
                max={5000}
                min={500}
                step={100}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>£{priceRange[0].toLocaleString()}</span>
              <span>£{priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Property Type</Label>
            <Select
              value={propertyType}
              onValueChange={(value) => {
                setPropertyType(value)
                applyFilters({ propertyType: value })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Studio">Studio</SelectItem>
                <SelectItem value="1BR">1 Bedroom</SelectItem>
                <SelectItem value="2BR">2 Bedroom</SelectItem>
                <SelectItem value="3BR+">3+ Bedroom</SelectItem>
                <SelectItem value="House">House</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Location</Label>
            <Select
              value={city}
              onValueChange={(value) => {
                setCity(value)
                applyFilters({ city: value })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                <SelectItem value="San Francisco">San Francisco</SelectItem>
                <SelectItem value="Oakland">Oakland</SelectItem>
                <SelectItem value="Berkeley">Berkeley</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Available Date */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Available Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {availableDate ? format(availableDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={availableDate}
                  onSelect={(date) => {
                    setAvailableDate(date)
                    applyFilters({ availableDate: date })
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Clear Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium opacity-0">Actions</Label>
            <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
              Clear All Filters
            </Button>
          </div>
        </div>
        
        {/* Amenities - Full Width Below */}
        <div className="space-y-3 mt-6">
          <Label className="text-sm font-medium">Amenities</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {amenityOptions.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={amenities.includes(amenity)}
                  onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                />
                <Label htmlFor={amenity} className="text-sm font-normal cursor-pointer">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
