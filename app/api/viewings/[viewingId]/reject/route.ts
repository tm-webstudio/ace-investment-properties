import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/middleware'
import { sendEmail } from '@/lib/email'
import ViewingRejected from '@/emails/investor/viewing-rejected'
import { formatPropertyAddress } from '@/lib/emailHelpers'

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables')
}

interface RejectRequestBody {
  rejectionReason?: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ viewingId: string }> }
) {
  try {
    const { viewingId } = await params
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

    // Send rejection email to requester
    try {
      // Fetch property details
      const { data: propertyDetails } = await supabase
        .from('properties')
        .select('title, address, street_address, city, postcode')
        .eq('id', viewing.property_id)
        .single()

      // Fetch requester info for user_type
      const { data: requesterProfile } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('id', viewing.user_id)
        .single()

      if (viewing.user_email && propertyDetails) {
        await sendEmail({
          to: viewing.user_email,
          subject: `Viewing Request Update - ${propertyDetails.title || 'Property'}`,
          react: ViewingRejected({
            propertyTitle: propertyDetails.title || 'Property',
            propertyAddress: formatPropertyAddress(propertyDetails),
            rejectionReason: rejectionReason || '',
            browseLink: requesterProfile?.user_type === 'investor'
              ? `${process.env.NEXT_PUBLIC_SITE_URL}/investor/property-matching`
              : `${process.env.NEXT_PUBLIC_SITE_URL}/properties`,
            dashboardLink: requesterProfile?.user_type === 'investor'
              ? `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`
              : `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
          })
        })
      }
    } catch (emailError) {
      console.error('Failed to send viewing rejection email:', emailError)
      // Don't fail the request if email fails
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