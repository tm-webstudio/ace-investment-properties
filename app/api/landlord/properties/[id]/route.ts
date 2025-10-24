import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Create admin client for database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id
    
    // Get the authorization header
    const authorization = request.headers.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    
    // Verify the session with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Fetch the property from the database
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('landlord_id', user.id) // Ensure user owns this property
      .single()

    if (propertyError) {
      console.error('Error fetching property:', propertyError)
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      property: property
    })

  } catch (error) {
    console.error('Error in property fetch API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id
    
    // Get the authorization header
    const authorization = request.headers.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    
    // Verify the session with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Delete the property from the database
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .eq('landlord_id', user.id) // Ensure user owns this property

    if (deleteError) {
      console.error('Error deleting property:', deleteError)
      return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully'
    })

  } catch (error) {
    console.error('Error in property delete API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id
    
    // Get the authorization header
    const authorization = request.headers.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    
    // Verify the session with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Parse the request body
    const updateData = await request.json()
    
    console.log('Updating property:', propertyId, 'with data:', updateData)

    // Prepare the update object with proper field mapping
    const propertyUpdate = {
      property_type: updateData.property_type,
      property_licence: updateData.property_licence,
      property_condition: updateData.property_condition,
      address: updateData.address,
      city: updateData.city,
      county: updateData.county,
      postcode: updateData.postcode,
      monthly_rent: Math.round(updateData.monthly_rent * 100), // Convert to pence
      security_deposit: Math.round(updateData.security_deposit * 100), // Convert to pence
      available_date: updateData.available_date,
      bedrooms: updateData.bedrooms,
      bathrooms: updateData.bathrooms,
      description: updateData.description,
      amenities: updateData.amenities || [],
      photos: updateData.photos || [],
      updated_at: new Date().toISOString()
    }

    // Update the property in the database using admin client
    const { data: updatedProperty, error: updateError } = await supabaseAdmin
      .from('properties')
      .update(propertyUpdate)
      .eq('id', propertyId)
      .eq('landlord_id', user.id) // Ensure user owns this property
      .select()
      .single()

    if (updateError) {
      console.error('Error updating property:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update property', 
        details: updateError.message 
      }, { status: 500 })
    }

    if (!updatedProperty) {
      return NextResponse.json({ error: 'Property not found or not owned by user' }, { status: 404 })
    }

    console.log('Property updated successfully:', updatedProperty.id)

    return NextResponse.json({
      success: true,
      property: updatedProperty,
      message: 'Property updated successfully'
    })

  } catch (error) {
    console.error('Error in property update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}