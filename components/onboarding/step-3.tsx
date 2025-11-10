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
// import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Location {
  id: string
  city: string
  areas: string[]
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

const cityAreasMap: Record<string, string[]> = {
  "London": [
    "Barking and Dagenham", "Barnet", "Bexley", "Brent", "Bromley", "Camden", "Croydon",
    "Ealing", "Enfield", "Greenwich", "Hackney", "Hammersmith and Fulham", "Haringey",
    "Harrow", "Havering", "Hillingdon", "Hounslow", "Islington", "Kensington and Chelsea",
    "Kingston upon Thames", "Lambeth", "Lewisham", "Merton", "Newham", "Redbridge",
    "Richmond upon Thames", "Southwark", "Sutton", "Tower Hamlets", "Waltham Forest",
    "Wandsworth", "Westminster"
  ],
  "Birmingham": [
    "Aston", "Balsall Heath", "Bordesley Green", "Edgbaston", "Erdington", "Hall Green",
    "Handsworth", "Harborne", "Kings Heath", "Ladywood", "Moseley", "Northfield",
    "Perry Barr", "Quinton", "Saltley", "Selly Oak", "Small Heath", "Sparkbrook",
    "Stirchley", "Sutton Coldfield", "Yardley"
  ],
  "Manchester": [
    "Ancoats", "Ardwick", "Blackley", "Cheetham Hill", "Chorlton", "City Centre",
    "Didsbury", "Fallowfield", "Gorton", "Hulme", "Levenshulme", "Moss Side",
    "Old Trafford", "Rusholme", "Salford", "Stockport", "Stretford", "Withington",
    "Wythenshawe"
  ],
  "Liverpool": [
    "Aigburth", "Allerton", "Anfield", "Belle Vale", "Childwall", "City Centre",
    "Crosby", "Everton", "Fairfield", "Kensington", "Kirkdale", "Mossley Hill",
    "Old Swan", "Toxteth", "Walton", "Wavertree", "West Derby", "Woolton"
  ],
  "Leeds": [
    "Armley", "Beeston", "Bramley", "Chapel Allerton", "City Centre", "Crossgates",
    "Farnley", "Gipton", "Harehills", "Headingley", "Holbeck", "Horsforth",
    "Hyde Park", "Kirkstall", "Meanwood", "Morley", "Pudsey", "Roundhay",
    "Seacroft", "Wetherby"
  ],
  "Newcastle": [
    "Benwell", "Byker", "City Centre", "Elswick", "Fenham", "Gosforth",
    "Heaton", "Jesmond", "Kenton", "Newcastle", "Ouseburn", "Shieldfield",
    "Walker", "Wallsend", "Westerhope"
  ],
  "Brighton": [
    "Brighton Marina", "City Centre", "Hanover", "Hove", "Kemptown",
    "Moulsecoomb", "Patcham", "Portslade", "Preston Park", "Saltdean",
    "Shoreham", "Whitehawk", "Woodingdean"
  ],
  "Bristol": [
    "Bedminster", "Bishopston", "Clifton", "City Centre", "Easton",
    "Filton", "Fishponds", "Henleaze", "Horfield", "Kingswood",
    "Knowle", "Redland", "Southville", "St Pauls", "Stoke Bishop",
    "Westbury-on-Trym"
  ],
  "Coventry": [
    "Canley", "Chapelfields", "City Centre", "Earlsdon", "Foleshill",
    "Hillfields", "Holbrooks", "Radford", "Stoke", "Tile Hill",
    "Walsgrave", "Whitley", "Wyken"
  ],
  "Leicester": [
    "Aylestone", "Belgrave", "City Centre", "Clarendon Park", "Evington",
    "Highfields", "Knighton", "Oadby", "Spinney Hills", "Stoneygate",
    "West End", "Wigston"
  ],
  "Nottingham": [
    "Beeston", "Bestwood", "Bulwell", "City Centre", "Clifton",
    "Hucknall", "Hyson Green", "Lenton", "Mapperley", "Radford",
    "Sherwood", "Sneinton", "West Bridgford", "Wollaton"
  ],
  "Oxford": [
    "City Centre", "Cowley", "Headington", "Iffley", "Jericho",
    "Littlemore", "Marston", "Summertown", "Wolvercote"
  ],
  "Cambridge": [
    "Arbury", "Castle", "Cherry Hinton", "Chesterton", "City Centre",
    "Coleridge", "Kings Hedges", "Newnham", "Petersfield", "Romsey",
    "Trumpington"
  ]
}

export function OnboardingStep3({ data, onChange }: OnboardingStep3Props) {
  const [newLocation, setNewLocation] = useState({
    city: "",
    areas: [] as string[]
  })
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedArea, setSelectedArea] = useState("")

  const handleAddLocation = () => {
    if (!newLocation.city.trim()) return

    const location: Location = {
      id: Date.now().toString(),
      city: newLocation.city.trim(),
      areas: newLocation.areas
    }

    onChange({
      locations: [...data.locations, location]
    })

    setNewLocation({ city: "", areas: [] })
    setShowLocationForm(false)
  }

  const handleAddArea = (area: string) => {
    if (area && !newLocation.areas.includes(area)) {
      setNewLocation(prev => ({ ...prev, areas: [...prev.areas, area] }))
      setSelectedArea("")
    }
  }

  const handleRemoveArea = (areaToRemove: string) => {
    setNewLocation(prev => ({
      ...prev,
      areas: prev.areas.filter(a => a !== areaToRemove)
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
          Where are you looking? <span className="text-red-500">*</span>
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
                {location.city}
                {location.areas.length > 0 && ` (${location.areas.join(", ")})`}
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
              <Select
                value={newLocation.city}
                onValueChange={(value) => setNewLocation(prev => ({ ...prev, city: value, areas: [] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(cityAreasMap).sort().map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newLocation.city && cityAreasMap[newLocation.city] && (
              <div>
                <Label htmlFor="areas" className="text-sm font-medium text-gray-700 mb-2 block">
                  Specific areas (optional)
                </Label>

                {/* Selected Areas */}
                {newLocation.areas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {newLocation.areas.map((area) => (
                      <Badge
                        key={area}
                        variant="secondary"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs"
                      >
                        {area}
                        <button
                          onClick={() => handleRemoveArea(area)}
                          className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Area Dropdown */}
                <Select
                  value={selectedArea}
                  onValueChange={(value) => {
                    handleAddArea(value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select areas" />
                  </SelectTrigger>
                  <SelectContent>
                    {cityAreasMap[newLocation.city]
                      .filter(area => !newLocation.areas.includes(area))
                      .map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
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