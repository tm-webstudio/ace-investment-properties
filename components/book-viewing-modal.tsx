"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"
import { format, addDays, isBefore, isAfter } from "date-fns"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

interface PropertyData {
  id: string
  title: string
  address: string
  monthly_rent: number
  photos?: string[]
  images?: string[]
}

interface BookViewingModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: string
  propertyData: PropertyData
}

type ModalState = 'AUTH_CHECK' | 'LOGIN' | 'SIGNUP' | 'BOOKING_FORM' | 'SUCCESS' | 'ERROR'

interface BookingFormData {
  viewingDate: Date | null
  viewingTime: string
  userName: string
  userEmail: string
  userPhone: string
  message: string
}

interface AvailabilitySlot {
  time: string
  available: boolean
}

export function BookViewingModal({ isOpen, onClose, propertyId, propertyData }: BookViewingModalProps) {
  const [modalState, setModalState] = useState<ModalState>('AUTH_CHECK')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Auth form data
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'tenant'
  })

  // Booking form data
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    viewingDate: null,
    viewingTime: '',
    userName: '',
    userEmail: '',
    userPhone: '',
    message: ''
  })

  // Availability data
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [bookingsForDate, setBookingsForDate] = useState(0)

  // Success data
  const [successData, setSuccessData] = useState<any>(null)

  const modalRef = useRef<HTMLDivElement>(null)

  // Check authentication when modal opens
  useEffect(() => {
    if (isOpen) {
      checkAuthentication()
    }
  }, [isOpen])

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen, modalState])

  // Initialize with default time slots when modal opens and user is ready for booking
  useEffect(() => {
    if (modalState === 'BOOKING_FORM' && availableSlots.length === 0) {
      // Set default time slots if none are loaded
      setAvailableSlots(generateDefaultTimeSlots())
    }
  }, [modalState, availableSlots.length])

  const checkAuthentication = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        
        // Pre-fill form with user data if available
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setBookingForm(prev => ({
            ...prev,
            userName: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            userEmail: session.user.email || '',
            userPhone: profile.phone || ''
          }))
        } else {
          setBookingForm(prev => ({
            ...prev,
            userEmail: session.user.email || ''
          }))
        }
        
        setModalState('BOOKING_FORM')
      } else {
        setModalState('AUTH_CHECK')
      }
    } catch (error) {
      console.error('Error checking authentication:', error)
      setModalState('AUTH_CHECK')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: authForm.email,
        password: authForm.password
      })

      if (loginError) {
        setError(loginError.message)
      } else if (data.user) {
        setUser(data.user)
        
        // Pre-fill booking form
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profile) {
          setBookingForm(prev => ({
            ...prev,
            userName: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            userEmail: data.user.email || '',
            userPhone: profile.phone || ''
          }))
        } else {
          setBookingForm(prev => ({
            ...prev,
            userEmail: data.user.email || ''
          }))
        }
        
        setModalState('BOOKING_FORM')
      }
    } catch (error) {
      setError('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate form
    if (authForm.password !== authForm.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (authForm.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: authForm.email,
        password: authForm.password,
        options: {
          data: {
            first_name: authForm.firstName,
            last_name: authForm.lastName,
            phone: authForm.phone,
            user_type: authForm.userType,
            full_name: `${authForm.firstName} ${authForm.lastName}`.trim()
          }
        }
      })

      if (signupError) {
        setError(signupError.message)
      } else if (data.user) {
        setUser(data.user)
        
        // Pre-fill booking form
        setBookingForm(prev => ({
          ...prev,
          userName: `${authForm.firstName} ${authForm.lastName}`.trim(),
          userEmail: authForm.email,
          userPhone: authForm.phone
        }))
        
        setModalState('BOOKING_FORM')
      }
    } catch (error) {
      setError('An error occurred during signup')
    } finally {
      setIsLoading(false)
    }
  }

  const generateDefaultTimeSlots = (): AvailabilitySlot[] => {
    const slots: AvailabilitySlot[] = []
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push({ time, available: true })
      }
    }
    return slots
  }

  const fetchAvailableSlots = async (date: Date) => {
    if (!date) return

    setLoadingSlots(true)
    try {
      const dateString = format(date, 'yyyy-MM-dd')
      const response = await fetch(`/api/properties/${propertyId}/available-slots?startDate=${dateString}&endDate=${dateString}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Available slots API response:', data) // Debug log
        
        if (data.success && data.availability && data.availability.length > 0) {
          const dayAvailability = data.availability[0]
          setBookingsForDate(dayAvailability.totalBooked || 0)
          
          // Generate all possible time slots and mark availability
          const allSlots: AvailabilitySlot[] = []
          for (let hour = 9; hour < 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
              const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
              const isAvailable = dayAvailability.availableSlots?.includes(time) ?? true
              allSlots.push({ time, available: isAvailable })
            }
          }
          
          setAvailableSlots(allSlots)
        } else {
          // Fallback: Generate default available time slots
          console.log('No availability data, using default slots')
          setAvailableSlots(generateDefaultTimeSlots())
          setBookingsForDate(0)
        }
      } else {
        // API error: Use default time slots
        console.log('API error, using default slots')
        setAvailableSlots(generateDefaultTimeSlots())
        setBookingsForDate(0)
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
      // Network error: Use default time slots
      setAvailableSlots(generateDefaultTimeSlots())
      setBookingsForDate(0)
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    
    setBookingForm(prev => ({ ...prev, viewingDate: date, viewingTime: '' }))
    fetchAvailableSlots(date)
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingForm.viewingDate || !bookingForm.viewingTime) return

    setIsLoading(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setError('Authentication required')
        setModalState('AUTH_CHECK')
        return
      }

      const response = await fetch('/api/viewings/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          propertyId,
          viewingDate: format(bookingForm.viewingDate, 'yyyy-MM-dd'),
          viewingTime: bookingForm.viewingTime,
          userName: bookingForm.userName,
          userEmail: bookingForm.userEmail,
          userPhone: bookingForm.userPhone,
          message: bookingForm.message
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccessData({
          date: format(bookingForm.viewingDate, 'EEEE, MMMM do, yyyy'),
          time: bookingForm.viewingTime,
          email: bookingForm.userEmail
        })
        setModalState('SUCCESS')
      } else {
        setError(result.error || 'Failed to submit viewing request')
        if (response.status === 409) {
          // Time slot taken, refresh availability
          fetchAvailableSlots(bookingForm.viewingDate)
        }
      }
    } catch (error) {
      setError('An error occurred while submitting your request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setModalState('AUTH_CHECK')
    setError('')
    setAuthForm({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      userType: 'tenant'
    })
    setBookingForm({
      viewingDate: null,
      viewingTime: '',
      userName: '',
      userEmail: '',
      userPhone: '',
      message: ''
    })
    setAvailableSlots([])
    setSuccessData(null)
    onClose()
  }

  // Keyboard handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  const tomorrow = addDays(new Date(), 1)
  const maxDate = addDays(new Date(), 60)

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const propertyImage = propertyData.photos?.[0] || propertyData.images?.[0] || '/placeholder.svg'

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-md max-h-[90vh] overflow-y-auto"
        ref={modalRef}
        onKeyDown={handleKeyDown}
        aria-describedby="book-viewing-description"
        role="dialog"
        aria-modal="true"
      >
        <div id="book-viewing-description" className="sr-only">
          Book a viewing for {propertyData.title} at {propertyData.address}
        </div>
        {/* AUTH_CHECK State */}
        {modalState === 'AUTH_CHECK' && (
          <>
            <DialogHeader>
              <DialogTitle>Book a Viewing</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Please log in or create an account to book a viewing
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setModalState('LOGIN')}>
                    Login
                  </Button>
                  <Button variant="outline" onClick={() => setModalState('SIGNUP')}>
                    Create Account
                  </Button>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex gap-3">
                  <Image 
                    src={propertyImage}
                    alt={propertyData.title}
                    width={80}
                    height={60}
                    className="rounded object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{propertyData.title}</h4>
                    <p className="text-sm text-gray-600">{propertyData.address}</p>
                    <p className="text-sm font-medium text-primary">
                      £{propertyData.monthly_rent.toLocaleString()}/month
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* LOGIN State */}
        {modalState === 'LOGIN' && (
          <>
            <DialogHeader>
              <DialogTitle>Login to Book Viewing</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={authForm.password}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Login
                </Button>
                <Button type="button" variant="outline" onClick={() => setModalState('AUTH_CHECK')}>
                  Back
                </Button>
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setModalState('SIGNUP')}
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </form>
          </>
        )}

        {/* SIGNUP State */}
        {modalState === 'SIGNUP' && (
          <>
            <DialogHeader>
              <DialogTitle>Create Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={authForm.firstName}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={authForm.lastName}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={authForm.phone}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="07123 456789"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={authForm.password}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <Label>I am a:</Label>
                <RadioGroup 
                  value={authForm.userType} 
                  onValueChange={(value) => setAuthForm(prev => ({ ...prev, userType: value }))}
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tenant" id="tenant" />
                    <Label htmlFor="tenant">Tenant</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="investor" id="investor" />
                    <Label htmlFor="investor">Investor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="landlord" id="landlord" />
                    <Label htmlFor="landlord">Landlord</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Account
                </Button>
                <Button type="button" variant="outline" onClick={() => setModalState('AUTH_CHECK')}>
                  Back
                </Button>
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setModalState('LOGIN')}
                >
                  Already have an account? Login
                </button>
              </div>
            </form>
          </>
        )}

        {/* BOOKING_FORM State */}
        {modalState === 'BOOKING_FORM' && (
          <>
            <DialogHeader>
              <DialogTitle>Book a Viewing</DialogTitle>
            </DialogHeader>
            
            {/* Property Preview */}
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex gap-3">
                <Image 
                  src={propertyImage}
                  alt={propertyData.title}
                  width={80}
                  height={60}
                  className="rounded object-cover"
                />
                <div>
                  <h4 className="font-semibold">{propertyData.title}</h4>
                  <p className="text-sm text-gray-600">{propertyData.address}</p>
                  <p className="text-sm font-medium text-primary">
                    £{propertyData.monthly_rent.toLocaleString()}/month
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              {/* Date Selection */}
              <div>
                <Label>Select Viewing Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !bookingForm.viewingDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingForm.viewingDate ? (
                        format(bookingForm.viewingDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bookingForm.viewingDate || undefined}
                      onSelect={handleDateSelect}
                      disabled={(date) => 
                        isBefore(date, tomorrow) || 
                        isAfter(date, maxDate) ||
                        date.getDay() === 0 // Disable Sundays
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {bookingForm.viewingDate && (
                  <p className="text-sm text-gray-600 mt-1">
                    {bookingsForDate > 0 ? `${bookingsForDate} viewings already booked for this day` : 'No viewings booked for this day'}
                  </p>
                )}
              </div>

              {/* Time Selection */}
              {bookingForm.viewingDate && (
                <div>
                  <Label>Select Time *</Label>
                  {loadingSlots ? (
                    <div className="flex items-center gap-2 p-3 border rounded">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading available times...</span>
                    </div>
                  ) : (
                    <Select 
                      value={bookingForm.viewingTime} 
                      onValueChange={(value) => setBookingForm(prev => ({ ...prev, viewingTime: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSlots.length > 0 ? (
                          availableSlots.map((slot) => (
                            <SelectItem 
                              key={slot.time} 
                              value={slot.time}
                              disabled={!slot.available}
                            >
                              {formatTime(slot.time)} {!slot.available && '(Booked)'}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No time slots available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Contact Information */}
              <div>
                <Label htmlFor="userName">Your Name *</Label>
                <Input
                  id="userName"
                  value={bookingForm.userName}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, userName: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="userEmail">Email Address *</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={bookingForm.userEmail}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, userEmail: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="userPhone">Phone Number *</Label>
                <Input
                  id="userPhone"
                  type="tel"
                  value={bookingForm.userPhone}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, userPhone: e.target.value }))}
                  placeholder="07123 456789"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Any specific questions or requirements?"
                  maxLength={500}
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {bookingForm.message.length}/500 characters
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !bookingForm.viewingDate || !bookingForm.viewingTime}
                  className="flex-1"
                >
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Request Viewing
                </Button>
              </div>
            </form>
          </>
        )}

        {/* SUCCESS State */}
        {modalState === 'SUCCESS' && successData && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Viewing Request Sent!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                The landlord will review your request and respond soon.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 mb-2">
                  We've sent a confirmation to: <strong>{successData.email}</strong>
                </p>
                
                <div className="space-y-1 text-sm">
                  <p><strong>Viewing Details:</strong></p>
                  <p>📅 {successData.date} at {formatTime(successData.time)}</p>
                  <p>📍 {propertyData.address}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleClose} className="flex-1">
                  Close
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/viewings'}>
                  View My Viewings
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ERROR State */}
        {modalState === 'ERROR' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Error
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">{error}</p>
              
              <div className="flex gap-3">
                <Button onClick={() => setModalState('BOOKING_FORM')} className="flex-1">
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}