import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify the user is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // 'pending', 'approved', 'rejected', 'cancelled', 'all'
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : 50

    // Build query - fetch property_viewings first
    let query = supabase
      .from('property_viewings')
      .select('*')
      .order('viewing_date', { ascending: false })
      .order('viewing_time', { ascending: false })
      .limit(limit)

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: viewingRequests, error } = await query

    if (error) {
      console.error('Error fetching property_viewings:', error)
      return NextResponse.json(
        { success: false, error: `Failed to fetch viewings: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('Fetched property viewings:', viewingRequests?.length || 0)

    // Fetch property, user, and landlord details separately for each viewing
    const viewings = await Promise.all(
      (viewingRequests || []).map(async (viewing) => {
        let property = null
        let user_profile = null
        let landlord_profile = null

        // Get property details
        if (viewing.property_id) {
          const { data: propertyData } = await supabase
            .from('properties')
            .select('id, property_type, address, city, postcode, monthly_rent, photos, landlord_id')
            .eq('id', viewing.property_id)
            .single()

          if (propertyData) {
            property = propertyData

            // Get landlord profile details
            if (propertyData.landlord_id) {
              const { data: landlordData } = await supabase
                .from('user_profiles')
                .select('full_name, email, phone')
                .eq('id', propertyData.landlord_id)
                .single()

              if (landlordData) {
                landlord_profile = landlordData
              }
            }
          }
        }

        // Get user profile details (investor)
        if (viewing.user_id) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('full_name, email, phone')
            .eq('id', viewing.user_id)
            .single()

          if (profileData) {
            user_profile = profileData
          }
        }

        return {
          ...viewing,
          property,
          user_profile,
          landlord_profile
        }
      })
    )

    // Calculate stats
    const { data: allViewings } = await supabase
      .from('property_viewings')
      .select('status')

    const stats = {
      pending: allViewings?.filter(v => v.status === 'pending').length || 0,
      approved: allViewings?.filter(v => v.status === 'approved').length || 0,
      rejected: allViewings?.filter(v => v.status === 'rejected').length || 0,
      cancelled: allViewings?.filter(v => v.status === 'cancelled').length || 0,
      completed: allViewings?.filter(v => v.status === 'completed').length || 0
    }

    return NextResponse.json({
      success: true,
      viewings: viewings || [],
      summary: stats,
      count: viewings?.length || 0
    })

  } catch (error) {
    console.error('Error in admin viewings API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
