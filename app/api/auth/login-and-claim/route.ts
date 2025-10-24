import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client for database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Create regular client for auth operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Simple validation
function validateLoginData(data: any) {
  if (!data.email || !data.password || !data.pendingPropertyToken) {
    throw new Error('Email, password, and property token are required')
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Login endpoint called')
    
    const body = await request.json()
    console.log('Login request body:', { ...body, password: '[REDACTED]' })

    // Basic validation
    validateLoginData(body)

    const { email, password, pendingPropertyToken } = body

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

    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    console.log('Login result:', { user: !!authData?.user, session: !!authData?.session, error: authError?.message })

    if (authError || !authData.user || !authData.session) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 })
    }

    // Check if user has a profile, if not create one
    const { data: existingProfile, error: profileLookupError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    console.log('Profile lookup:', { found: !!existingProfile, error: profileLookupError?.message })

    let userProfile = existingProfile
    if (!existingProfile) {
      // Create basic profile
      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          full_name: `${authData.user.user_metadata?.first_name || ''} ${authData.user.user_metadata?.last_name || ''}`.trim() || authData.user.email!,
          phone: authData.user.user_metadata?.phone,
          user_type: 'landlord',
          email_verified: !!authData.user.email_confirmed_at,
          created_via: 'login_and_claim'
        })
        .select()
        .single()

      console.log('Profile creation:', { created: !!newProfile, error: profileError })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Continue without profile for now
      } else {
        userProfile = newProfile
      }
    } else if (existingProfile.user_type !== 'landlord') {
      // Convert existing user to landlord
      const { data: updatedProfile } = await supabaseAdmin
        .from('user_profiles')
        .update({ user_type: 'landlord' })
        .eq('id', authData.user.id)
        .select()
        .single()
      userProfile = updatedProfile || existingProfile
    }

    // Return authentication data immediately - user is now logged in
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      requiresAction: 'publish_property',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName: userProfile?.full_name?.split(' ')[0] || authData.user.user_metadata?.first_name || '',
        lastName: userProfile?.full_name?.split(' ').slice(1).join(' ') || authData.user.user_metadata?.last_name || '',
        emailVerified: !!authData.user.email_confirmed_at
      },
      session: {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        expiresAt: new Date(authData.session.expires_at! * 1000).toISOString()
      },
      pendingPropertyToken
    })

  } catch (error) {
    console.error('Error in login-and-claim:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}