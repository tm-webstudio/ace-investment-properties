import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const req = await requireAuth(request)
    
    if (req instanceof NextResponse) {
      return req // Return auth error response
    }
    
    // Check if user is landlord or admin
    if (req.user?.user_type !== 'landlord' && req.user?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Landlord access required' },
        { status: 403 }
      )
    }

    // Fetch properties owned by this landlord
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
        availability,
        property_licence,
        property_condition,
        published_at,
        created_at,
        updated_at
      `)
      .eq('landlord_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching landlord properties:', error)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    // Helper function to create property title
    const formatPropertyTitle = (property: any) => {
      const address = property.address || ''
      const city = property.city || ''
      const postcode = property.postcode || ''
      
      // Extract road name (everything before the first comma or the whole address if no comma)
      // Remove door number from the beginning of the address
      const addressPart = address.split(',')[0].trim()
      const roadName = addressPart.replace(/^\d+\s*/, '').trim()
      
      // Extract outward postcode (first part before space) and capitalize
      const outwardPostcode = postcode.split(' ')[0].toUpperCase()
      
      // Format: "Road Name, Area, Outward Postcode"
      const title = `${roadName}, ${city}, ${outwardPostcode}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '')
      
      // Capitalize first letter of each word, but keep postcode all caps
      return title.split(' ').map(word => {
        // Keep outward postcode in all caps
        if (word === outwardPostcode) {
          return word.toUpperCase()
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }).join(' ')
    }

    // Format properties for frontend
    const formattedProperties = properties.map(property => {
      console.log('API formatting property:', {
        id: property.id,
        original_availability: property.availability,
        final_availability: property.availability || 'vacant'
      })
      return {
        ...property,
        monthly_rent: property.monthly_rent / 100, // Convert from pence to pounds
        availability: property.availability || 'vacant', // Default to vacant if not set
        photos: property.photos || [],
        amenities: property.amenities || [],
        title: formatPropertyTitle(property) // Use new title format
      }
    })

    return NextResponse.json({
      success: true,
      properties: formattedProperties
    })

  } catch (error: any) {
    console.error('Error in landlord properties API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}