import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables')
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: propertyId } = params
    const { searchParams } = new URL(request.url)
    
    // Get date range for availability check (default: next 60 days)
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || (() => {
      const date = new Date()
      date.setDate(date.getDate() + 60)
      return date.toISOString().split('T')[0]
    })()

    // Verify property exists
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, status')
      .eq('id', propertyId)
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

    // Get all booked time slots for this property in the date range
    const { data: bookedSlots, error: slotsError } = await supabase
      .from('property_viewings')
      .select('viewing_date, viewing_time, status')
      .eq('property_id', propertyId)
      .gte('viewing_date', startDate)
      .lte('viewing_date', endDate)
      .in('status', ['pending', 'approved']) // Only include non-cancelled/rejected viewings
      .order('viewing_date', { ascending: true })
      .order('viewing_time', { ascending: true })

    if (slotsError) {
      console.error('Error fetching booked slots:', slotsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch availability' },
        { status: 500 }
      )
    }

    // Generate all possible time slots (business hours: 9 AM - 6 PM)
    const generateTimeSlots = () => {
      const slots = []
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          slots.push(timeString)
        }
      }
      return slots
    }

    const allTimeSlots = generateTimeSlots()

    // Create a map of booked slots for easy lookup
    const bookedSlotsMap = new Map()
    bookedSlots?.forEach(slot => {
      const key = `${slot.viewing_date}_${slot.viewing_time}`
      bookedSlotsMap.set(key, {
        date: slot.viewing_date,
        time: slot.viewing_time,
        status: slot.status
      })
    })

    // Generate availability for each date in range
    const availability = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay()
      
      // Skip Sundays (0) - assuming property viewings not available on Sundays
      if (dayOfWeek === 0) {
        continue
      }

      // Skip past dates
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (date < today) {
        continue
      }

      const availableSlots = []
      const bookedSlots = []

      allTimeSlots.forEach(timeSlot => {
        const key = `${dateString}_${timeSlot}`
        if (bookedSlotsMap.has(key)) {
          bookedSlots.push({
            time: timeSlot,
            status: bookedSlotsMap.get(key).status
          })
        } else {
          // Check if it's not in the past for today
          if (dateString === today.toISOString().split('T')[0]) {
            const slotDateTime = new Date(`${dateString}T${timeSlot}`)
            const now = new Date()
            if (slotDateTime <= now) {
              return // Skip past time slots for today
            }
          }
          
          availableSlots.push(timeSlot)
        }
      })

      availability.push({
        date: dateString,
        dayOfWeek: date.toLocaleDateString('en-GB', { weekday: 'long' }),
        availableSlots,
        bookedSlots,
        totalAvailable: availableSlots.length,
        totalBooked: bookedSlots.length
      })
    }

    return NextResponse.json({
      success: true,
      propertyId,
      dateRange: {
        startDate,
        endDate
      },
      availability,
      businessHours: {
        start: '09:00',
        end: '18:00',
        interval: 30, // minutes
        excludedDays: ['Sunday']
      }
    })

  } catch (error) {
    console.error('Available slots error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}