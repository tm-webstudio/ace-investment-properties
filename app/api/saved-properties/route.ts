import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { formatPropertyForCard } from '@/lib/property-utils'

// Create admin client for database operations (only if env vars are available)
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
    // Check if admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Service temporarily unavailable' 
      }, { status: 503 })
    }

    // Get the authorization header
    const authorization = request.headers.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    
    // Verify the session with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Invalid or expired token' 
      }, { status: 401 })
    }

    // Get user profile and verify they are an investor
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ 
        error: 'User profile not found' 
      }, { status: 404 })
    }

    if (userProfile.user_type !== 'investor') {
      return NextResponse.json({ 
        error: 'This feature is for investors only' 
      }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100 items
    const sortBy = searchParams.get('sortBy') || 'saved_at'
    const order = searchParams.get('order') || 'desc'
    const search = searchParams.get('search') || ''

    // Calculate offset
    const offset = (page - 1) * limit

    // Build the query
    let query = supabaseAdmin
      .from('saved_properties')
      .select(`
        id,
        saved_at,
        notes,
        properties (
          id,
          property_type,
          bedrooms,
          bathrooms,
          monthly_rent,
          available_date,
          description,
          address,
          city,
          local_authority,
          postcode,
          photos,
          status,
          availability,
          property_licence,
          property_condition,
          created_at,
          updated_at
        )
      `)
      .eq('investor_id', user.id)

    // Add search filter if provided
    if (search) {
      query = query.or(`
        properties.address.ilike.%${search}%,
        properties.city.ilike.%${search}%,
        properties.description.ilike.%${search}%
      `)
    }

    // Add sorting
    if (sortBy === 'saved_at') {
      query = query.order('saved_at', { ascending: order === 'asc' })
    } else if (sortBy === 'price') {
      query = query.order('properties(monthly_rent)', { ascending: order === 'asc' })
    } else if (sortBy === 'property_name') {
      query = query.order('properties(address)', { ascending: order === 'asc' })
    }

    // Get total count
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('saved_properties')
      .select('*', { count: 'exact', head: true })
      .eq('investor_id', user.id)

    if (countError) {
      console.error('Error counting saved properties:', countError)
      return NextResponse.json({ 
        error: 'Failed to count saved properties' 
      }, { status: 500 })
    }

    // Get paginated results
    const { data: savedProperties, error: fetchError } = await query
      .range(offset, offset + limit - 1)

    if (fetchError) {
      console.error('Error fetching saved properties:', fetchError)
      return NextResponse.json({ 
        error: 'Failed to fetch saved properties' 
      }, { status: 500 })
    }

    // Transform the data to include property details at the top level
    const transformedProperties = savedProperties?.map(saved => {
      if (!saved.properties) {
        return null
      }
      
      return {
        savedPropertyId: saved.id,
        savedAt: saved.saved_at,
        notes: saved.notes,
        property: formatPropertyForCard(saved.properties)
      }
    }).filter(Boolean) || []

    return NextResponse.json({
      properties: transformedProperties,
      total: totalCount || 0,
      page,
      limit,
      totalPages: Math.ceil((totalCount || 0) / limit)
    })

  } catch (error) {
    console.error('Error in saved properties API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}