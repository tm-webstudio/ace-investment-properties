import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  try {
    console.log('Create pending property endpoint called')
    
    const body = await request.json()
    console.log('Create pending request body:', body)
    
    const { propertyData, contactInfo } = body
    
    // Validate required property data
    if (!propertyData || !contactInfo) {
      return NextResponse.json(
        { error: 'Property data and contact info are required' },
        { status: 400 }
      )
    }

    // Validate required fields
    const requiredFields = ['propertyType', 'bedrooms', 'bathrooms', 'monthlyRent', 'securityDeposit', 'availableDate', 'description', 'address', 'city', 'postcode']
    
    for (const field of requiredFields) {
      if (!propertyData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create the property data object for pending_properties
    const pendingPropertyData = {
      propertyType: propertyData.propertyType,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      monthlyRent: propertyData.monthlyRent,
      securityDeposit: propertyData.securityDeposit,
      availableDate: propertyData.availableDate,
      description: propertyData.description,
      amenities: propertyData.amenities || [],
      address: propertyData.address,
      city: propertyData.city,
      state: propertyData.county || propertyData.state,
      postcode: propertyData.postcode,
      photos: propertyData.photos || [],
      contactName: contactInfo.contactName,
      contactEmail: contactInfo.contactEmail,
      contactPhone: contactInfo.contactPhone
    }

    console.log('Creating pending property with data:', pendingPropertyData)

    // Create pending property record
    const { data: pendingProperty, error: pendingError } = await supabaseAdmin
      .from('pending_properties')
      .insert({
        property_data: pendingPropertyData,
        email_for_claim: contactInfo.contactEmail,
        status: 'pending'
      })
      .select()
      .single()

    if (pendingError) {
      console.error('Error creating pending property:', pendingError)
      return NextResponse.json(
        { error: 'Failed to create pending property', details: pendingError.message },
        { status: 500 }
      )
    }

    console.log('Pending property created successfully:', pendingProperty.id)

    return NextResponse.json({
      success: true,
      pendingPropertyToken: pendingProperty.verification_token,
      pendingPropertyId: pendingProperty.id,
      message: 'Pending property created successfully'
    })

  } catch (error) {
    console.error('Error in create-pending:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}