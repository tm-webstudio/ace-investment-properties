import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth, rateLimit } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(300000, 3)(request) // 3 conversions per 5 minutes
    if (rateLimitResult) return rateLimitResult

    const result = await requireAuth(request)
    if (result instanceof NextResponse) return result
    
    const req = result
    const body = await request.json()
    
    const { companyName, phone, draftId } = body
    
    // Check if user is already a landlord
    if (req.user!.user_type === 'landlord') {
      return NextResponse.json(
        { error: 'User is already a landlord' },
        { status: 400 }
      )
    }
    
    // Update user profile to landlord
    const updateData: any = {
      user_type: 'landlord',
      updated_at: new Date().toISOString()
    }
    
    if (companyName) {
      updateData.company_name = companyName
    }
    
    if (phone) {
      updateData.phone = phone
    }
    
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', req.user!.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating user profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to convert to landlord account' },
        { status: 500 }
      )
    }
    
    // If there's a draft ID, transfer ownership from session to user
    if (draftId) {
      const { error: draftError } = await supabase
        .from('property_drafts')
        .update({
          user_id: req.user!.id,
          session_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId)
        .is('user_id', null) // Only update if it doesn't already have a user_id
      
      if (draftError) {
        console.error('Error transferring draft ownership:', draftError)
        // Don't fail the conversion, just log the error
      }
    }
    
    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Successfully converted to landlord account'
    })
  } catch (error) {
    console.error('Error in convert-to-landlord:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}