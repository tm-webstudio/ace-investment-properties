"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Home, MapPin, Bed, Bath, Calendar, PoundSterling } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface PropertyPreview {
  title: string
  address: string
  propertyType: string
  monthlyRent: string
  bedrooms: string
  bathrooms: string
  primaryImage: string | null
  expiresAt: string
}

interface ClaimResponse {
  success: boolean
  propertyId?: string
  userId?: string
  redirectUrl?: string
  message?: string
  error?: string
}

function ClaimPropertyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [property, setProperty] = useState<PropertyPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [activeTab, setActiveTab] = useState('signup')
  const [success, setSuccess] = useState(false)

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    acceptedTerms: false
  })

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  // Form errors
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({})
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!token) {
      setError('No property token provided')
      setLoading(false)
      return
    }

    fetchPropertyPreview()
  }, [token])

  const fetchPropertyPreview = async () => {
    try {
      const response = await fetch(`/api/properties/pending/${token}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch property details')
      }

      if (!data.valid) {
        throw new Error('Invalid or expired property link')
      }

      setProperty(data.property)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property')
    } finally {
      setLoading(false)
    }
  }

  const validateSignupForm = () => {
    const errors: Record<string, string> = {}

    if (!signupForm.email) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(signupForm.email)) errors.email = 'Invalid email format'

    if (!signupForm.password) errors.password = 'Password is required'
    else if (signupForm.password.length < 6) errors.password = 'Password must be at least 6 characters'

    if (!signupForm.confirmPassword) errors.confirmPassword = 'Please confirm your password'
    else if (signupForm.password !== signupForm.confirmPassword) errors.confirmPassword = 'Passwords do not match'

    if (!signupForm.firstName) errors.firstName = 'First name is required'
    if (!signupForm.lastName) errors.lastName = 'Last name is required'
    if (!signupForm.acceptedTerms) errors.acceptedTerms = 'You must accept the terms and conditions'

    setSignupErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateLoginForm = () => {
    const errors: Record<string, string> = {}

    if (!loginForm.email) errors.email = 'Email is required'
    if (!loginForm.password) errors.password = 'Password is required'

    setLoginErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateSignupForm()) return

    setClaiming(true)
    setSignupErrors({})

    try {
      const response = await fetch('/api/auth/signup-and-claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...signupForm,
          pendingPropertyToken: token
        })
      })

      const data: ClaimResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(data.redirectUrl || '/landlord/dashboard')
      }, 2000)

    } catch (err) {
      setSignupErrors({ general: err instanceof Error ? err.message : 'Signup failed' })
    } finally {
      setClaiming(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateLoginForm()) return

    setClaiming(true)
    setLoginErrors({})

    try {
      const response = await fetch('/api/auth/login-and-claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...loginForm,
          pendingPropertyToken: token
        })
      })

      const data: ClaimResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(data.redirectUrl || '/landlord/dashboard')
      }, 2000)

    } catch (err) {
      setLoginErrors({ general: err instanceof Error ? err.message : 'Login failed' })
    } finally {
      setClaiming(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold mb-2">Invalid Link</h1>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button asChild>
                <Link href="/list-property">List a New Property</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold mb-2">Property Published Successfully!</h1>
              <p className="text-muted-foreground mb-4">
                Your property has been published and is now live on our platform.
              </p>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => router.push('/landlord/dashboard')}>
                  Go to Dashboard
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

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Property Preview */}
        {property && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2 text-accent" />
                Complete Your Account to Publish This Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {property.primaryImage && (
                    <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                      <Image
                        src={property.primaryImage}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{property.title}</h3>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.address}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary">{property.propertyType}</Badge>
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.bedrooms} bed</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.bathrooms} bath</span>
                    </div>
                  </div>

                  <div className="flex items-center text-lg font-semibold text-accent">
                    <PoundSterling className="h-5 w-5 mr-1" />
                    £{parseInt(property.monthlyRent).toLocaleString()} pcm
                  </div>

                  <Alert>
                    <Calendar className="h-4 w-4" />
                    <AlertDescription>
                      This link expires on {new Date(property.expiresAt).toLocaleDateString()}
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auth Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Create Your Landlord Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup">Create Account</TabsTrigger>
                <TabsTrigger value="login">Already Have Account?</TabsTrigger>
              </TabsList>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  {signupErrors.general && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{signupErrors.general}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={signupForm.firstName}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className={signupErrors.firstName ? 'border-red-500' : ''}
                      />
                      {signupErrors.firstName && (
                        <p className="text-sm text-red-500 mt-1">{signupErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={signupForm.lastName}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className={signupErrors.lastName ? 'border-red-500' : ''}
                      />
                      {signupErrors.lastName && (
                        <p className="text-sm text-red-500 mt-1">{signupErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                      className={signupErrors.email ? 'border-red-500' : ''}
                    />
                    {signupErrors.email && (
                      <p className="text-sm text-red-500 mt-1">{signupErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                        className={signupErrors.password ? 'border-red-500' : ''}
                      />
                      {signupErrors.password && (
                        <p className="text-sm text-red-500 mt-1">{signupErrors.password}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className={signupErrors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {signupErrors.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">{signupErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={signupForm.acceptedTerms}
                      onCheckedChange={(checked) => setSignupForm(prev => ({ ...prev, acceptedTerms: checked as boolean }))}
                      className={signupErrors.acceptedTerms ? 'border-red-500' : ''}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the <Link href="/terms" className="text-accent hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link> as a landlord
                    </Label>
                  </div>
                  {signupErrors.acceptedTerms && (
                    <p className="text-sm text-red-500">{signupErrors.acceptedTerms}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={claiming}>
                    {claiming ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account & Publish Property'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  {loginErrors.general && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{loginErrors.general}</AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Label htmlFor="loginEmail">Email *</Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      className={loginErrors.email ? 'border-red-500' : ''}
                    />
                    {loginErrors.email && (
                      <p className="text-sm text-red-500 mt-1">{loginErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="loginPassword">Password *</Label>
                    <Input
                      id="loginPassword"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      className={loginErrors.password ? 'border-red-500' : ''}
                    />
                    {loginErrors.password && (
                      <p className="text-sm text-red-500 mt-1">{loginErrors.password}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <Link href="/forgot-password" className="text-sm text-accent hover:underline">
                      Forgot your password?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full" disabled={claiming}>
                    {claiming ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Logging In...
                      </>
                    ) : (
                      'Login & Publish Property'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ClaimPropertyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ClaimPropertyContent />
    </Suspense>
  )
}