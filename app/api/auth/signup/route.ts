import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as React from 'react'
import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/middleware'
import { signUpWithEmail } from '@/lib/authHelpers'
import { sendLandlordSignupToGHL, sendInvestorSignupToGHL } from '@/lib/ghl'
import { sendEmail } from '@/lib/email'
import NewInvestor from '@/emails/admin/new-investor'
import { getMatchedProperties } from '@/lib/propertyMatching'
import { normalizePhoneToE164 } from '@/lib/phoneUtils'

// Create admin client for database operations
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
    // Apply rate limiting - 5 signup attempts per hour
    const rateLimitResult = rateLimit(3600000, 5)(request)
    if (rateLimitResult) return rateLimitResult

    const body = await request.json()
    const { email, password, company_name, first_name, last_name, phone_number, user_type = 'investor', preferences } = body

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

    // Create user in Supabase Auth and send welcome + confirmation emails via Resend
    const { data: authData, error: authError } = await signUpWithEmail({
      email,
      password,
      firstName: first_name,
      lastName: last_name,
      userType: user_type === 'investor' ? 'Investor' : 'Landlord',
      skipEmailConfirmation: user_type === 'investor'
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

    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: full_name,
        company_name: company_name || null,
        phone: phone_number,
        user_type: user_type,
        email_verified: false
      })
      .select('ref_number')
      .single()

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

    // Send landlord signup to GoHighLevel (non-blocking)
    if (user_type === 'landlord') {
      try {
        await sendLandlordSignupToGHL({
          firstName: first_name,
          lastName: last_name,
          email,
          phone: phone_number || ''
        })
      } catch (ghlError) {
        console.error('GHL landlord signup sync failed:', ghlError)
      }
    }

    // Send investor signup to GoHighLevel (non-blocking)
    if (user_type === 'investor') {
      try {
        await sendInvestorSignupToGHL({
          firstName: first_name,
          lastName: last_name,
          email,
          phone: phone_number || '',
          companyName: company_name || '',
          preferences
        })
      } catch (ghlError) {
        console.error('GHL investor signup sync failed:', ghlError)
      }
    }

    // Send admin notification for new investor (non-blocking)
    if (user_type === 'investor') {
      try {
        const pref = preferences?.preference_data || {}
        const locationNames = (pref.locations || [])
          .map((loc: any) => loc.city || '')
          .filter(Boolean)

        await sendEmail({
          to: process.env.ADMIN_EMAIL || 'tmwebstudio1@gmail.com',
          subject: `New Investor Registered – Investor #${profileData?.ref_number || '?'}`,
          react: React.createElement(NewInvestor, {
            investorName: full_name,
            investorEmail: email,
            investorPhone: phone_number || '—',
            operatorType: preferences?.operator_type || '—',
            budgetMin: pref.budgetMin || 0,
            budgetMax: pref.budgetMax || 0,
            budgetType: pref.budgetType || 'monthly',
            bedroomsMin: pref.bedroomsMin || 0,
            bedroomsMax: pref.bedroomsMax || 0,
            propertyTypes: pref.propertyTypes || [],
            propertyLicences: pref.propertyLicences || [],
            locations: locationNames,
            propertiesManaging: preferences?.properties_managing || 0,
            dashboardLink: `${process.env.NEXT_PUBLIC_SITE_URL}/admin`
          })
        })
      } catch (adminEmailError) {
        console.error('Failed to send admin new investor email:', adminEmailError)
      }
    }

    // Save investor preferences if provided
    if (user_type === 'investor' && preferences) {
      try {
        // Check if admin client is available
        if (!supabaseAdmin) {
          console.error('Admin client not available for preferences creation')
        } else {
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

            const { error: preferencesError } = await supabaseAdmin
              .from('investor_preferences')
              .insert(preferencesData)

            if (preferencesError) {
              console.error('Preferences creation error:', preferencesError)
              // Don't fail the signup if preferences fail to save, user can set them later
            }
          }
        }
      } catch (prefError) {
        console.error('Error processing preferences:', prefError)
        // Don't fail the signup if preferences processing fails
      }
    }

    // Get matched properties for investors and fire webhook
    let matchedPropertyCount = 0
    if (user_type === 'investor' && preferences) {
      try {
        const matchResult = await getMatchedProperties(authData.user.id, { minScore: 60, limit: 200 })
        matchedPropertyCount = matchResult.total

        // Sort by listed_date descending (most recent first)
        const sortedProperties = matchResult.properties.sort(
          (a: any, b: any) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
        )

        // Fire n8n investor-approved webhook (non-blocking)
        if (process.env.N8N_INVESTOR_WEBHOOK_URL) {
          const propertiesManagingLabels: Record<number, string> = {
            0: '0 - Just starting', 1: '1-5', 6: '6-20', 21: '21-50', 51: '51+'
          }

          try {
            const webhookRes = await fetch(process.env.N8N_INVESTOR_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                investor_id: authData.user.id,
                full_name: full_name,
                email: email,
                phone: normalizePhoneToE164(phone_number || ''),
                company_name: company_name || null,
                investor_type: 'investor',
                operator_type: preferences.operator_type || '',
                properties_managing: propertiesManagingLabels[preferences.properties_managing] || String(preferences.properties_managing || 0),
                preference_data: preferences.preference_data,
                matched_properties: sortedProperties.map((p: any) => ({
                  property_id: p.id,
                  property_url: `https://www.aceinvestmentproperties.co.uk/properties/${p.id}`,
                  address: p.address,
                  postcode: p.postcode,
                  bedrooms: p.bedrooms,
                  monthly_rent: p.monthly_rent,
                  property_type: p.property_type,
                  listed_date: p.published_at,
                  match_score: p.matchScore,
                  match_breakdown: p.matchBreakdown,
                })),
              }),
            })
            if (webhookRes.ok) {
              console.log('Investor webhook fired successfully for:', authData.user!.id)
            } else {
              console.error('Investor webhook error:', webhookRes.status, 'for:', authData.user!.id)
            }
          } catch (webhookErr) {
            console.error('Investor webhook failed for:', authData.user!.id, webhookErr)
          }
        }
      } catch (matchError) {
        console.error('Error matching properties for investor:', matchError)
        // Don't fail signup if matching fails
      }
    }

    // Welcome and confirmation emails are sent by signUpWithEmail helper

    return NextResponse.json({
      success: true,
      message: user_type === 'investor'
        ? 'Account created successfully!'
        : 'Account created successfully! Please check your email for verification.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        user_type: user_type
      },
      matchedProperties: user_type === 'investor' ? matchedPropertyCount : undefined
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