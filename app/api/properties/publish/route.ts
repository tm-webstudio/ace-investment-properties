import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { optionalAuth, rateLimit, validatePropertyStep } from '@/lib/middleware'
import { secureCreateProperty } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(300000, 5)(request) // 5 publications per 5 minutes
    if (rateLimitResult) return rateLimitResult

    const req = await optionalAuth(request)
    const body = await request.json()
    
    console.log('Auth debug - headers:', request.headers.get('authorization') ? 'present' : 'missing')
    console.log('Auth debug - user:', req.user ? `${req.user.email} (${req.user.user_type})` : 'no user')
    
    const { draftId, sessionId, contactInfo } = body
    
    console.log('Publish request:', { draftId, sessionId, hasUser: !!req.user })
    
    if (!draftId && !sessionId) {
      return NextResponse.json(
        { error: 'Draft ID or session ID is required' },
        { status: 400 }
      )
    }
    
    // Fetch the draft
    let draft = null
    let draftError = null
    
    if (draftId) {
      // First try to find by draft ID
      const result = await supabase
        .from('property_drafts')
        .select('*')
        .eq('id', draftId)
        .single()
      draft = result.data
      draftError = result.error
    } else if (sessionId) {
      // Try to find by session ID first
      const result = await supabase
        .from('property_drafts')
        .select('*')
        .eq('session_id', sessionId)
        .single()
      draft = result.data
      draftError = result.error
    }
    
    // If authenticated and no draft found yet, try to find by user_id
    if (!draft && req.user) {
      console.log('No draft found by draftId/sessionId, trying user_id:', req.user.id)
      const result = await supabase
        .from('property_drafts')
        .select('*')
        .eq('user_id', req.user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      draft = result.data
      draftError = result.error
    }
    
    console.log('Draft lookup result:', { draft: !!draft, draftError: draftError?.message })
    
    if (draftError || !draft) {
      console.log('Draft not found:', { draftError, hasDraft: !!draft })
      return NextResponse.json(
        { error: 'Draft not found or access denied' },
        { status: 404 }
      )
    }
    
    // Validate all required steps are completed
    const requiredSteps = [1, 2, 3]
    for (const step of requiredSteps) {
      const stepDataKey = `step_${step}_data`
      const stepData = draft[stepDataKey]
      
      if (!stepData || Object.keys(stepData).length === 0) {
        return NextResponse.json(
          { error: `Step ${step} is incomplete` },
          { status: 400 }
        )
      }
      
      try {
        validatePropertyStep(step, stepData)
      } catch (error: any) {
        return NextResponse.json(
          { error: `Step ${step} validation failed`, details: error.errors },
          { status: 400 }
        )
      }
    }
    
    // Check authentication status
    if (!req.user) {
      // Create pending property for non-authenticated users
      const allPropertyData = {
        propertyType: draft.step_1_data?.propertyType,
        propertyLicence: draft.step_1_data?.propertyLicence,
        propertyCondition: draft.step_1_data?.propertyCondition,
        bedrooms: draft.step_1_data?.bedrooms,
        bathrooms: draft.step_1_data?.bathrooms,
        monthlyRent: draft.step_1_data?.monthlyRent,
        securityDeposit: draft.step_1_data?.securityDeposit,
        availableDate: draft.step_1_data?.availableDate,
        description: draft.step_1_data?.description,
        amenities: draft.step_1_data?.amenities || [],
        address: draft.step_2_data?.address,
        city: draft.step_2_data?.city,
        state: draft.step_2_data?.state,
        postcode: draft.step_2_data?.postcode,
        photos: draft.step_3_data?.photos || [],
        primaryPhotoIndex: draft.step_3_data?.primaryPhotoIndex || 0,
        contactName: contactInfo?.contactName || draft.step_4_data?.contactName,
        contactEmail: contactInfo?.contactEmail || draft.step_4_data?.contactEmail,
        contactPhone: contactInfo?.contactPhone || draft.step_4_data?.contactPhone
      }

      // Create pending property
      const { data: pendingProperty, error: pendingError } = await supabase
        .from('pending_properties')
        .insert({
          draft_id: draft.id,
          property_data: allPropertyData,
          session_id: sessionId,
          email_for_claim: contactInfo?.contactEmail,
          status: 'pending'
        })
        .select()
        .single()

      if (pendingError) {
        console.error('Error creating pending property:', pendingError)
        return NextResponse.json(
          { error: 'Failed to create pending property' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        status: 'signup_required',
        pendingPropertyToken: pendingProperty.verification_token,
        draftId: draft.id,
        message: 'Please create an account or login to publish your property'
      })
    }
    
    if (req.user.user_type !== 'landlord' && req.user.user_type !== 'admin') {
      // Convert user to landlord and continue with publication
      await supabase
        .from('user_profiles')
        .update({ user_type: 'landlord' })
        .eq('user_id', req.user.id)
      
      // Update the user object for the rest of the request
      req.user.user_type = 'landlord'
    }
    
    // Prepare property data
    const step1Data = draft.step_1_data
    const step2Data = draft.step_2_data
    const step3Data = draft.step_3_data
    const step4Data = draft.step_4_data || {}
    
    const propertyData = {
      landlord_id: req.user.id,
      
      // Step 1 data
      property_type: step1Data.propertyType,
      bedrooms: step1Data.bedrooms,
      bathrooms: step1Data.bathrooms,
      monthly_rent: Math.round(parseFloat(step1Data.monthlyRent) * 100), // Convert to pence
      security_deposit: Math.round(parseFloat(step1Data.securityDeposit) * 100), // Convert to pence
      available_date: step1Data.availableDate,
      description: step1Data.description,
      amenities: step1Data.amenities || [],
      
      // Step 2 data
      address: step2Data.address,
      city: step2Data.city,
      county: step2Data.state,
      postcode: step2Data.postcode,
      
      // Step 3 data
      photos: step3Data.photos || [],
      
      // Contact info (step 4 or provided)
      contact_name: contactInfo?.contactName || step4Data.contactName || req.user.email,
      contact_email: contactInfo?.contactEmail || step4Data.contactEmail || req.user.email,
      contact_phone: contactInfo?.contactPhone || step4Data.contactPhone,
      
      // Metadata
      status: 'active' as const,
      published_at: new Date().toISOString()
    }
    
    // Insert property using secure method
    try {
      const property = await secureCreateProperty(propertyData, req.user.id, req.user.user_type)
      
      // Delete the draft after successful publication
      await supabase
        .from('property_drafts')
        .delete()
        .eq('id', draft.id)
      
      return NextResponse.json({
        success: true,
        property,
        message: 'Property published successfully'
      })
    } catch (propertyError) {
      console.error('Error creating property:', propertyError)
      return NextResponse.json(
        { error: 'Failed to publish property' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in property publish:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}