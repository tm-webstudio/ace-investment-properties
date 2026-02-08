import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { formatPropertyForCard } from '@/lib/property-utils'

// Disable caching to always return fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

    // Define Greater London boroughs (for local_authority matching)
    const greaterLondonBoroughs = [
      'Barking and Dagenham', 'Barnet', 'Bexley', 'Brent', 'Bromley',
      'Camden', 'Croydon', 'Ealing', 'Enfield', 'Greenwich',
      'Hackney', 'Hammersmith and Fulham', 'Haringey', 'Harrow', 'Havering',
      'Hillingdon', 'Hounslow', 'Islington', 'Kensington and Chelsea', 'Kingston upon Thames',
      'Lambeth', 'Lewisham', 'Merton', 'Newham', 'Redbridge',
      'Richmond upon Thames', 'Southwark', 'Sutton', 'Tower Hamlets', 'Waltham Forest',
      'Wandsworth', 'Westminster', 'City of London'
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
    } else if (city === 'London') {
      // For London, include both city='London' AND Greater London boroughs
      query = query.or(`city.eq.London,local_authority.in.(${greaterLondonBoroughs.map(b => `"${b}"`).join(',')})`)
    } else {
      // For specific city
      query = query.eq('city', city)
    }

    // Order by published_at first (newest approvals), then created_at as fallback
    const { data: properties, error } = await query
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(20) // Get latest 20 approved properties

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