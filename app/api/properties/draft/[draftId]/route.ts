import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { optionalAuth, rateLimit, validatePropertyStep } from '@/lib/middleware'

export async function PUT(
  request: NextRequest,
  { params }: { params: { draftId: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(60000, 20)(request)
    if (rateLimitResult) return rateLimitResult

    const req = await optionalAuth(request)
    const body = await request.json()
    const { draftId } = params
    
    const { stepData, step } = body
    
    if (!stepData || !step) {
      return NextResponse.json(
        { error: 'Step data and step number are required' },
        { status: 400 }
      )
    }
    
    // Validate step data
    try {
      validatePropertyStep(step, stepData)
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    // Check if draft exists and user has permission
    let query = supabase.from('property_drafts').select('*').eq('id', draftId)
    
    if (req.user) {
      query = query.eq('user_id', req.user.id)
    } else {
      // For anonymous users, we need session_id in the request
      const { sessionId } = body
      if (!sessionId) {
        return NextResponse.json(
          { error: 'Session ID required for anonymous users' },
          { status: 400 }
        )
      }
      query = query.eq('session_id', sessionId)
    }
    
    const { data: existingDraft, error: fetchError } = await query.single()
    
    if (fetchError || !existingDraft) {
      return NextResponse.json(
        { error: 'Draft not found or access denied' },
        { status: 404 }
      )
    }
    
    const stepDataKey = `step_${step}_data`
    const updateData = {
      [stepDataKey]: stepData,
      current_step: Math.max(step, existingDraft.current_step || 1),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('property_drafts')
      .update(updateData)
      .eq('id', draftId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating draft:', error)
      return NextResponse.json(
        { error: 'Failed to update draft' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      draft: data
    })
  } catch (error) {
    console.error('Error in draft PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { draftId: string } }
) {
  try {
    const req = await optionalAuth(request)
    const { draftId } = params
    
    // Check if draft exists and user has permission
    let query = supabase.from('property_drafts').select('*').eq('id', draftId)
    
    if (req.user) {
      query = query.eq('user_id', req.user.id)
    } else {
      const { searchParams } = new URL(request.url)
      const sessionId = searchParams.get('sessionId')
      if (!sessionId) {
        return NextResponse.json(
          { error: 'Session ID required for anonymous users' },
          { status: 400 }
        )
      }
      query = query.eq('session_id', sessionId)
    }
    
    const { data: existingDraft, error: fetchError } = await query.single()
    
    if (fetchError || !existingDraft) {
      return NextResponse.json(
        { error: 'Draft not found or access denied' },
        { status: 404 }
      )
    }
    
    const { error } = await supabase
      .from('property_drafts')
      .delete()
      .eq('id', draftId)
    
    if (error) {
      console.error('Error deleting draft:', error)
      return NextResponse.json(
        { error: 'Failed to delete draft' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully'
    })
  } catch (error) {
    console.error('Error in draft DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}