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
    
    if (!draftId && !sessionId) {
      return NextResponse.json(
        { error: 'Draft ID or session ID is required' },
        { status: 400 }
      )
    }
    
    // Fetch the draft
    let query = supabase.from('property_drafts').select('*')
    
    if (draftId) {
      query = query.eq('id', draftId)
    } else {
      query = query.eq('session_id', sessionId)
    }
    
    if (req.user) {
      query = query.eq('user_id', req.user.id)
    }
    
    const { data: draft, error: draftError } = await query.single()
    
    if (draftError || !draft) {
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
    
    // Check if user is logged in and is a landlord
    if (!req.user) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          requiresSignup: true,
          draftId: draft.id,
          message: 'Please sign up or log in as a landlord to publish your property'
        },
        { status: 401 }
      )
    }
    
    if (req.user.user_type !== 'landlord' && req.user.user_type !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Landlord access required',
          requiresConversion: true,
          message: 'Please convert your account to a landlord account to publish properties'
        },
        { status: 403 }
      )
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