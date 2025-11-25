import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/middleware'
import { sendEmail } from '@/lib/email'
import Welcome from '@/emails/Welcome'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting - 5 signup attempts per hour
    const rateLimitResult = rateLimit(3600000, 5)(request)
    if (rateLimitResult) return rateLimitResult

    const body = await request.json()
    const { email, password, first_name, last_name, user_type = 'investor', preferences } = body

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

    // Save investor preferences if provided
    if (user_type === 'investor' && preferences) {
      try {
        // Validate preferences for investors
        const { operator_type, preference_data } = preferences
        
        if (!operator_type || !preference_data) {
          console.error('Invalid preferences data for investor')
        } else {
          const preferencesData = {
            investor_id: authData.user.id,
            operator_type: preferences.operator_type,
            operator_type_other: preferences.operator_type === 'other' ? preferences.operator_type_other : null,
            properties_managing: preferences.properties_managing || 0,
            preference_data: preferences.preference_data,
            notification_enabled: true,
            is_active: true,
            updated_at: new Date().toISOString()
          }

          const { error: preferencesError } = await supabase
            .from('investor_preferences')
            .insert(preferencesData)

          if (preferencesError) {
            console.error('Preferences creation error:', preferencesError)
            // Don't fail the signup if preferences fail to save, user can set them later
          }
        }
      } catch (prefError) {
        console.error('Error processing preferences:', prefError)
        // Don't fail the signup if preferences processing fails
      }
    }

    // Count matching properties for investors with preferences
    let matchedProperties = 0
    if (user_type === 'investor' && preferences) {
      try {
        // This is a simplified matching algorithm
        // In a real app, you'd implement more sophisticated matching
        const { data: properties } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')

        if (properties) {
          matchedProperties = properties.length // Simplified count
        }
      } catch (matchError) {
        console.error('Error counting matched properties:', matchError)
        // Don't fail signup if matching fails
      }
    }

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to Ace Properties!',
        react: Welcome({
          name: first_name,
          userType: user_type === 'investor' ? 'Investor' : 'Landlord',
          dashboardLink: user_type === 'investor'
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`
            : `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/dashboard`,
          profileLink: user_type === 'investor'
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/investor/profile`
            : `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/profile`,
          helpLink: `${process.env.NEXT_PUBLIC_SITE_URL}/help`
        })
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail signup if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email for verification.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        user_type: user_type
      },
      matchedProperties: user_type === 'investor' ? matchedProperties : undefined
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