import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/middleware'

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables')
}

export async function GET(request: NextRequest) {
  try {
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

    // Verify user is a landlord or admin
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profileError || (userProfile?.user_type !== 'landlord' && userProfile?.user_type !== 'admin')) {
      return NextResponse.json(
        { success: false, error: 'Landlord or admin access required' },
        { status: 403 }
      )
    }

    const isAdmin = userProfile?.user_type === 'admin'

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query - get viewings for landlord's properties or all viewings for admin
    let query = supabase
      .from('property_viewings')
      .select('*')

    // Filter by landlord if not admin
    if (!isAdmin) {
      query = query.eq('landlord_id', user.id)
    }

    // Filter by status - default to pending first, then others
    if (status === 'pending') {
      query = query.eq('status', 'pending')
      query = query.order('viewing_date', { ascending: true })
      query = query.order('viewing_time', { ascending: true })
    } else if (status === 'all') {
      // Show pending first, then others by date desc
      query = query.order('status', { ascending: true }) // pending comes first alphabetically
      query = query.order('viewing_date', { ascending: false })
      query = query.order('viewing_time', { ascending: false })
    } else {
      query = query.eq('status', status)
      query = query.order('viewing_date', { ascending: false })
      query = query.order('viewing_time', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data: viewings, error: viewingsError } = await query

    if (viewingsError) {
      console.error('Error fetching landlord viewings:', viewingsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch viewing requests' },
        { status: 500 }
      )
    }

    // Manually fetch property and user data for each viewing
    if (viewings && viewings.length > 0) {
      for (const viewing of viewings) {
        // Fetch property data
        if (viewing.property_id) {
          const { data: property } = await supabase
            .from('properties')
            .select('id, property_type, address, city, postcode, monthly_rent, photos')
            .eq('id', viewing.property_id)
            .single()

          viewing.property = property
        }

        // Fetch user data
        if (viewing.user_id) {
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('full_name, email, phone')
            .eq('id', viewing.user_id)
            .single()
          
          viewing.user_profile = userProfile
        }
      }
    }

    // Mark as viewed by landlord
    if (viewings && viewings.length > 0) {
      const unviewedIds = viewings
        .filter(v => !v.viewed_by_landlord)
        .map(v => v.id)

      if (unviewedIds.length > 0) {
        await supabase
          .from('property_viewings')
          .update({ viewed_by_landlord: true })
          .in('id', unviewedIds)
      }
    }

    // Get summary counts
    const summary = {
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
      completed: 0
    }

    // Build count queries with landlord filter if not admin
    let pendingCountQuery = supabase
      .from('property_viewings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    let approvedCountQuery = supabase
      .from('property_viewings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    let rejectedCountQuery = supabase
      .from('property_viewings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')

    let cancelledCountQuery = supabase
      .from('property_viewings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled')

    let completedCountQuery = supabase
      .from('property_viewings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    // Apply landlord filter if not admin
    if (!isAdmin) {
      pendingCountQuery = pendingCountQuery.eq('landlord_id', user.id)
      approvedCountQuery = approvedCountQuery.eq('landlord_id', user.id)
      rejectedCountQuery = rejectedCountQuery.eq('landlord_id', user.id)
      cancelledCountQuery = cancelledCountQuery.eq('landlord_id', user.id)
      completedCountQuery = completedCountQuery.eq('landlord_id', user.id)
    }

    // Execute count queries
    const { data: pendingCount } = await pendingCountQuery
    const { data: approvedCount } = await approvedCountQuery
    const { data: rejectedCount } = await rejectedCountQuery
    const { data: cancelledCount } = await cancelledCountQuery
    const { data: completedCount } = await completedCountQuery

    return NextResponse.json({
      success: true,
      viewings: viewings || [],
      summary: {
        pending: pendingCount?.length || 0,
        approved: approvedCount?.length || 0,
        rejected: rejectedCount?.length || 0,
        cancelled: cancelledCount?.length || 0,
        completed: completedCount?.length || 0
      },
      pagination: {
        limit,
        offset,
        hasMore: viewings?.length === limit
      }
    })

  } catch (error) {
    console.error('Landlord viewings error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}