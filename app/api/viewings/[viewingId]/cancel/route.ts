import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/middleware'

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ viewingId: string }> }
) {
  try {
    const { viewingId } = await params

    // Use the requireAuth middleware
    const req = await requireAuth(request)
    
    if (req instanceof NextResponse) {
      return req // Return auth error response
    }

    // Get viewing and property to check permissions
    const { data: viewing, error: viewingError } = await supabase
      .from('property_viewings')
      .select(`
        *,
        property:properties (
          id,
          landlord_id
        )
      `)
      .eq('id', viewingId)
      .single()

    if (viewingError || !viewing) {
      return NextResponse.json(
        { success: false, error: 'Viewing not found' },
        { status: 404 }
      )
    }

    // Get user profile to check if admin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', req.user.id)
      .single()

    // Check if user is either the viewing requester (investor), the property owner (landlord), or an admin
    const isInvestor = viewing.user_id === req.user.id
    const isLandlord = viewing.property?.landlord_id === req.user.id
    const isAdmin = userProfile?.user_type === 'admin'

    if (!isInvestor && !isLandlord && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Permission denied. You can only cancel your own viewing requests or viewings for your properties.' },
        { status: 403 }
      )
    }

    // Check if viewing is in a state that can be cancelled
    if (!['pending', 'approved'].includes(viewing.status)) {
      return NextResponse.json(
        { success: false, error: `Cannot cancel viewing with status: ${viewing.status}` },
        { status: 400 }
      )
    }

    // Check if it's not too late to cancel (e.g., at least 2 hours before viewing)
    const viewingDateTime = new Date(`${viewing.viewing_date}T${viewing.viewing_time}`)
    const now = new Date()
    const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000))
    
    if (viewingDateTime <= twoHoursFromNow) {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel viewing less than 2 hours before the scheduled time. Please contact the landlord directly.' },
        { status: 400 }
      )
    }

    // Update viewing status to cancelled
    const { data: updatedViewing, error: updateError } = await supabase
      .from('property_viewings')
      .update({ 
        status: 'cancelled'
      })
      .eq('id', viewingId)
      .select()
      .single()

    if (updateError) {
      console.error('Error cancelling viewing:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to cancel viewing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      viewing: updatedViewing,
      message: 'Viewing cancelled successfully'
    })

  } catch (error) {
    console.error('Cancel viewing error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}