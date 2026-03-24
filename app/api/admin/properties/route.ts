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
    const status = searchParams.get('status') // 'active', 'pending', 'draft', 'archived', 'rejected'

    console.log('Admin properties API - requested status:', status)

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

    console.log('Admin properties API - query result:', {
      count: properties?.length || 0,
      error: error?.message,
      statuses: properties?.map(p => p.status),
      firstProperty: properties?.[0] ? {
        id: properties[0].id,
        property_licence: properties[0].property_licence,
        property_condition: properties[0].property_condition
      } : null
    })

    if (error) {
      console.error('Error fetching properties:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch properties', details: error.message },
        { status: 500 }
      )
    }

    // Batch-fetch landlord info (single query instead of N+1)
    const landlordIds = [...new Set(
      (properties || []).map(p => p.landlord_id).filter(Boolean)
    )]

    const profileMap = new Map<string, { full_name: string; phone: string; email: string }>()

    if (landlordIds.length > 0) {
      // Fetch all profiles in one query
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name, phone, email')
        .in('id', landlordIds)

      if (profiles) {
        for (const p of profiles) {
          profileMap.set(p.id, { full_name: p.full_name || '', phone: p.phone || '', email: p.email || '' })
        }
      }

      // Fetch auth emails for landlords missing email in user_profiles
      const missingEmailIds = landlordIds.filter(id => !profileMap.get(id)?.email)
      if (missingEmailIds.length > 0) {
        const emailResults = await Promise.all(
          missingEmailIds.map(id => supabase.auth.admin.getUserById(id))
        )
        for (const result of emailResults) {
          const user = result.data?.user
          if (user) {
            const existing = profileMap.get(user.id)
            if (existing) {
              existing.email = user.email || ''
            } else {
              profileMap.set(user.id, { full_name: '', phone: '', email: user.email || '' })
            }
          }
        }
      }
    }

    const formattedProperties = (properties || []).map((property) => {
      let landlordName = 'Unknown'
      let landlordEmail = ''
      let landlordPhone = ''

      if (property.landlord_id && profileMap.has(property.landlord_id)) {
        const profile = profileMap.get(property.landlord_id)!
        landlordName = profile.full_name || property.contact_name || 'Unknown'
        landlordEmail = profile.email || ''
        landlordPhone = profile.phone || ''
      } else {
        landlordName = property.contact_name || 'Unknown'
        landlordEmail = property.contact_email || ''
        landlordPhone = property.contact_phone || ''
      }

      const monthlyRent = property.monthly_rent ? property.monthly_rent / 100 : 0

      return {
        id: property.id,
        property_type: property.property_type,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        monthly_rent: monthlyRent,
        price: monthlyRent,
        available_date: property.available_date,
        description: property.description,
        amenities: property.amenities || [],
        address: property.address,
        city: property.city,
        localAuthority: property.local_authority,
        postcode: property.postcode,
        photos: property.photos || [],
        images: property.photos || [],
        status: property.status,
        published_at: property.published_at,
        created_at: property.created_at,
        updated_at: property.updated_at,
        availability: property.availability,
        landlord_id: property.landlord_id,
        landlordName,
        landlordEmail,
        landlordPhone,
        property_licence: property.property_licence,
        property_condition: property.property_condition,
        latitude: property.latitude,
        longitude: property.longitude,
        source: property.source
      }
    })

    return NextResponse.json({
      success: true,
      properties: formattedProperties,
      count: formattedProperties.length
    })

  } catch (error) {
    console.error('Error in admin properties API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
