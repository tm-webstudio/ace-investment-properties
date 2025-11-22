import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/middleware'

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables')
}

export async function GET(
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

    // Get viewing with all related data
    const { data: viewing, error: viewingError } = await supabase
      .from('property_viewings')
      .select(`
        *,
        properties (
          id,
          title,
          address,
          city,
          monthly_rent,
          photos,
          description,
          bedrooms,
          bathrooms,
          property_type,
          amenities
        ),
        user_profiles!property_viewings_user_id_fkey (
          full_name,
          email,
          phone
        ),
        landlord:user_profiles!property_viewings_landlord_id_fkey (
          full_name,
          email,
          phone
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

    // Check if user has permission to view this viewing
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    const isOwner = viewing.user_id === user.id
    const isLandlord = viewing.landlord_id === user.id
    const isAdmin = userProfile?.user_type === 'admin'

    if (!isOwner && !isLandlord && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      viewing
    })

  } catch (error) {
    console.error('Get viewing error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
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

    // Get request body
    const body = await request.json()
    const { viewing_date, viewing_time } = body

    if (!viewing_date || !viewing_time) {
      return NextResponse.json(
        { success: false, error: 'Viewing date and time are required' },
        { status: 400 }
      )
    }

    // Get viewing to check permissions
    const { data: viewing, error: viewingError } = await supabase
      .from('property_viewings')
      .select('id, user_id, landlord_id, status')
      .eq('id', viewingId)
      .single()

    if (viewingError || !viewing) {
      return NextResponse.json(
        { success: false, error: 'Viewing not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to update this viewing
    const isOwner = viewing.user_id === user.id
    const isLandlord = viewing.landlord_id === user.id

    if (!isOwner && !isLandlord) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Only allow updating pending or approved viewings
    if (viewing.status !== 'pending' && viewing.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Only pending or approved viewings can be updated' },
        { status: 400 }
      )
    }

    // If landlord approved the viewing and investor is changing it, reset status to pending
    const updateData: any = {
      viewing_date,
      viewing_time,
      updated_at: new Date().toISOString()
    }

    // If viewing was approved and investor is making the change, reset to pending
    if (viewing.status === 'approved' && isOwner) {
      updateData.status = 'pending'
    }

    // Update the viewing
    const { data: updatedViewing, error: updateError } = await supabase
      .from('property_viewings')
      .update(updateData)
      .eq('id', viewingId)
      .select()
      .single()

    if (updateError) {
      console.error('Update viewing error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update viewing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Viewing updated successfully',
      viewing: updatedViewing
    })

  } catch (error) {
    console.error('Update viewing error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
      .select('id, user_id, landlord_id, status')
      .eq('id', viewingId)
      .single()

    if (viewingError || !viewing) {
      return NextResponse.json(
        { success: false, error: 'Viewing not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to delete this viewing
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    const isOwner = viewing.user_id === user.id
    const isLandlord = viewing.landlord_id === user.id
    const isAdmin = userProfile?.user_type === 'admin'

    if (!isOwner && !isLandlord && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Only allow deletion of cancelled or rejected viewings (unless admin)
    if (viewing.status !== 'cancelled' && viewing.status !== 'rejected' && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only cancelled or rejected viewings can be deleted' },
        { status: 400 }
      )
    }

    // Delete the viewing
    const { error: deleteError } = await supabase
      .from('property_viewings')
      .delete()
      .eq('id', viewingId)

    if (deleteError) {
      console.error('Delete viewing error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete viewing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Viewing deleted successfully'
    })

  } catch (error) {
    console.error('Delete viewing error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}