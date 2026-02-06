import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Helper function to verify admin user
async function verifyAdmin(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 }
  }

  const token = authHeader.substring(7)

  const { data: { user }, error: userError } = await supabase.auth.getUser(token)

  if (userError || !user) {
    return { error: 'Unauthorized', status: 401 }
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'admin') {
    return { error: 'Admin access required', status: 403 }
  }

  return { user, supabase }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const authResult = await verifyAdmin(request)

    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const { supabase } = authResult

    // Fetch the property from the database (admin can access any property)
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        id,
        property_type,
        bedrooms,
        bathrooms,
        monthly_rent,
        available_date,
        description,
        amenities,
        address,
        city,
        local_authority,
        postcode,
        photos,
        status,
        availability,
        property_licence,
        property_condition,
        published_at,
        landlord_id,
        created_at,
        updated_at
      `)
      .eq('id', propertyId)
      .single()

    if (propertyError) {
      console.error('Error fetching property:', propertyError)
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      )
    }

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      )
    }

    // Convert amounts from pence back to pounds for display
    const propertyForDisplay = {
      ...property,
      monthly_rent: property.monthly_rent / 100,
      availability: property.availability || 'vacant'
    }

    return NextResponse.json({
      success: true,
      property: propertyForDisplay
    })

  } catch (error) {
    console.error('Error in admin property fetch API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const authResult = await verifyAdmin(request)

    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const { supabase } = authResult

    // Delete the property from the database (admin can delete any property)
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)

    if (deleteError) {
      console.error('Error deleting property:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete property' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully'
    })

  } catch (error) {
    console.error('Error in admin property delete API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const authResult = await verifyAdmin(request)

    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const { supabase } = authResult

    // Parse the request body
    const updateData = await request.json()

    console.log('Admin updating property:', propertyId, 'with data:', updateData)

    // Prepare the update object with proper field mapping
    const propertyUpdate = {
      availability: updateData.availability,
      property_type: updateData.property_type,
      property_licence: updateData.property_licence,
      property_condition: updateData.property_condition,
      address: updateData.address,
      city: updateData.city,
      local_authority: updateData.localAuthority,
      postcode: updateData.postcode,
      monthly_rent: Math.round(updateData.monthly_rent * 100), // Convert to pence
      available_date: updateData.available_date || null,
      bedrooms: updateData.bedrooms,
      bathrooms: updateData.bathrooms,
      description: updateData.description,
      amenities: updateData.amenities || [],
      photos: updateData.photos || [],
      updated_at: new Date().toISOString()
    }

    // Update the property in the database (admin can update any property)
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update(propertyUpdate)
      .eq('id', propertyId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating property:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update property',
        details: updateError.message
      }, { status: 500 })
    }

    if (!updatedProperty) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      )
    }

    console.log('Property updated successfully by admin:', updatedProperty.id)

    return NextResponse.json({
      success: true,
      property: updatedProperty,
      message: 'Property updated successfully'
    })

  } catch (error) {
    console.error('Error in admin property update API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
