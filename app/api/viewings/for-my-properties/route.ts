import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

    // Verify user is a landlord
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profileError || userProfile?.user_type !== 'landlord') {
      return NextResponse.json(
        { success: false, error: 'Landlord access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query - get viewings for landlord's properties
    let query = supabase
      .from('property_viewings')
      .select(`
        *,
        properties (
          id,
          title,
          address,
          city,
          monthly_rent,
          photos
        ),
        user_profiles!property_viewings_user_id_fkey (
          full_name,
          email,
          phone
        )
      `)
      .eq('landlord_id', user.id)

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
    const { data: statusCounts } = await supabase
      .from('property_viewings')
      .select('status, count(*)', { count: 'exact' })
      .eq('landlord_id', user.id)

    const summary = {
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
      completed: 0
    }

    // Process status counts (this is a simplified approach)
    const { data: pendingCount } = await supabase
      .from('property_viewings')
      .select('*', { count: 'exact', head: true })
      .eq('landlord_id', user.id)
      .eq('status', 'pending')

    const { data: approvedCount } = await supabase
      .from('property_viewings')
      .select('*', { count: 'exact', head: true })
      .eq('landlord_id', user.id)
      .eq('status', 'approved')

    const { data: rejectedCount } = await supabase
      .from('property_viewings')
      .select('*', { count: 'exact', head: true })
      .eq('landlord_id', user.id)
      .eq('status', 'rejected')

    const { data: cancelledCount } = await supabase
      .from('property_viewings')
      .select('*', { count: 'exact', head: true })
      .eq('landlord_id', user.id)
      .eq('status', 'cancelled')

    const { data: completedCount } = await supabase
      .from('property_viewings')
      .select('*', { count: 'exact', head: true })
      .eq('landlord_id', user.id)
      .eq('status', 'completed')

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