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
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50) // Max 50 per page
    const minScore = parseInt(searchParams.get('minScore') || '0') // Minimum match score filter
    const offset = parseInt(searchParams.get('offset') || '0') || (page - 1) * limit

    // Check if user has preferences set up
    const { data: preferences, error: prefError } = await supabaseAdmin
      .from('investor_preferences')
      .select('id, preference_data, is_active')
      .eq('investor_id', user.id)
      .eq('is_active', true)
      .single()

    if (prefError || !preferences) {
      return NextResponse.json({
        success: true,
        message: 'No preferences set up yet',
        properties: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasPreferences: false
      })
    }

    // Get matched properties using the database function
    const { data: matchedProperties, error: matchError } = await supabaseAdmin
      .rpc('get_matched_properties_for_investor', {
        investor_uuid: user.id,
        page_limit: limit,
        page_offset: offset,
        min_match_score: minScore
      })

    if (matchError) {
      console.error('Error getting matched properties:', matchError)
      return NextResponse.json({ 
        error: 'Failed to get matched properties' 
      }, { status: 500 })
    }

    // Get total count for pagination (separate query for performance)
    const { data: totalCountData, error: countError } = await supabaseAdmin
      .rpc('get_matched_properties_for_investor', {
        investor_uuid: user.id,
        page_limit: 1000, // Large number to get all matches for count
        page_offset: 0,
        min_match_score: minScore
      })

    const total = totalCountData?.length || 0
    const totalPages = Math.ceil(total / limit)

    // Transform the data for frontend consumption
    const formattedProperties = matchedProperties?.map((item: any) => {
      const property = item.property_data
      const formattedProperty = formatPropertyForCard(property)
      
      return {
        ...formattedProperty,
        // Match information
        matchScore: item.match_score,
        matchReasons: item.match_reasons
      }
    }) || []

    return NextResponse.json({
      success: true,
      properties: formattedProperties,
      total,
      page,
      limit,
      totalPages,
      hasPreferences: true,
      preferences: {
        operator_type: preferences.operator_type,
        criteria: preferences.preference_data
      }
    })

  } catch (error) {
    console.error('Error in matched properties API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}