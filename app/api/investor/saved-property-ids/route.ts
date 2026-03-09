import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 })
    }

    const authorization = request.headers.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Verify investor
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.user_type !== 'investor') {
      return NextResponse.json({ savedIds: [] })
    }

    // Fetch all saved property IDs for this investor
    const { data: savedProperties, error: fetchError } = await supabaseAdmin
      .from('saved_properties')
      .select('property_id')
      .eq('investor_id', user.id)

    if (fetchError) {
      console.error('Error fetching saved property IDs:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch saved properties' }, { status: 500 })
    }

    const savedIds = (savedProperties || []).map((sp: { property_id: string }) => sp.property_id)

    return NextResponse.json({ savedIds })
  } catch (error) {
    console.error('Error in saved-property-ids API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
