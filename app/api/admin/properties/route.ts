import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify the user is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // 'active', 'pending', 'draft', 'archived'

    // Build query - fetch properties first
    let query = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: properties, error } = await query

    if (error) {
      console.error('Error fetching properties:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    // Fetch landlord info separately for each property
    const formattedProperties = await Promise.all(
      (properties || []).map(async (property) => {
        let landlordName = 'Unknown'
        let landlordEmail = ''
        let landlordPhone = ''

        if (property.landlord_id) {
          // Get landlord user info
          const { data: landlordUser } = await supabase.auth.admin.getUserById(property.landlord_id)

          if (landlordUser?.user) {
            landlordEmail = landlordUser.user.email || ''
          }

          // Get landlord profile
          const { data: landlordProfile } = await supabase
            .from('user_profiles')
            .select('full_name, phone')
            .eq('id', property.landlord_id)
            .single()

          if (landlordProfile) {
            landlordName = landlordProfile.full_name || 'Unknown'
            landlordPhone = landlordProfile.phone || ''
          }
        }

        return {
          id: property.id,
          property_type: property.property_type,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          monthly_rent: property.monthly_rent,
          available_date: property.available_date,
          description: property.description,
          amenities: property.amenities || [],
          address: property.address,
          city: property.city,
          county: property.county,
          postcode: property.postcode,
          photos: property.photos || [],
          status: property.status,
          published_at: property.published_at,
          created_at: property.created_at,
          updated_at: property.updated_at,
          availability: property.availability,
          landlord_id: property.landlord_id,
          landlordName,
          landlordEmail,
          landlordPhone,
          licence: property.licence,
          condition: property.condition,
          latitude: property.latitude,
          longitude: property.longitude
        }
      })
    )

    return NextResponse.json({
      success: true,
      properties: formattedProperties,
      count: formattedProperties.length
    })

  } catch (error) {
    console.error('Error in admin properties API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
