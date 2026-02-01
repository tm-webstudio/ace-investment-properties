"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Step2Data {
  propertyTypes: string[]
  propertyLicenses: string[]
  bedroomsMin: number
  bedroomsMax: number
  budgetMin: number
  budgetMax: number
  budgetType: "per_property" | "total_portfolio"
}

interface OnboardingStep2Props {
  data: Step2Data
  onChange: (data: Partial<Step2Data>) => void
}

const propertyTypeOptions = [
  { id: "houses", label: "Houses" },
  { id: "flats", label: "Flats/Apartments" },
  { id: "blocks", label: "Blocks" },
  { id: "studios", label: "Studios" },
  { id: "commercial", label: "Commercial to Residential" }
]

const propertyLicenseOptions = [
  { id: "hmo_license", label: "HMO Licence" },
  { id: "c2_license", label: "C2 Licence" },
  { id: "selective_license", label: "Selective Licence" },
  { id: "additional_license", label: "Additional Licence" },
  { id: "no_license", label: "No Licence Required" }
]

const bedroomOptions = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: i + 1 === 10 ? "10+" : (i + 1).toString()
}))

export function OnboardingStep2({ data, onChange }: OnboardingStep2Props) {
  const handlePropertyTypeChange = (propertyTypeId: string, checked: boolean) => {
    let newPropertyTypes = [...data.propertyTypes]

    if (checked) {
      newPropertyTypes.push(propertyTypeId)
    } else {
      newPropertyTypes = newPropertyTypes.filter(id => id !== propertyTypeId)
    }

    onChange({ propertyTypes: newPropertyTypes })
  }

  const handlePropertyLicenseChange = (licenseId: string, checked: boolean) => {
    let newPropertyLicenses = [...(data.propertyLicenses || [])]

    if (checked) {
      newPropertyLicenses.push(licenseId)
    } else {
      newPropertyLicenses = newPropertyLicenses.filter(id => id !== licenseId)
    }

    onChange({ propertyLicenses: newPropertyLicenses })
  }

  return (
    <div className="space-y-6">
      {/* Property Types */}
      <div>
        <Label className="text-base font-medium text-gray-900 mb-4 block">
          What type of properties are you looking for?
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {propertyTypeOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
              <Checkbox
                id={option.id}
                checked={data.propertyTypes.includes(option.id)}
                onCheckedChange={(checked) => handlePropertyTypeChange(option.id, checked as boolean)}
              />
              <Label
                htmlFor={option.id}
                className="flex-1 cursor-pointer font-medium text-sm"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Property Licences */}
      <div>
        <Label className="text-base font-medium text-gray-900 mb-4 block">
          Property Licences
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {propertyLicenseOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
              <Checkbox
                id={option.id}
                checked={(data.propertyLicenses || []).includes(option.id)}
                onCheckedChange={(checked) => handlePropertyLicenseChange(option.id, checked as boolean)}
              />
              <Label
                htmlFor={option.id}
                className="flex-1 cursor-pointer font-medium text-sm"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <Label className="text-base font-medium text-gray-900 mb-4 block">
          How many bedrooms?
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bedrooms_min" className="text-sm font-medium text-gray-700 mb-2 block">
              Minimum
            </Label>
            <Select
              value={data.bedroomsMin.toString()}
              onValueChange={(value) => onChange({ bedroomsMin: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Min bedrooms" />
              </SelectTrigger>
              <SelectContent>
                {bedroomOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="bedrooms_max" className="text-sm font-medium text-gray-700 mb-2 block">
              Maximum
            </Label>
            <Select
              value={data.bedroomsMax.toString()}
              onValueChange={(value) => onChange({ bedroomsMax: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Max bedrooms" />
              </SelectTrigger>
              <SelectContent>
                {bedroomOptions.filter(option => option.value >= data.bedroomsMin).map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Budget */}
      <div>
        <Label className="text-base font-medium text-gray-900 mb-4 block">
          What's your budget?
        </Label>
        
        {/* Budget Type */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Monthly rent budget:
          </Label>
          <RadioGroup
            value={data.budgetType}
            onValueChange={(value) => onChange({ budgetType: value as "per_property" | "total_portfolio" })}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="per_property" id="per_property" />
              <Label htmlFor="per_property" className="cursor-pointer">
                Per property
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="total_portfolio" id="total_portfolio" />
              <Label htmlFor="total_portfolio" className="cursor-pointer">
                Total portfolio
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Budget Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="budget_min" className="text-sm font-medium text-gray-700 mb-2 block">
              Minimum £
            </Label>
            <Input
              id="budget_min"
              type="number"
              min="0"
              step="50"
              value={data.budgetMin}
              onChange={(e) => onChange({ budgetMin: parseInt(e.target.value) || 0 })}
              placeholder="500"
            />
          </div>
          
          <div>
            <Label htmlFor="budget_max" className="text-sm font-medium text-gray-700 mb-2 block">
              Maximum £
            </Label>
            <Input
              id="budget_max"
              type="number"
              min={data.budgetMin}
              step="50"
              value={data.budgetMax}
              onChange={(e) => onChange({ budgetMax: parseInt(e.target.value) || 0 })}
              placeholder="2000"
            />
          </div>
        </div>
      </div>
    </div>
  )
}