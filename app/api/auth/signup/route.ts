import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting - 5 signup attempts per hour
    const rateLimitResult = rateLimit(3600000, 5)(request)
    if (rateLimitResult) return rateLimitResult

    const body = await request.json()
    const { email, password, first_name, last_name, user_type = 'investor' } = body

    // Validate input
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json(
        { success: false, error: { message: 'All fields are required' } },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: { message: 'Password must be at least 8 characters long' } },
        { status: 400 }
      )
    }

    if (!['investor', 'landlord', 'admin'].includes(user_type)) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid user type' } },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          user_type
        }
      }
    })

    if (authError) {
      console.error('Supabase auth signup error:', authError)
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: authError.message || 'Failed to create account'
          } 
        },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to create user account' } },
        { status: 500 }
      )
    }

    // Create user profile in database
    const full_name = `${first_name} ${last_name}`.trim()
    
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: full_name,
        user_type: user_type
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Note: User was created in Auth but profile creation failed
      // In a production app, you might want to clean up the auth user
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: 'Account created but profile setup failed. Please contact support.'
          } 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email for verification.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        user_type: user_type
      }
    })

  } catch (error: any) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Internal server error. Please try again later.'
        } 
      },
      { status: 500 }
    )
  }
}