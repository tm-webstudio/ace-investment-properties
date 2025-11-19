"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, AlertCircle, X } from "lucide-react"

interface PropertySubmissionConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PropertySubmissionConfirmationModal({ isOpen, onClose }: PropertySubmissionConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full">
        <Card className="border-accent/30 shadow-2xl relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 rounded-full hover:bg-gray-200"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </Button>

          <CardContent className="p-4 md:p-8">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-accent stroke-[3]" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">
                    Thanks for Submitting Your Property!
                  </h2>
                </div>
                <p className="text-sm md:text-base text-gray-600 text-center">
                  Your property listing has been received successfully
                </p>
              </div>

              <div className="bg-accent/5 rounded-lg p-6 space-y-3 text-left border border-accent/10">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-accent" />
                  What happens next?
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Our team will review your property listing within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>You'll receive an email confirmation once your property is approved</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Your property will then be visible to potential investors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>You can manage your listings from your dashboard</span>
                  </li>
                </ul>
              </div>

              <div>
                <Button
                  onClick={onClose}
                  className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Got it, thanks!
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
