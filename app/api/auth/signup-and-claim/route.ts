import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Helper function to get admin client at runtime
function getSupabaseAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Helper function to get regular client at runtime
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Simplified validation for debugging
function validateSignupData(data: any) {
  const required = ['email', 'password', 'firstName', 'lastName', 'pendingPropertyToken', 'acceptedTerms']
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`${field} is required`)
    }
  }
  if (!data.acceptedTerms) {
    throw new Error('Terms must be accepted')
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get admin client at runtime
    const supabaseAdmin = getSupabaseAdmin()

    // Check if admin client is available
    if (!supabaseAdmin) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
      console.error('Environment check:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      })
      return NextResponse.json({
        error: 'Service temporarily unavailable - Missing server configuration. Please contact support.'
      }, { status: 503 })
    }

    console.log('Signup endpoint called')

    const body = await request.json()
    console.log('Request body:', { ...body, password: '[REDACTED]' })

    // Basic validation
    validateSignupData(body)

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      pendingPropertyToken,
      acceptedTerms
    } = body

    // Get regular client for auth
    const supabase = getSupabaseClient()

    // Validate pending property token first
    const { data: pendingProperty, error: pendingError } = await supabaseAdmin
      .from('pending_properties')
      .select('*')
      .eq('verification_token', pendingPropertyToken)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    console.log('Pending property lookup:', { found: !!pendingProperty, error: pendingError?.message })

    if (pendingError || !pendingProperty) {
      return NextResponse.json({ 
        error: 'Invalid or expired property token' 
      }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(user => user.email === email)
    
    if (existingUser) {
      return NextResponse.json({ 
        error: 'Account with this email already exists. Please use login instead.' 
      }, { status: 400 })
    }

    // Create new user account using admin client - no email confirmation required
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // This skips email confirmation
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone,
        user_type: 'landlord'
      }
    })

    console.log('User creation via admin:', { user: !!authData.user, error: authError?.message })

    if (authError || !authData.user) {
      return NextResponse.json({ 
        error: authError?.message || 'Failed to create account' 
      }, { status: 400 })
    }

    // Create user profile using admin client
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name: `${firstName} ${lastName}`,
        phone,
        user_type: 'landlord',
        email_verified: false,
        created_via: 'signup_and_claim'
      })

    console.log('Profile creation:', { error: profileError })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Continue even if profile creation fails
    }

    // Now sign in the user to get a session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    console.log('Sign in after creation:', { user: !!signInData?.user, session: !!signInData?.session, error: signInError?.message })

    if (signInError || !signInData.session) {
      return NextResponse.json({ 
        error: 'Account created but login failed. Please try logging in manually.' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      requiresAction: 'publish_property',
      user: {
        id: signInData.user.id,
        email: signInData.user.email,
        firstName,
        lastName,
        emailVerified: !!signInData.user.email_confirmed_at
      },
      session: {
        accessToken: signInData.session.access_token,
        refreshToken: signInData.session.refresh_token,
        expiresAt: new Date(signInData.session.expires_at! * 1000).toISOString()
      },
      pendingPropertyToken
    })

  } catch (error) {
    console.error('Error in signup-and-claim:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}