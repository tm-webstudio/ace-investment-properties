import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getMatchedProperties } from '@/lib/propertyMatching'

// Create admin client for profile checks
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

    const authorization = request.headers.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({
        error: 'Authentication required'
      }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({
        error: 'Invalid or expired token'
      }, { status: 401 })
    }

    // Verify investor role
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    if (userProfile.user_type !== 'investor') {
      return NextResponse.json({ error: 'This feature is for investors only' }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const minScore = parseInt(searchParams.get('minScore') || '60')
    const offset = parseInt(searchParams.get('offset') || '0') || (page - 1) * limit

    // Use JS-based matching
    const result = await getMatchedProperties(user.id, { minScore, limit, offset })

    if (!result.hasPreferences) {
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

    const totalPages = Math.ceil(result.total / limit)

    return NextResponse.json({
      success: true,
      properties: result.properties,
      total: result.total,
      page,
      limit,
      totalPages,
      hasPreferences: true,
      preferences: {
        criteria: result.preferences
      }
    })

  } catch (error) {
    console.error('Error in matched properties API:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
