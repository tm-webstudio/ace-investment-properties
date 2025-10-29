import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client for database operations
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

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Service temporarily unavailable' 
      }, { status: 503 })
    }

    const body = await request.json()
    const { propertyId, action } = body // action: 'approve' or 'reject'
    
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

    // Check if user is admin
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profileError || userProfile?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    if (!propertyId || !action) {
      return NextResponse.json(
        { error: 'Property ID and action are required' },
        { status: 400 }
      )
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Action must be approve or reject' },
        { status: 400 }
      )
    }

    // Update property status
    const newStatus = action === 'approve' ? 'active' : 'rejected'
    const updateData: any = {
      status: newStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    }

    if (action === 'approve') {
      updateData.published_at = new Date().toISOString()
    }

    const { data: updatedProperty, error: updateError } = await supabaseAdmin
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .eq('status', 'pending_approval')
      .select()
      .single()

    if (updateError || !updatedProperty) {
      return NextResponse.json(
        { error: 'Failed to update property status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      property: updatedProperty,
      message: `Property ${action}d successfully`
    })

  } catch (error) {
    console.error('Error in property approval:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}