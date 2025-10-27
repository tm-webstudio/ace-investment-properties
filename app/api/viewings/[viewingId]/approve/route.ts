import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/middleware'

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { viewingId: string } }
) {
  try {
    const { viewingId } = params

    // Get user ID from authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Get viewing to check permissions
    const { data: viewing, error: viewingError } = await supabase
      .from('property_viewings')
      .select('*')
      .eq('id', viewingId)
      .single()

    if (viewingError || !viewing) {
      return NextResponse.json(
        { success: false, error: 'Viewing not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to approve (landlord or admin)
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    const isLandlord = viewing.landlord_id === user.id
    const isAdmin = userProfile?.user_type === 'admin'

    if (!isLandlord && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Permission denied. Only landlords and admins can approve viewings.' },
        { status: 403 }
      )
    }

    // Check if viewing is in a state that can be approved
    if (viewing.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Cannot approve viewing with status: ${viewing.status}` },
        { status: 400 }
      )
    }

    // Check if the viewing date/time is still in the future
    const viewingDateTime = new Date(`${viewing.viewing_date}T${viewing.viewing_time}`)
    const now = new Date()
    
    if (viewingDateTime <= now) {
      return NextResponse.json(
        { success: false, error: 'Cannot approve viewing for past date/time' },
        { status: 400 }
      )
    }

    // Update viewing status to approved
    const { data: updatedViewing, error: updateError } = await supabase
      .from('property_viewings')
      .update({ 
        status: 'approved',
        rejection_reason: null // Clear any previous rejection reason
      })
      .eq('id', viewingId)
      .select()
      .single()

    if (updateError) {
      console.error('Error approving viewing:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to approve viewing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      viewing: updatedViewing,
      message: 'Viewing approved successfully'
    })

  } catch (error) {
    console.error('Approve viewing error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}