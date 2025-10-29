import { NextRequest, NextResponse } from 'next/server'
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

// Create regular client for auth verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Check if admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Service temporarily unavailable' 
      }, { status: 503 })
    }

    console.log('Publish endpoint called')
    
    const body = await request.json()
    const { pendingPropertyToken } = body
    
    console.log('Publish request body:', body)
    
    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    console.log('Token verification:', { user: !!user, error: authError?.message })
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('User profile lookup:', { found: !!userProfile, error: profileError?.message })

    if (!pendingPropertyToken) {
      return NextResponse.json(
        { error: 'Pending property token is required' },
        { status: 400 }
      )
    }

    // Validate pending property token and get property data
    const { data: pendingProperty, error: pendingError } = await supabaseAdmin
      .from('pending_properties')
      .select('*')
      .eq('verification_token', pendingPropertyToken)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    console.log('Pending property lookup:', { found: !!pendingProperty, error: pendingError?.message })

    if (pendingError || !pendingProperty) {
      return NextResponse.json(
        { error: 'Invalid or expired property token' },
        { status: 400 }
      )
    }

    // Ensure user is landlord (convert if needed)
    if (userProfile && userProfile.user_type !== 'landlord' && userProfile.user_type !== 'admin') {
      console.log('Converting user to landlord')
      await supabaseAdmin
        .from('user_profiles')
        .update({ user_type: 'landlord' })
        .eq('id', user.id)
    }

    const propertyData = pendingProperty.property_data as any

    // Validate critical fields
    if (!propertyData.propertyType || !propertyData.bedrooms || !propertyData.bathrooms || !propertyData.monthlyRent || !propertyData.address || !propertyData.city) {
      return NextResponse.json(
        { error: 'Missing required property data fields' },
        { status: 400 }
      )
    }
    
    console.log('Property data to insert:', {
      landlord_id: user.id,
      availability: propertyData.availability,
      property_type: propertyData.propertyType,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      monthly_rent: propertyData.monthlyRent,
      security_deposit: propertyData.securityDeposit,
      available_date: propertyData.availableDate,
      address: propertyData.address,
      city: propertyData.city,
      county: propertyData.state,
      postcode: propertyData.postcode,
      contact_name: propertyData.contactName,
      contact_email: propertyData.contactEmail,
      contact_phone: propertyData.contactPhone
    })
    
    // Create the property in properties table
    const { data: newProperty, error: propertyError } = await supabaseAdmin
      .from('properties')
      .insert({
        landlord_id: user.id,
        availability: propertyData.availability,
        property_type: propertyData.propertyType,
        bedrooms: parseInt(propertyData.bedrooms) || 1,
        bathrooms: parseInt(propertyData.bathrooms) || 1,
        monthly_rent: Math.round(parseFloat(propertyData.monthlyRent) * 100), // Convert to pence
        security_deposit: Math.round(parseFloat(propertyData.securityDeposit) * 100), // Convert to pence
        available_date: propertyData.availableDate === 'immediate' ? new Date().toISOString().split('T')[0] : propertyData.availableDate,
        description: propertyData.description,
        amenities: propertyData.amenities || [],
        address: propertyData.address,
        city: propertyData.city,
        county: propertyData.state || propertyData.county,
        postcode: propertyData.postcode,
        photos: propertyData.photos || [],
        contact_name: propertyData.contactName || userProfile?.full_name || userProfile?.email || user.email,
        contact_email: propertyData.contactEmail || userProfile?.email || user.email,
        contact_phone: propertyData.contactPhone || userProfile?.phone,
        status: 'draft',
        published_at: new Date().toISOString()
      })
      .select()
      .single()

    console.log('Property creation result:', { created: !!newProperty, error: propertyError })

    if (propertyError) {
      console.error('Error creating property:', propertyError)
      console.error('Property error details:', JSON.stringify(propertyError, null, 2))
      return NextResponse.json(
        { 
          error: 'Failed to publish property', 
          details: propertyError.message,
          code: propertyError.code,
          hint: propertyError.hint
        },
        { status: 500 }
      )
    }

    // Update pending property status to claimed
    await supabaseAdmin
      .from('pending_properties')
      .update({ status: 'claimed' })
      .eq('id', pendingProperty.id)

    // Clean up draft if it exists
    if (pendingProperty.draft_id) {
      await supabaseAdmin
        .from('property_drafts')
        .delete()
        .eq('id', pendingProperty.draft_id)
    }

    console.log('Property published successfully:', newProperty.id)

    return NextResponse.json({
      success: true,
      property: newProperty,
      message: 'Property published successfully'
    })
  } catch (error) {
    console.error('Error in property publish:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}