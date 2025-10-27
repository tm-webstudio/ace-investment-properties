import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/middleware'

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables')
}

export async function GET(request: NextRequest) {
  try {
    // Use the requireAuth middleware
    const req = await requireAuth(request)
    
    if (req instanceof NextResponse) {
      return req // Return auth error response
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query - fetch viewings only, will manually add property data
    let query = supabase
      .from('property_viewings')
      .select('*')
      .eq('user_id', req.user.id)
      .order('viewing_date', { ascending: false })
      .order('viewing_time', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: viewings, error: viewingsError } = await query

    if (viewingsError) {
      console.error('Error fetching user viewings:', viewingsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch viewing requests' },
        { status: 500 }
      )
    }

    // Manually fetch property data for each viewing
    if (viewings && viewings.length > 0) {
      for (const viewing of viewings) {
        if (viewing.property_id) {
          const { data: property } = await supabase
            .from('properties')
            .select('id, property_type, address, city, monthly_rent, photos')
            .eq('id', viewing.property_id)
            .single()
          
          // Attach the property data to the viewing
          viewing.property = property
        }
      }
    }


    // Mark as viewed by user
    if (viewings && viewings.length > 0) {
      const unviewedIds = viewings
        .filter(v => !v.viewed_by_user)
        .map(v => v.id)

      if (unviewedIds.length > 0) {
        await supabase
          .from('property_viewings')
          .update({ viewed_by_user: true })
          .in('id', unviewedIds)
      }
    }

    return NextResponse.json({
      success: true,
      viewings: viewings || [],
      pagination: {
        limit,
        offset,
        hasMore: viewings?.length === limit
      }
    })

  } catch (error) {
    console.error('My requests error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}