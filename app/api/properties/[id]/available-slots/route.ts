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

    // Verify property exists and get landlord info
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, status, landlord_id')
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

    // Get landlord's preferred viewing times
    const { data: landlordProfile } = await supabase
      .from('user_profiles')
      .select('preferred_days, preferred_times')
      .eq('id', property.landlord_id)
      .single()

    // Map short day names to day numbers (0 = Sunday, 1 = Monday, etc.)
    const dayNameToNumber: { [key: string]: number } = {
      'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
    }

    // Get allowed days from landlord preferences (default to all weekdays if not set)
    const preferredDays = landlordProfile?.preferred_days || []
    const allowedDayNumbers = preferredDays.length > 0
      ? preferredDays.map((day: string) => dayNameToNumber[day]).filter((n: number | undefined) => n !== undefined)
      : [1, 2, 3, 4, 5, 6] // Default: Monday to Saturday

    // Get allowed time ranges from landlord preferences
    const preferredTimes = landlordProfile?.preferred_times || []

    // Convert time preferences to hour ranges
    const getTimeRanges = (prefs: string[]) => {
      if (prefs.length === 0) {
        // Default: all business hours
        return [{ start: 9, end: 18 }]
      }

      const ranges: { start: number; end: number }[] = []
      if (prefs.includes('morning')) ranges.push({ start: 9, end: 12 })
      if (prefs.includes('afternoon')) ranges.push({ start: 12, end: 17 })
      if (prefs.includes('evening')) ranges.push({ start: 17, end: 20 })

      return ranges.length > 0 ? ranges : [{ start: 9, end: 18 }]
    }

    const timeRanges = getTimeRanges(preferredTimes)

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

    // Generate time slots based on landlord's preferred time ranges
    const generateTimeSlots = (ranges: { start: number; end: number }[]) => {
      const slots: string[] = []
      ranges.forEach(range => {
        for (let hour = range.start; hour < range.end; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            if (!slots.includes(timeString)) {
              slots.push(timeString)
            }
          }
        }
      })
      // Sort slots chronologically
      return slots.sort()
    }

    const allTimeSlots = generateTimeSlots(timeRanges)

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

      // Skip days not in landlord's preferred days
      if (!allowedDayNumbers.includes(dayOfWeek)) {
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

    // Convert day numbers back to names for response
    const numberToDayName: { [key: number]: string } = {
      0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday'
    }
    const excludedDays = [0, 1, 2, 3, 4, 5, 6]
      .filter(n => !allowedDayNumbers.includes(n))
      .map(n => numberToDayName[n])

    return NextResponse.json({
      success: true,
      propertyId,
      dateRange: {
        startDate,
        endDate
      },
      availability,
      landlordAvailability: {
        preferredDays: preferredDays,
        preferredTimes: preferredTimes,
        allowedDayNumbers: allowedDayNumbers
      },
      businessHours: {
        start: timeRanges[0]?.start.toString().padStart(2, '0') + ':00' || '09:00',
        end: timeRanges[timeRanges.length - 1]?.end.toString().padStart(2, '0') + ':00' || '18:00',
        interval: 30, // minutes
        excludedDays
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