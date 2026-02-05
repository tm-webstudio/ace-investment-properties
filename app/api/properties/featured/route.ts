import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { formatPropertyForCard } from '@/lib/property-utils'

export async function GET() {
  try {
    // Fetch featured properties from database
    // Show both active and pending properties to populate the carousel
    const { data: properties, error } = await supabase
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
      .in('status', ['active', 'pending']) // Show active and pending properties
      .order('created_at', { ascending: false })
      .limit(20) // Get latest 20 properties

    if (error) {
      console.error('Error fetching featured properties:', error)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    console.log(`Featured properties query returned ${properties?.length || 0} properties`)

    // Filter out properties without images and format for frontend
    const withPhotos = properties?.filter(property => property.photos && property.photos.length > 0) || []
    console.log(`Properties with photos: ${withPhotos.length}`)

    const formattedProperties = withPhotos
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