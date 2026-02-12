import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { formatPropertyForCard } from '@/lib/property-utils'
import { getMatchedProperties } from '@/lib/propertyMatching'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: investorId } = await params
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')
    const minScore = parseInt(searchParams.get('minScore') || '60')

    // Check if investor has preferences set up
    const { data: preferences, error: prefError } = await supabase
      .from('investor_preferences')
      .select('id, preference_data, is_active')
      .eq('investor_id', investorId)
      .eq('is_active', true)
      .single()

    if (prefError || !preferences) {
      return NextResponse.json({
        success: true,
        message: 'No preferences set up yet',
        properties: [],
        total: 0,
        hasPreferences: false
      })
    }

    // Use JS-based matching (same as investor API)
    const result = await getMatchedProperties(investorId, { minScore, limit, offset })

    return NextResponse.json({
      success: true,
      properties: result.properties,
      total: result.total,
      hasPreferences: result.hasPreferences
    })

  } catch (error) {
    console.error('Error in admin matched properties API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
