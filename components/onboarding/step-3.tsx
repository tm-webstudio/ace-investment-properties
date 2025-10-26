"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, MapPin, Plus, X } from "lucide-react"
// import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Location {
  id: string
  city: string
  areas: string[]
  radius: number
}

interface Step3Data {
  locations: Location[]
  additionalPreferences: string[]
  availableFrom: Date | null
  immediateAvailability: boolean
}

interface OnboardingStep3Props {
  data: Step3Data
  onChange: (data: Partial<Step3Data>) => void
}

const radiusOptions = [
  { value: 1, label: "1 mile" },
  { value: 3, label: "3 miles" },
  { value: 5, label: "5 miles" },
  { value: 10, label: "10 miles" },
  { value: 15, label: "15 miles" },
  { value: 20, label: "20+ miles" }
]

const additionalPreferenceOptions = [
  { id: "parking", label: "Parking required" },
  { id: "garden", label: "Garden/Outdoor space" },
  { id: "pet_friendly", label: "Pet-friendly" },
  { id: "furnished", label: "Furnished" },
  { id: "bills_included", label: "Bills included" }
]

export function OnboardingStep3({ data, onChange }: OnboardingStep3Props) {
  const [newLocation, setNewLocation] = useState({
    city: "",
    areas: "",
    radius: 5
  })
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

  const handleAddLocation = () => {
    if (!newLocation.city.trim()) return

    const location: Location = {
      id: Date.now().toString(),
      city: newLocation.city.trim(),
      areas: newLocation.areas ? newLocation.areas.split(",").map(area => area.trim()).filter(Boolean) : [],
      radius: newLocation.radius
    }

    onChange({
      locations: [...data.locations, location]
    })

    setNewLocation({ city: "", areas: "", radius: 5 })
    setShowLocationForm(false)
  }

  const handleRemoveLocation = (locationId: string) => {
    onChange({
      locations: data.locations.filter(loc => loc.id !== locationId)
    })
  }

  const handleAdditionalPreferenceChange = (preferenceId: string, checked: boolean) => {
    let newPreferences = [...data.additionalPreferences]
    
    if (checked) {
      newPreferences.push(preferenceId)
    } else {
      newPreferences = newPreferences.filter(id => id !== preferenceId)
    }
    
    onChange({ additionalPreferences: newPreferences })
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
          Where are you looking? <span className="text-red-500">*</span>
        </Label>
        
        {/* Added Locations */}
        {data.locations.length > 0 && (
          <div className="mb-4 space-y-2">
            {data.locations.map((location) => (
              <Badge
                key={location.id}
                variant="secondary"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm"
              >
                <MapPin className="h-3 w-3" />
                {location.city}
                {location.areas.length > 0 && ` (${location.areas.join(", ")})`}
                <span className="text-xs text-gray-500">• {location.radius} mi</span>
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
            <div>
              <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2 block">
                City/Town
              </Label>
              <Input
                id="city"
                value={newLocation.city}
                onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
                placeholder="e.g., London, Manchester, Birmingham"
                autoFocus
              />
            </div>
            
            <div>
              <Label htmlFor="areas" className="text-sm font-medium text-gray-700 mb-2 block">
                Specific areas (optional)
              </Label>
              <Input
                id="areas"
                value={newLocation.areas}
                onChange={(e) => setNewLocation(prev => ({ ...prev, areas: e.target.value }))}
                placeholder="e.g., Shoreditch, Camden, King's Cross (comma-separated)"
              />
            </div>
            
            <div>
              <Label htmlFor="radius" className="text-sm font-medium text-gray-700 mb-2 block">
                Search radius
              </Label>
              <Select
                value={newLocation.radius.toString()}
                onValueChange={(value) => setNewLocation(prev => ({ ...prev, radius: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {radiusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAddLocation} size="sm">
                Add Location
              </Button>
              <Button 
                onClick={() => setShowLocationForm(false)} 
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
        <Label className="text-base font-medium text-gray-900 mb-4 block">
          Additional preferences (optional)
        </Label>
        <div className="space-y-3">
          {additionalPreferenceOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
              <Checkbox
                id={option.id}
                checked={data.additionalPreferences.includes(option.id)}
                onCheckedChange={(checked) => handleAdditionalPreferenceChange(option.id, checked as boolean)}
              />
              <Label
                htmlFor={option.id}
                className="flex-1 cursor-pointer font-medium"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <Label className="text-base font-medium text-gray-900 mb-4 block">
          When do you need properties? <span className="text-red-500">*</span>
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
              I'm looking for immediate availability
            </Label>
          </div>
        </div>

        {/* Date Picker */}
        {!data.immediateAvailability && (
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Available from
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