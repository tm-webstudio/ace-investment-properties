import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Service temporarily unavailable' 
      }, { status: 503 })
    }

    const { id: propertyId } = await params
    
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

    // For non-investors (admins, landlords), return not saved without error
    if (userProfile.user_type !== 'investor') {
      return NextResponse.json({
        isSaved: false,
        savedAt: null
      })
    }

    // Check if property is saved
    const { data: savedProperty, error: checkError } = await supabaseAdmin
      .from('saved_properties')
      .select('id, saved_at')
      .eq('investor_id', user.id)
      .eq('property_id', propertyId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected
      console.error('Error checking saved property:', checkError)
      return NextResponse.json({ 
        error: 'Failed to check saved status' 
      }, { status: 500 })
    }

    return NextResponse.json({
      isSaved: !!savedProperty,
      savedAt: savedProperty?.saved_at || null
    })

  } catch (error) {
    console.error('Error in check saved property API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}