import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client for database operations
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

// Create regular client for auth verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Service temporarily unavailable'
      }, { status: 503 })
    }

    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profileError || userProfile?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Fetch all active properties
    const { data: properties, error: propertiesError } = await supabaseAdmin
      .from('properties')
      .select('id, address, city, postcode, photos')
      .eq('status', 'active')

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    // Fetch documents for each property and calculate completion
    const propertiesWithDocs = await Promise.all(
      (properties || []).map(async (property) => {
        const { data: documents } = await supabaseAdmin
          .from('property_documents')
          .select('*')
          .eq('property_id', property.id)

        const totalDocs = 5
        const completedDocs = documents?.filter(doc => doc.file_url).length || 0

        return {
          propertyId: property.id,
          address: property.address,
          city: property.city,
          postcode: property.postcode,
          photos: property.photos,
          completedDocs,
          totalDocs
        }
      })
    )

    // Sort by completion (lowest first) to show properties needing attention first
    const sortedProperties = propertiesWithDocs.sort((a, b) => {
      const aPercentage = (a.completedDocs / a.totalDocs) * 100
      const bPercentage = (b.completedDocs / b.totalDocs) * 100
      return aPercentage - bPercentage
    })

    return NextResponse.json({
      success: true,
      documents: sortedProperties
    })

  } catch (error) {
    console.error('Error in admin documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
