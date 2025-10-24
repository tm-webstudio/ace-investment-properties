"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Email Verified Successfully!</h1>
            <p className="text-muted-foreground mb-4">
              Your email address has been verified. You now have full access to all platform features.
            </p>
            <div className="space-y-2">
              <Button className="w-full" asChild>
                <Link href="/landlord/dashboard">Go to Dashboard</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/list-property">Add Another Property</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}