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
    const userType = searchParams.get('userType') // 'landlord', 'investor'

    // Build query
    let query = supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by user type if provided
    if (userType) {
      query = query.eq('user_type', userType)
    }

    const { data: users, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // For each user, get their email from auth and property count
    const formattedUsers = await Promise.all(
      (users || []).map(async (userProfile) => {
        let email = ''
        let propertyCount = 0

        // Get user email from auth
        const { data: authUser } = await supabase.auth.admin.getUserById(userProfile.id)
        if (authUser?.user) {
          email = authUser.user.email || ''
        }

        // Get property count for landlords
        if (userProfile.user_type === 'landlord') {
          const { count } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('landlord_id', userProfile.id)

          propertyCount = count || 0
        }

        return {
          id: userProfile.id,
          full_name: userProfile.full_name,
          company_name: userProfile.company_name,
          email,
          phone: userProfile.phone,
          user_type: userProfile.user_type,
          created_at: userProfile.created_at,
          property_count: propertyCount
        }
      })
    )

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      count: formattedUsers.length
    })

  } catch (error) {
    console.error('Error in admin users API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
