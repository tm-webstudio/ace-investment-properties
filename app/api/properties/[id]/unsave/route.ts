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

export async function DELETE(
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

    if (userProfile.user_type !== 'investor') {
      return NextResponse.json({ 
        error: 'This feature is for investors only' 
      }, { status: 403 })
    }

    // Remove the saved property (handle not found gracefully)
    const { data: deletedRows, error: deleteError } = await supabaseAdmin
      .from('saved_properties')
      .delete()
      .eq('investor_id', user.id)
      .eq('property_id', propertyId)
      .select('id')

    if (deleteError) {
      console.error('Error unsaving property:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to remove saved property' 
      }, { status: 500 })
    }

    // Return success even if nothing was deleted (graceful handling)
    return NextResponse.json({
      success: true,
      message: 'Property removed from saved',
      wasRemoved: deletedRows && deletedRows.length > 0
    })

  } catch (error) {
    console.error('Error in unsave property API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}