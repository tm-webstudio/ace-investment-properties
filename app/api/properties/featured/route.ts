import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Fetch featured properties from database
    const { data: properties, error } = await supabase
      .from('properties')
      .select(`
        id,
        property_type,
        bedrooms,
        bathrooms,
        monthly_rent,
        security_deposit,
        available_date,
        description,
        amenities,
        address,
        city,
        county,
        postcode,
        photos,
        status,
        published_at,
        created_at,
        updated_at
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20) // Get latest 20 properties

    if (error) {
      console.error('Error fetching featured properties:', error)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    // Format properties for frontend
    const formattedProperties = properties.map(property => ({
      ...property,
      price: property.monthly_rent / 100, // Convert from pence to pounds
      deposit: property.security_deposit / 100,
      title: `${property.property_type} in ${property.city}`,
      propertyType: property.bedrooms === 0 ? 'Studio' : 
                   property.bedrooms === 1 ? '1BR' :
                   property.bedrooms === 2 ? '2BR' : '3BR+',
      images: property.photos || [],
      amenities: property.amenities || [],
      availableDate: property.available_date,
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