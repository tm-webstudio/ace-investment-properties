"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, MapPin, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getAllRegions,
  getCitiesForRegion,
  getLocalAuthoritiesForCity
} from "@/lib/uk-locations"

interface Location {
  id: string
  region: string
  city: string
  localAuthorities: string[]
}

interface Step3Data {
  locations: Location[]
  additionalPreferences: string
  availableFrom: Date | null
  immediateAvailability: boolean
}

interface OnboardingStep3Props {
  data: Step3Data
  onChange: (data: Partial<Step3Data>) => void
}

export function OnboardingStep3({ data, onChange }: OnboardingStep3Props) {
  const [newLocation, setNewLocation] = useState({
    region: "",
    city: "",
    localAuthorities: [] as string[]
  })
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedAuthority, setSelectedAuthority] = useState("")

  const handleAddLocation = () => {
    if (!newLocation.region || !newLocation.city.trim()) return

    const location: Location = {
      id: Date.now().toString(),
      region: newLocation.region,
      city: newLocation.city.trim(),
      localAuthorities: newLocation.localAuthorities
    }

    onChange({
      locations: [...data.locations, location]
    })

    setNewLocation({ region: "", city: "", localAuthorities: [] })
    setShowLocationForm(false)
  }

  const handleAddAuthority = (authority: string) => {
    if (authority && !newLocation.localAuthorities.includes(authority)) {
      setNewLocation(prev => ({
        ...prev,
        localAuthorities: [...prev.localAuthorities, authority]
      }))
      setSelectedAuthority("")
    }
  }

  const handleRemoveAuthority = (authorityToRemove: string) => {
    setNewLocation(prev => ({
      ...prev,
      localAuthorities: prev.localAuthorities.filter(a => a !== authorityToRemove)
    }))
  }

  const handleRegionChange = (region: string) => {
    setNewLocation({
      region,
      city: "",
      localAuthorities: []
    })
  }

  const handleCityChange = (city: string) => {
    setNewLocation(prev => ({
      ...prev,
      city,
      localAuthorities: []
    }))
  }

  const handleRemoveLocation = (locationId: string) => {
    onChange({
      locations: data.locations.filter(loc => loc.id !== locationId)
    })
  }

  const handleDateSelect = (date: Date | undefined) => {
    onChange({ 
      availableFrom: date || null,
      immediateAvailability: false
    })
    setShowCalendar(false)
  }

  const handleImmediateAvailabilityChange = (checked: boolean) => {
    onChange({
      immediateAvailability: checked,
      availableFrom: checked ? null : data.availableFrom
    })
  }

  return (
    <div className="space-y-6">
      {/* Location Selection */}
      <div>
        <Label className="text-base font-medium text-gray-900 mb-4 block">
          Where are you looking for property? <span className="text-red-500">*</span>
        </Label>
        
        {/* Added Locations */}
        {data.locations.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {data.locations.map((location) => (
              <Badge
                key={location.id}
                variant="secondary"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm"
              >
                <MapPin className="h-3 w-3" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{location.city}</span>
                  <span className="text-xs opacity-70">{location.region}</span>
                  {location.localAuthorities && location.localAuthorities.length > 0 && (
                    <span className="text-xs opacity-60 mt-0.5">
                      {location.localAuthorities.length === 1
                        ? location.localAuthorities[0]
                        : `${location.localAuthorities.length} areas`}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveLocation(location.id)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Add Location Form */}
        {showLocationForm ? (
          <div className="p-4 border border-gray-200 rounded-lg space-y-4">
            {/* Step 1: Select Main Region */}
            <div>
              <Label htmlFor="region" className="text-sm font-medium text-gray-700 mb-2 block">
                1. Which part of England are you looking for property?
              </Label>
              <Select
                value={newLocation.region}
                onValueChange={handleRegionChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select main region" />
                </SelectTrigger>
                <SelectContent>
                  {getAllRegions().map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: Select Sub-Region */}
            {newLocation.region && (
              <div>
                <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2 block">
                  2. Which part of {newLocation.region}?
                </Label>
                <Select
                  value={newLocation.city}
                  onValueChange={handleCityChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCitiesForRegion(newLocation.region).map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Step 3: Select Local Authorities */}
            {newLocation.city && getLocalAuthoritiesForCity(newLocation.city).length > 0 && (
              <div>
                <Label htmlFor="authorities" className="text-sm font-medium text-gray-700 mb-2 block">
                  3. Select Specific Areas (optional)
                </Label>

                {/* Selected Authorities */}
                {newLocation.localAuthorities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {newLocation.localAuthorities.map((authority) => (
                      <Badge
                        key={authority}
                        variant="secondary"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs"
                      >
                        {authority}
                        <button
                          onClick={() => handleRemoveAuthority(authority)}
                          className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Authority Dropdown */}
                <Select
                  value={selectedAuthority}
                  onValueChange={(value) => {
                    handleAddAuthority(value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select local authorities" />
                  </SelectTrigger>
                  <SelectContent>
                    {getLocalAuthoritiesForCity(newLocation.city)
                      .filter(authority => !newLocation.localAuthorities.includes(authority))
                      .map((authority) => (
                        <SelectItem key={authority} value={authority}>
                          {authority}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to include all areas in {newLocation.city}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleAddLocation}
                size="sm"
                disabled={!newLocation.region || !newLocation.city}
              >
                Add Location
              </Button>
              <Button
                onClick={() => {
                  setShowLocationForm(false)
                  setNewLocation({ region: "", city: "", localAuthorities: [] })
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowLocationForm(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        )}
      </div>

      {/* Additional Preferences */}
      <div>
        <Label htmlFor="additionalPreferences" className="text-base font-medium text-gray-900 mb-4 block">
          Additional preferences (optional)
        </Label>
        <Textarea
          id="additionalPreferences"
          value={data.additionalPreferences}
          onChange={(e) => onChange({ additionalPreferences: e.target.value })}
          placeholder="e.g., Parking required, Garden/Outdoor space, Furnished, Bills included, Wheelchair accessible"
          className="min-h-[100px]"
        />
      </div>

      {/* Availability */}
      <div>
        <Label className="text-base font-medium text-gray-900 mb-4 block">
          When are you looking for property? <span className="text-red-500">*</span>
        </Label>
        
        {/* Immediate Availability Option */}
        <div className="mb-4">
          <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
            <Checkbox
              id="immediate"
              checked={data.immediateAvailability}
              onCheckedChange={handleImmediateAvailabilityChange}
            />
            <Label htmlFor="immediate" className="cursor-pointer font-medium">
              I'm looking for properties available now
            </Label>
          </div>
        </div>

        {/* Date Picker */}
        {!data.immediateAvailability && (
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Looking from
            </Label>
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data.availableFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.availableFrom ? (
                    data.availableFrom.toLocaleDateString()
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.availableFrom || undefined}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </div>
  )
}