import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { optionalAuth, rateLimit, validatePropertyStep, generateSessionId } from '@/lib/middleware'
import { secureCreateDraft, secureUpdateDraft } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(60000, 20)(request)
    if (rateLimitResult) return rateLimitResult

    const req = await optionalAuth(request)
    const body = await request.json()
    
    const { stepData, step, sessionId } = body
    
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
    
    // Generate session ID for anonymous users
    const currentSessionId = sessionId || generateSessionId()
    
    // Check if draft already exists
    let existingDraft
    if (req.user) {
      // For logged-in users
      const { data } = await supabase
        .from('property_drafts')
        .select('*')
        .eq('user_id', req.user.id)
        .maybeSingle()
      existingDraft = data
    } else {
      // For anonymous users
      const { data } = await supabase
        .from('property_drafts')
        .select('*')
        .eq('session_id', currentSessionId)
        .maybeSingle()
      existingDraft = data
    }
    
    const stepDataKey = `step_${step}_data`
    const updateData: any = {
      [stepDataKey]: stepData,
      current_step: Math.max(step, existingDraft?.current_step || 1),
      updated_at: new Date().toISOString()
    }
    
    if (existingDraft) {
      // Update existing draft
      const { data, error } = await supabase
        .from('property_drafts')
        .update(updateData)
        .eq('id', existingDraft.id)
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
        draft: data,
        sessionId: currentSessionId
      })
    } else {
      // Create new draft
      const insertData = {
        ...updateData,
        ...(req.user ? { user_id: req.user.id } : { session_id: currentSessionId })
      }
      
      const { data, error } = await supabase
        .from('property_drafts')
        .insert(insertData)
        .select()
        .single()
      
      if (error) {
        console.error('Error creating draft:', error)
        return NextResponse.json(
          { error: 'Failed to create draft' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        draft: data,
        sessionId: currentSessionId
      })
    }
  } catch (error) {
    console.error('Error in draft POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const req = await optionalAuth(request)
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!req.user && !sessionId) {
      return NextResponse.json(
        { error: 'Session ID required for anonymous users' },
        { status: 400 }
      )
    }
    
    let query = supabase.from('property_drafts').select('*')
    
    if (req.user) {
      query = query.eq('user_id', req.user.id)
    } else {
      query = query.eq('session_id', sessionId)
    }
    
    const { data, error } = await query.maybeSingle()
    
    if (error) {
      console.error('Error fetching draft:', error)
      return NextResponse.json(
        { error: 'Failed to fetch draft' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      draft: data
    })
  } catch (error) {
    console.error('Error in draft GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}