import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { draftId, sessionId, propertyData, emailForClaim } = body

    // Validate required fields
    if (!propertyData) {
      return NextResponse.json({ error: 'Property data is required' }, { status: 400 })
    }

    // Create pending property
    const { data: pendingProperty, error } = await supabase
      .from('pending_properties')
      .insert({
        draft_id: draftId,
        property_data: propertyData,
        session_id: sessionId,
        email_for_claim: emailForClaim,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating pending property:', error)
      return NextResponse.json({ error: 'Failed to create pending property' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      pendingPropertyId: pendingProperty.id,
      verificationToken: pendingProperty.verification_token,
      expiresAt: pendingProperty.expires_at
    })

  } catch (error) {
    console.error('Error in pending property creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}