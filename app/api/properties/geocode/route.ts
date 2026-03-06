import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { geocodeAddress } from '@/lib/geocoding'

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  : null

/**
 * API endpoint to geocode properties that don't have coordinates yet
 * This can be called manually or set up as a scheduled job
 */
export async function POST(request: NextRequest) {
  try {
    // Admin-only access
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get properties without coordinates
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, address, city, postcode')
      .or('latitude.is.null,longitude.is.null')
      .limit(50) // Process 50 at a time to respect rate limits

    if (error) {
      console.error('Error fetching properties:', error)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    if (!properties || properties.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All properties already have coordinates',
        updated: 0
      })
    }

    console.log(`Geocoding ${properties.length} properties...`)

    let successCount = 0
    let failCount = 0

    // Geocode each property with rate limiting
    for (const property of properties) {
      try {
        const coords = await geocodeAddress(
          property.address,
          property.city,
          property.postcode
        )

        if (coords) {
          const { error: updateError } = await supabase
            .from('properties')
            .update({
              latitude: coords.latitude,
              longitude: coords.longitude
            })
            .eq('id', property.id)

          if (updateError) {
            console.error(`Error updating property ${property.id}:`, updateError)
            failCount++
          } else {
            console.log(`Successfully geocoded property ${property.id}`)
            successCount++
          }
        } else {
          console.warn(`Could not geocode property ${property.id}: ${property.address}`)
          failCount++
        }

        // Wait 1 second between requests to respect Nominatim rate limit
        if (properties.indexOf(property) < properties.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1100))
        }
      } catch (err) {
        console.error(`Error processing property ${property.id}:`, err)
        failCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Geocoded ${successCount} properties successfully, ${failCount} failed`,
      updated: successCount,
      failed: failCount,
      total: properties.length
    })
  } catch (error) {
    console.error('Error in geocoding endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
