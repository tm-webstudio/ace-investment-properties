"use client"

import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Mail, X, CheckCircle, Loader2 } from 'lucide-react'

interface EmailVerificationBannerProps {
  userEmail: string
  isEmailVerified: boolean
  userId: string
  onDismiss?: () => void
}

export function EmailVerificationBanner({ 
  userEmail, 
  isEmailVerified, 
  userId,
  onDismiss 
}: EmailVerificationBannerProps) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (isEmailVerified || dismissed) {
    return null
  }

  const handleSendVerification = async () => {
    setSending(true)
    
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        setSent(true)
      } else {
        console.error('Failed to send verification email')
      }
    } catch (error) {
      console.error('Error sending verification email:', error)
    } finally {
      setSending(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <Mail className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <strong className="text-orange-800">Verify your email address</strong>
          <p className="text-orange-700 text-sm mt-1">
            Please verify {userEmail} to access all features and receive important updates about your properties.
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {sent ? (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              Email sent! Check your inbox.
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSendVerification}
              disabled={sending}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              {sending ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Verification Email'
              )}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-orange-600 hover:bg-orange-100 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}