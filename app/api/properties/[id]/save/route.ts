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

    // Verify property exists and is active
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('id, status, landlord_id')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      return NextResponse.json({ 
        error: 'Property not found' 
      }, { status: 404 })
    }

    if (property.status !== 'active') {
      return NextResponse.json({ 
        error: 'Property is not available for saving' 
      }, { status: 400 })
    }

    // Prevent saving own properties (if user is somehow both investor and landlord)
    if (property.landlord_id === user.id) {
      return NextResponse.json({ 
        error: 'You cannot save your own property' 
      }, { status: 400 })
    }

    // Check if already saved (handle duplicate gracefully)
    const { data: existingSave } = await supabaseAdmin
      .from('saved_properties')
      .select('id, saved_at')
      .eq('investor_id', user.id)
      .eq('property_id', propertyId)
      .single()

    if (existingSave) {
      return NextResponse.json({
        success: true,
        message: 'Property already saved',
        savedAt: existingSave.saved_at,
        alreadyExists: true
      })
    }

    // Save the property
    const { data: savedProperty, error: saveError } = await supabaseAdmin
      .from('saved_properties')
      .insert({
        investor_id: user.id,
        property_id: propertyId
      })
      .select('saved_at')
      .single()

    if (saveError) {
      console.error('Error saving property:', saveError)
      return NextResponse.json({ 
        error: 'Failed to save property' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Property saved',
      savedAt: savedProperty.saved_at
    })

  } catch (error) {
    console.error('Error in save property API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}