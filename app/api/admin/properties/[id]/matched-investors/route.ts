import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Find matching investors using the property matching function
    const { data: matchingInvestors, error: matchError } = await supabase
      .rpc('find_matching_investors_for_property', {
        p_property_id: propertyId
      })

    if (matchError) {
      console.error('Error finding matching investors:', matchError)
      return NextResponse.json({
        success: true,
        investors: []
      })
    }

    return NextResponse.json({
      success: true,
      investors: matchingInvestors || []
    })

  } catch (error: any) {
    console.error('Error fetching matching investors:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
