"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileUp, KeyRound as Pound, User } from "lucide-react"
import type { Property } from "@/lib/sample-data"

interface ApplicationModalProps {
  property: Property
  onBookViewing?: () => void
}

export function ApplicationModal({ property, onBookViewing }: ApplicationModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentAddress: "",
    employmentStatus: "",
    employer: "",
    monthlyIncome: "",
    moveInDate: "",
    additionalInfo: "",
    agreeToTerms: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Application submitted:", formData)
    setIsOpen(false)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <>
      {/* Apply Now Card */}
      <Card className="border-accent/20 bg-green-50">
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-accent">
              <Pound className="h-5 w-5" />
              <span className="text-2xl font-bold">£{property.price.toLocaleString()}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={onBookViewing}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-base py-6"
            >
              Book Viewing
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Available from {format(new Date(property.availableDate), 'dd/MM/yyyy')}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
