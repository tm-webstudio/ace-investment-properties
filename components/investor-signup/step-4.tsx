"use client"

import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

interface Step4Data {
  companyName: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

interface InvestorSignupStep4Props {
  data: Step4Data
  onChange: (data: Partial<Step4Data>) => void
}

export function InvestorSignupStep4({ data, onChange }: InvestorSignupStep4Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="space-y-6">
      {/* Company Name */}
      <div>
        <Label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
          Company name
        </Label>
        <Input
          id="companyName"
          type="text"
          autoComplete="organization"
          required
          value={data.companyName}
          onChange={(e) => onChange({ companyName: e.target.value })}
          placeholder="Enter your company name"
        />
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            First name
          </Label>
          <Input
            id="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={data.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            Last name
          </Label>
          <Input
            id="lastName"
            type="text"
            autoComplete="family-name"
            required
            value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            placeholder="Enter your last name"
          />
        </div>
      </div>

      {/* Email and Phone Number */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="Enter your email address"
          />
        </div>

        <div>
          <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Phone number
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            autoComplete="tel"
            required
            value={data.phoneNumber}
            onChange={(e) => onChange({ phoneNumber: e.target.value })}
            placeholder="Enter your phone number"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            value={data.password}
            onChange={(e) => onChange({ password: e.target.value })}
            placeholder="Create a password"
            className="pr-10"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Password must be at least 8 characters long
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={data.confirmPassword}
            onChange={(e) => onChange({ confirmPassword: e.target.value })}
            placeholder="Confirm your password"
            className="pr-10"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
        <Checkbox
          id="terms"
          checked={data.acceptTerms}
          onCheckedChange={(checked) => onChange({ acceptTerms: checked as boolean })}
          className="mt-0.5"
        />
        <Label htmlFor="terms" className="text-sm text-gray-900 leading-relaxed cursor-pointer">
          I agree to the{" "}
          <Link href="/terms" className="text-primary hover:text-primary/80 underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:text-primary/80 underline">
            Privacy Policy
          </Link>
        </Label>
      </div>
    </div>
  )
}