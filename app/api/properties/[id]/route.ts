import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireLandlord, optionalAuth } from '@/lib/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // First, let's find the property without status restrictions to debug
    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        *,
        landlord:user_profiles!landlord_id(
          full_name,
          company_name,
          avatar_url,
          phone
        )
      `)
      .eq('id', id)
      .single()
    
    if (error || !property) {
      console.log('Property not found:', { error, id })
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Format property data for frontend compatibility
    const formattedProperty = {
      ...property,
      monthly_rent: property.monthly_rent / 100, // Convert from pence to pounds
      availability: property.availability || 'vacant', // Default to vacant if not set
      // Add aliases for PropertyDetails component
      price: property.monthly_rent / 100, // Monthly rent alias
      availableDate: property.available_date, // Available date alias
      photos: property.photos || [],
      images: property.photos || [], // Add images alias
      amenities: property.amenities || [],
      title: `${property.property_type} in ${property.city}`,
      landlordName: property.landlord?.full_name || property.contact_name || 'N/A',
      landlordPhone: property.landlord?.phone || property.contact_phone || '',
      landlordEmail: property.contact_email || '',
      propertyType: property.property_type
    }

    return NextResponse.json({
      success: true,
      property: formattedProperty
    })
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireLandlord(request)
    if (result instanceof NextResponse) return result
    
    const req = result
    const { id } = await params
    const body = await request.json()
    
    // Check if property belongs to the landlord (or user is admin)
    const { data: existingProperty, error: fetchError } = await supabase
      .from('properties')
      .select('landlord_id')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }
    
    if (existingProperty.landlord_id !== req.user!.id && req.user!.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    // Only update provided fields
    const allowedFields = [
      'property_type', 'bedrooms', 'bathrooms', 'monthly_rent',
      'available_date', 'description', 'amenities', 'address', 'city', 'county',
      'postcode', 'photos', 'contact_name', 'contact_email', 'contact_phone', 'status'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'monthly_rent') {
          updateData[field] = Math.round(parseFloat(body[field]) * 100) // Convert to pence
        } else {
          updateData[field] = body[field]
        }
      }
    }
    
    const { data: property, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating property:', error)
      return NextResponse.json(
        { error: 'Failed to update property' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      property,
      message: 'Property updated successfully'
    })
  } catch (error) {
    console.error('Error in property PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireLandlord(request)
    if (result instanceof NextResponse) return result
    
    const req = result
    const { id } = await params
    
    // Check if property belongs to the landlord (or user is admin)
    const { data: existingProperty, error: fetchError } = await supabase
      .from('properties')
      .select('landlord_id')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }
    
    if (existingProperty.landlord_id !== req.user!.id && req.user!.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting property:', error)
      return NextResponse.json(
        { error: 'Failed to delete property' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully'
    })
  } catch (error) {
    console.error('Error in property DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}