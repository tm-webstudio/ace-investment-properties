import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Create admin client for database operations (only if env vars are available)
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    
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
      .eq('landlord_id', user.id) // Ensure user owns this property
      .single()

    if (propertyError) {
      console.error('Error fetching property:', propertyError)
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Convert amounts from pence back to pounds for display
    const propertyForDisplay = {
      ...property,
      monthly_rent: property.monthly_rent / 100,
      availability: property.availability || 'vacant' // Default to vacant if not set
    }

    return NextResponse.json({
      success: true,
      property: propertyForDisplay
    })

  } catch (error) {
    console.error('Error in property fetch API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    
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
      availability: updateData.availability,
      property_type: updateData.property_type,
      property_licence: updateData.property_licence,
      property_condition: updateData.property_condition,
      address: updateData.address,
      city: updateData.city,
      local_authority: updateData.local_authority,
      postcode: updateData.postcode,
      monthly_rent: Math.round(updateData.monthly_rent * 100), // Convert to pence
      available_date: updateData.available_date || null, // Convert empty string to null
      bedrooms: updateData.bedrooms,
      bathrooms: updateData.bathrooms,
      description: updateData.description,
      amenities: updateData.amenities || [],
      photos: updateData.photos || [],
      updated_at: new Date().toISOString()
    }

    // Check if admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Service temporarily unavailable' 
      }, { status: 503 })
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
      console.error('Update data that failed:', propertyUpdate)
      return NextResponse.json({ 
        error: 'Failed to update property', 
        details: updateError.message,
        code: updateError.code 
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