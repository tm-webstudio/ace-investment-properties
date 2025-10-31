import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Helper function to get admin client at runtime
function getSupabaseAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Helper function to get regular client at runtime
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const TOTAL_DOCUMENT_TYPES = 5 // gas_safety, epc, electrical_safety, insurance_policy, hmo_license

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const supabaseAdmin = getSupabaseAdmin()

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

    // Get landlord's properties
    const { data: properties, error: propertiesError } = await supabaseAdmin
      .from('properties')
      .select('id, address, city, photos')
      .eq('landlord_id', user.id)
      .order('created_at', { ascending: false })

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    // Get document counts for each property
    const propertiesWithDocs = await Promise.all(
      properties.map(async (property) => {
        const { data: documents, error: docsError } = await supabaseAdmin
          .from('property_documents')
          .select('id')
          .eq('property_id', property.id)

        const completedDocs = documents?.length || 0

        return {
          propertyId: property.id,
          name: property.address,
          address: `${property.address}, ${property.city}`,
          image: property.photos?.[0] || '/placeholder.svg',
          completedDocs,
          totalDocs: TOTAL_DOCUMENT_TYPES
        }
      })
    )

    return NextResponse.json({
      success: true,
      properties: propertiesWithDocs
    })

  } catch (error) {
    console.error('Error in properties-documents-summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
