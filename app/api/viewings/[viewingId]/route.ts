import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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