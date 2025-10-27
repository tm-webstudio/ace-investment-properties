import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/middleware'

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables')
}

interface ViewingRequestBody {
  propertyId: string
  viewingDate: string
  viewingTime: string
  userName: string
  userEmail: string
  userPhone: string
  message?: string
}

function validateUKPhone(phone: string): boolean {
  // UK phone number validation (basic)
  const ukPhoneRegex = /^(\+44|0)[1-9]\d{8,9}$/
  return ukPhoneRegex.test(phone.replace(/\s/g, ''))
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validateBusinessHours(time: string): boolean {
  const [hours] = time.split(':').map(Number)
  return hours >= 9 && hours < 18 // 9 AM to 6 PM
}

function validateFutureDate(date: string): boolean {
  const viewingDate = new Date(date)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 60) // Max 60 days in future
  
  return viewingDate >= tomorrow && viewingDate <= maxDate
}

export async function POST(request: NextRequest) {
  try {
    // Use the requireAuth middleware
    const req = await requireAuth(request)
    
    if (req instanceof NextResponse) {
      return req // Return auth error response
    }
    
    const body: ViewingRequestBody = await request.json()
    
    // Validate required fields
    if (!body.propertyId || !body.viewingDate || !body.viewingTime || 
        !body.userName || !body.userEmail || !body.userPhone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(body.userEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate UK phone number
    if (!validateUKPhone(body.userPhone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid UK phone number format' },
        { status: 400 }
      )
    }

    // Validate business hours
    if (!validateBusinessHours(body.viewingTime)) {
      return NextResponse.json(
        { success: false, error: 'Viewing time must be between 9 AM and 6 PM' },
        { status: 400 }
      )
    }

    // Validate future date
    if (!validateFutureDate(body.viewingDate)) {
      return NextResponse.json(
        { success: false, error: 'Viewing date must be between tomorrow and 60 days from now' },
        { status: 400 }
      )
    }

    // Check if property exists and get landlord_id
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, landlord_id, status')
      .eq('id', body.propertyId)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      )
    }

    if (property.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Property is not available for viewing' },
        { status: 400 }
      )
    }

    // Check for duplicate booking (same user, property, date, time)
    const { data: existingViewing } = await supabase
      .from('property_viewings')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('property_id', body.propertyId)
      .eq('viewing_date', body.viewingDate)
      .eq('viewing_time', body.viewingTime)
      .single()

    if (existingViewing) {
      return NextResponse.json(
        { success: false, error: 'You have already requested a viewing for this property at this time' },
        { status: 409 }
      )
    }

    // Check if time slot is already booked
    const { data: conflictingViewing } = await supabase
      .from('property_viewings')
      .select('id')
      .eq('property_id', body.propertyId)
      .eq('viewing_date', body.viewingDate)
      .eq('viewing_time', body.viewingTime)
      .in('status', ['pending', 'approved'])
      .single()

    if (conflictingViewing) {
      return NextResponse.json(
        { success: false, error: 'This time slot is already booked' },
        { status: 409 }
      )
    }

    // Create viewing request
    const { data: viewing, error: insertError } = await supabase
      .from('property_viewings')
      .insert({
        property_id: body.propertyId,
        user_id: req.user.id,
        landlord_id: property.landlord_id,
        viewing_date: body.viewingDate,
        viewing_time: body.viewingTime,
        user_name: body.userName,
        user_email: body.userEmail,
        user_phone: body.userPhone,
        message: body.message || null,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating viewing:', insertError)
      
      // Provide more specific error messages
      if (insertError.code === '42P01') {
        return NextResponse.json(
          { success: false, error: 'Viewing system is not yet set up. Please contact support.' },
          { status: 503 }
        )
      }
      
      if (insertError.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'You have already requested a viewing for this property at this time' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: `Failed to create viewing request: ${insertError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      viewing,
      message: 'Viewing request submitted successfully'
    })

  } catch (error) {
    console.error('Viewing request error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}