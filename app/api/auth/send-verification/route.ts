import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

export async function POST(request: NextRequest) {
  try {
    // Check if admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Service temporarily unavailable' 
      }, { status: 503 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (userProfile.email_verified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    // Generate verification token (simple base64 encoding for demo)
    const verificationToken = Buffer.from(userId).toString('base64')
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/verify-email/${verificationToken}`

    // In a real application, you would send an email here
    // For now, we'll just log the verification URL
    console.log(`Email verification URL for ${userProfile.email}: ${verificationUrl}`)

    // TODO: Send actual email using your preferred email service
    // Example with a hypothetical email service:
    /*
    await emailService.send({
      to: userProfile.email,
      subject: 'Verify Your Email Address',
      html: `
        <h1>Verify Your Email Address</h1>
        <p>Hello ${userProfile.full_name},</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `
    })
    */

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
      // For development purposes, include the verification URL
      ...(process.env.NODE_ENV === 'development' && { verificationUrl })
    })

  } catch (error) {
    console.error('Error sending verification email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}