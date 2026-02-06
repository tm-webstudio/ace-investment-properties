import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { formatPropertyForCard } from '@/lib/property-utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city') || 'London'

    // Define Midlands cities
    const midlandsCities = [
      'Birmingham',
      'Coventry',
      'Nottingham',
      'Leicester',
      'Derby',
      'Wolverhampton',
      'Stoke-on-Trent',
      'Northampton'
    ]

    // Build query
    let query = supabase
      .from('properties')
      .select(`
        id,
        property_type,
        bedrooms,
        bathrooms,
        monthly_rent,
        available_date,
        description,
        amenities,
        address,
        city,
        local_authority,
        postcode,
        photos,
        status,
        availability,
        property_licence,
        property_condition,
        published_at,
        created_at,
        updated_at
      `)
      .eq('status', 'active')

    // Filter by city or region
    if (city === 'Midlands') {
      // For Midlands, fetch from multiple cities
      query = query.in('city', midlandsCities)
    } else {
      // For specific city
      query = query.eq('city', city)
    }

    const { data: properties, error } = await query
      .order('created_at', { ascending: false })
      .limit(20) // Get latest 20 properties

    if (error) {
      console.error('Error fetching featured properties:', error)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    // Filter out properties without images and format for frontend
    const formattedProperties = properties
      .filter(property => property.photos && property.photos.length > 0)
      .map(property => ({
        ...formatPropertyForCard(property),
        featured: true // Mark all as featured for now
      }))

    return NextResponse.json({
      success: true,
      properties: formattedProperties
    })

  } catch (error: any) {
    console.error('Error in featured properties API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}