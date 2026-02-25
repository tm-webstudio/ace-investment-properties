"use client"

import type React from "react"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { KeyRound as Pound } from "lucide-react"
import type { Property } from "@/lib/sample-data"

interface ApplicationModalProps {
  property: Property
  onBookViewing?: () => void
}

export function ApplicationModal({ property, onBookViewing }: ApplicationModalProps) {
  return (
    <>
      {/* Book Viewing Card */}
      <Card className="border-accent/20 bg-green-50">
        <CardContent className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-accent">
            <Pound className="h-5 w-5" />
            <span className="text-2xl font-bold">£{property.price.toLocaleString()}</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          <Button
            onClick={onBookViewing}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-base py-6"
          >
            Book Viewing
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Available from {format(new Date(property.availableDate), 'dd/MM/yyyy')}
          </p>
        </CardContent>
      </Card>
    </>
  )
}
