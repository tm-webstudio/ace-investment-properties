"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Step1Data {
  operatorType: "sa_operator" | "supported_living" | "social_housing" | "other"
  operatorTypeOther?: string
  propertiesManaging: number
}

interface OnboardingStep1Props {
  data: Step1Data
  onChange: (data: Partial<Step1Data>) => void
}

export function OnboardingStep1({ data, onChange }: OnboardingStep1Props) {
  return (
    <div className="space-y-6">
      {/* Operator Type */}
      <div>
        <Label className="text-base font-medium text-gray-900 mb-4 block">
          What type of Operator are you?
        </Label>
        <RadioGroup
          value={data.operatorType}
          onValueChange={(value) => onChange({ 
            operatorType: value as Step1Data["operatorType"],
            operatorTypeOther: value !== "other" ? undefined : data.operatorTypeOther
          })}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
              <RadioGroupItem value="sa_operator" id="sa_operator" />
              <Label htmlFor="sa_operator" className="flex-1 cursor-pointer font-medium">
                SA Operator
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
              <RadioGroupItem value="supported_living" id="supported_living" />
              <Label htmlFor="supported_living" className="flex-1 cursor-pointer font-medium">
                Supported/Assisted Living
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
              <RadioGroupItem value="social_housing" id="social_housing" />
              <Label htmlFor="social_housing" className="flex-1 cursor-pointer font-medium">
                Social Housing/EA/TA
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="cursor-pointer font-medium">
                Other
              </Label>
            </div>
          </div>
          
          {data.operatorType === "other" && (
            <div className="mt-3">
              <Input
                placeholder="Please specify your operator type"
                value={data.operatorTypeOther || ""}
                onChange={(e) => onChange({ operatorTypeOther: e.target.value })}
              />
            </div>
          )}
        </RadioGroup>
      </div>

      {/* Properties Managing */}
      <div>
        <Label htmlFor="properties_managing" className="text-base font-medium text-gray-900 mb-2 block">
          How many properties are you currently managing?
        </Label>
        <Input
          id="properties_managing"
          type="number"
          min="0"
          max="10000"
          value={data.propertiesManaging}
          onChange={(e) => onChange({ propertiesManaging: parseInt(e.target.value) || 0 })}
          placeholder="Enter number of properties"
          className="max-w-xs"
        />
        <p className="text-sm text-gray-500 mt-1">
          Enter 0 if you're just starting
        </p>
      </div>
    </div>
  )
}