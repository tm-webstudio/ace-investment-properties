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

export async function POST(
  request: NextRequest,
  { params }: { params: { savedPropertyId: string } }
) {
  try {
    // Check if admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Service temporarily unavailable' 
      }, { status: 503 })
    }

    const savedPropertyId = params.savedPropertyId
    
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

    // Parse request body
    const body = await request.json()
    const { notes } = body

    if (notes !== undefined && typeof notes !== 'string') {
      return NextResponse.json({ 
        error: 'Notes must be a string' 
      }, { status: 400 })
    }

    // Update the notes (ensuring the saved property belongs to the current user)
    const { data: updatedSavedProperty, error: updateError } = await supabaseAdmin
      .from('saved_properties')
      .update({ notes: notes || null })
      .eq('id', savedPropertyId)
      .eq('investor_id', user.id) // Ensure ownership
      .select(`
        id,
        saved_at,
        notes,
        properties (
          id,
          property_type,
          address,
          city,
          monthly_rent
        )
      `)
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ 
          error: 'Saved property not found or not owned by user' 
        }, { status: 404 })
      }
      console.error('Error updating saved property notes:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update notes' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      savedProperty: updatedSavedProperty,
      message: 'Notes updated successfully'
    })

  } catch (error) {
    console.error('Error in update saved property notes API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}