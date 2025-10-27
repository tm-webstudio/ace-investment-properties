import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface RejectRequestBody {
  rejectionReason?: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { viewingId: string } }
) {
  try {
    const { viewingId } = params
    const body: RejectRequestBody = await request.json()

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

    // Check if user has permission to reject (landlord or admin)
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    const isLandlord = viewing.landlord_id === user.id
    const isAdmin = userProfile?.user_type === 'admin'

    if (!isLandlord && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Permission denied. Only landlords and admins can reject viewings.' },
        { status: 403 }
      )
    }

    // Check if viewing is in a state that can be rejected
    if (!['pending', 'approved'].includes(viewing.status)) {
      return NextResponse.json(
        { success: false, error: `Cannot reject viewing with status: ${viewing.status}` },
        { status: 400 }
      )
    }

    // Validate rejection reason (optional but recommended)
    const rejectionReason = body.rejectionReason?.trim()
    if (rejectionReason && rejectionReason.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Update viewing status to rejected
    const { data: updatedViewing, error: updateError } = await supabase
      .from('property_viewings')
      .update({ 
        status: 'rejected',
        rejection_reason: rejectionReason || null
      })
      .eq('id', viewingId)
      .select()
      .single()

    if (updateError) {
      console.error('Error rejecting viewing:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to reject viewing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      viewing: updatedViewing,
      message: 'Viewing rejected successfully'
    })

  } catch (error) {
    console.error('Reject viewing error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}