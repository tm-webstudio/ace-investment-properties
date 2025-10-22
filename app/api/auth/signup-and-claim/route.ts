import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      pendingPropertyToken,
      acceptedTerms 
    } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !pendingPropertyToken || !acceptedTerms) {
      return NextResponse.json({ 
        error: 'All fields are required and terms must be accepted' 
      }, { status: 400 })
    }

    // Validate pending property token first
    const { data: pendingProperty, error: pendingError } = await supabase
      .from('pending_properties')
      .select('*')
      .eq('verification_token', pendingPropertyToken)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (pendingError || !pendingProperty) {
      return NextResponse.json({ 
        error: 'Invalid or expired property token' 
      }, { status: 400 })
    }

    // Create new user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          user_type: 'landlord'
        }
      }
    })

    if (authError || !authData.user) {
      return NextResponse.json({ 
        error: authError?.message || 'Failed to create account' 
      }, { status: 400 })
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        user_type: 'landlord',
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Continue with property claim even if profile creation fails
    }

    // Claim the property
    const propertyData = pendingProperty.property_data as any
    
    // Create the property in properties table
    const { data: newProperty, error: propertyError } = await supabase
      .from('properties')
      .insert({
        landlord_id: authData.user.id,
        title: `${propertyData.propertyType} in ${propertyData.city}`,
        property_type: propertyData.propertyType,
        property_licence: propertyData.propertyLicence,
        property_condition: propertyData.propertyCondition,
        address: propertyData.address,
        city: propertyData.city,
        county: propertyData.state,
        postcode: propertyData.postcode,
        monthly_rent: parseFloat(propertyData.monthlyRent),
        security_deposit: parseFloat(propertyData.securityDeposit),
        available_date: propertyData.availableDate,
        bedrooms: parseInt(propertyData.bedrooms),
        bathrooms: parseFloat(propertyData.bathrooms),
        description: propertyData.description,
        amenities: propertyData.amenities || [],
        photos: propertyData.photos || [],
        status: 'active'
      })
      .select()
      .single()

    if (propertyError) {
      console.error('Error creating property:', propertyError)
      return NextResponse.json({ 
        error: 'Failed to publish property' 
      }, { status: 500 })
    }

    // Update pending property status to claimed
    await supabase
      .from('pending_properties')
      .update({ status: 'claimed' })
      .eq('id', pendingProperty.id)

    // Clean up draft if it exists
    if (pendingProperty.draft_id) {
      await supabase
        .from('property_drafts')
        .delete()
        .eq('id', pendingProperty.draft_id)
    }

    return NextResponse.json({
      success: true,
      propertyId: newProperty.id,
      userId: authData.user.id,
      redirectUrl: '/landlord',
      message: 'Account created and property published successfully!'
    })

  } catch (error) {
    console.error('Error in signup-and-claim:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}