"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { KeyRound as Pound, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import type { Property } from "@/lib/sample-data"

interface ApplicationModalProps {
  property: Property
  onBookViewing?: () => void
  onReserve?: () => void
  isReserveOpen?: boolean
  onReserveClose?: () => void
}

export function ApplicationModal({ property, onBookViewing, onReserve, isReserveOpen, onReserveClose }: ApplicationModalProps) {
  const [reserveForm, setReserveForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")

  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.title,
          propertyAddress: property.address,
          ...reserveForm,
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Failed to submit reservation')
        setSubmitStatus('error')
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.')
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReserveClose = () => {
    setReserveForm({ name: "", email: "", phone: "", message: "" })
    setSubmitStatus('idle')
    setErrorMessage("")
    onReserveClose?.()
  }

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

      {/* Reserve Property Card */}
      <Card className="border-red-100 bg-red-50/30">
        <CardContent className="space-y-3">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold text-red-900">
              Secure This Property
            </h3>
            <p className="text-sm text-red-700">
              Reserve now to hold this property before someone else does
            </p>
          </div>

          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-3"
            onClick={onReserve}
          >
            Reserve Property
          </Button>

          <p className="text-xs text-red-600 text-center">
            Fast-track your application
          </p>
        </CardContent>
      </Card>

      {/* Reserve Property Modal */}
      <Dialog open={isReserveOpen} onOpenChange={handleReserveClose}>
        <DialogContent className="sm:max-w-md">
          {submitStatus === 'success' ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Reservation Request Sent!
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Thank you for your interest in this property. Our team will contact you shortly to discuss the next steps.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700">
                    We've received your reservation request for:
                  </p>
                  <p className="font-semibold mt-1">{property.title}</p>
                  <p className="text-sm text-gray-600">{property.address}</p>
                </div>
                <Button onClick={handleReserveClose} className="w-full">
                  Close
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Reserve This Property</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <p className="font-semibold text-red-900">{property.title}</p>
                  <p className="text-sm text-red-700">{property.address}</p>
                  <p className="text-sm font-medium text-red-800 mt-1">
                    £{property.price.toLocaleString()}/month
                  </p>
                </div>

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleReserveSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="reserve-name">Full Name *</Label>
                    <Input
                      id="reserve-name"
                      value={reserveForm.name}
                      onChange={(e) => setReserveForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Smith"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="reserve-email">Email Address *</Label>
                    <Input
                      id="reserve-email"
                      type="email"
                      value={reserveForm.email}
                      onChange={(e) => setReserveForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="reserve-phone">Phone Number *</Label>
                    <Input
                      id="reserve-phone"
                      type="tel"
                      value={reserveForm.phone}
                      onChange={(e) => setReserveForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="07123 456789"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="reserve-message">Message (Optional)</Label>
                    <Textarea
                      id="reserve-message"
                      value={reserveForm.message}
                      onChange={(e) => setReserveForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Any questions or specific requirements?"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReserveClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Submit Reservation
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
