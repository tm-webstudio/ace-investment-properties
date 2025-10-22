import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, pendingPropertyToken } = body

    // Validate required fields
    if (!email || !password || !pendingPropertyToken) {
      return NextResponse.json({ 
        error: 'Email, password, and property token are required' 
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

    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 })
    }

    // Check if user has a profile, if not create one
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()

    if (!existingProfile) {
      // Create basic profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          email: authData.user.email,
          user_type: 'landlord',
          first_name: authData.user.user_metadata?.first_name || '',
          last_name: authData.user.user_metadata?.last_name || ''
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
      }
    } else if (existingProfile.user_type !== 'landlord') {
      // Convert existing user to landlord
      await supabase
        .from('user_profiles')
        .update({ user_type: 'landlord' })
        .eq('user_id', authData.user.id)
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
      message: 'Successfully logged in and property published!'
    })

  } catch (error) {
    console.error('Error in login-and-claim:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}