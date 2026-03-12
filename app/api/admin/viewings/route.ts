import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'
import ViewingRequest from '@/emails/landlord/viewing-request'
import ViewingConfirmation from '@/emails/investor/viewing-confirmation'
import { formatPropertyAddress, formatPropertyTitle } from '@/lib/emailHelpers'
import * as React from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Helper: verify admin and return user, or return error response
async function verifyAdmin(request: NextRequest, supabase: ReturnType<typeof createClient>) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) }
  }

  const token = authHeader.substring(7)
  const { data: { user }, error: userError } = await supabase.auth.getUser(token)

  if (userError || !user) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'admin') {
    return { error: NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 }) }
  }

  return { user }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const auth = await verifyAdmin(request, supabase)
    if ('error' in auth) return auth.error

    const searchParams = request.nextUrl.searchParams

    // If action=create-options, return lightweight property + investor lists
    if (searchParams.get('action') === 'create-options') {
      const [propertiesRes, investorsRes] = await Promise.all([
        supabase
          .from('properties')
          .select('id, address, city, postcode')
          .eq('status', 'active')
          .order('city', { ascending: true }),
        supabase
          .from('user_profiles')
          .select('id, full_name, company_name, email')
          .eq('user_type', 'investor')
          .order('full_name', { ascending: true })
      ])

      if (propertiesRes.error) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch properties' },
          { status: 500 }
        )
      }

      if (investorsRes.error) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch investors' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        properties: propertiesRes.data,
        investors: investorsRes.data
      })
    }

    // Default: list viewings
    const status = searchParams.get('status') // 'pending', 'approved', 'rejected', 'cancelled', 'all'
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : 50

    // Build query - fetch property_viewings first
    let query = supabase
      .from('property_viewings')
      .select('*')
      .order('viewing_date', { ascending: false })
      .order('viewing_time', { ascending: false })
      .limit(limit)

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: viewingRequests, error } = await query

    if (error) {
      console.error('Error fetching property_viewings:', error)
      return NextResponse.json(
        { success: false, error: `Failed to fetch viewings: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('Fetched property viewings:', viewingRequests?.length || 0)

    // Fetch property, user, and landlord details separately for each viewing
    const viewings = await Promise.all(
      (viewingRequests || []).map(async (viewing) => {
        let property = null
        let user_profile = null
        let landlord_profile = null

        // Get property details
        if (viewing.property_id) {
          const { data: propertyData } = await supabase
            .from('properties')
            .select('id, property_type, address, city, postcode, monthly_rent, photos, landlord_id')
            .eq('id', viewing.property_id)
            .single()

          if (propertyData) {
            property = propertyData

            // Get landlord profile details
            if (propertyData.landlord_id) {
              const { data: landlordData } = await supabase
                .from('user_profiles')
                .select('full_name, email, phone')
                .eq('id', propertyData.landlord_id)
                .single()

              if (landlordData) {
                landlord_profile = landlordData
              }
            }
          }
        }

        // Get user profile details (investor)
        if (viewing.user_id) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('full_name, email, phone')
            .eq('id', viewing.user_id)
            .single()

          if (profileData) {
            user_profile = profileData
          }
        }

        return {
          ...viewing,
          property,
          user_profile,
          landlord_profile
        }
      })
    )

    // Calculate stats
    const { data: allViewings } = await supabase
      .from('property_viewings')
      .select('status')

    const stats = {
      pending: allViewings?.filter(v => v.status === 'pending').length || 0,
      approved: allViewings?.filter(v => v.status === 'approved').length || 0,
      rejected: allViewings?.filter(v => v.status === 'rejected').length || 0,
      cancelled: allViewings?.filter(v => v.status === 'cancelled').length || 0,
      completed: allViewings?.filter(v => v.status === 'completed').length || 0
    }

    return NextResponse.json({
      success: true,
      viewings: viewings || [],
      summary: stats,
      count: viewings?.length || 0
    })

  } catch (error) {
    console.error('Error in admin viewings API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const auth = await verifyAdmin(request, supabase)
    if ('error' in auth) return auth.error

    // Parse and validate body
    const body = await request.json()
    const { propertyId, investorId, viewingDate, viewingTime, message } = body

    if (!propertyId || !investorId || !viewingDate || !viewingTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: propertyId, investorId, viewingDate, viewingTime' },
        { status: 400 }
      )
    }

    // Validate business hours (9 AM - 6 PM)
    const [hours] = viewingTime.split(':').map(Number)
    if (hours < 9 || hours >= 18) {
      return NextResponse.json(
        { success: false, error: 'Viewing time must be between 9 AM and 6 PM' },
        { status: 400 }
      )
    }

    // Validate future date (tomorrow to +60 days)
    const viewDate = new Date(viewingDate)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 60)

    if (viewDate < tomorrow || viewDate > maxDate) {
      return NextResponse.json(
        { success: false, error: 'Viewing date must be between tomorrow and 60 days from now' },
        { status: 400 }
      )
    }

    // Look up investor profile
    const { data: investorProfile, error: investorError } = await supabase
      .from('user_profiles')
      .select('full_name, email, phone')
      .eq('id', investorId)
      .single()

    if (investorError || !investorProfile) {
      return NextResponse.json(
        { success: false, error: 'Investor not found' },
        { status: 404 }
      )
    }

    // Get investor email from auth
    const { data: investorAuth } = await supabase.auth.admin.getUserById(investorId)
    const investorEmail = investorAuth?.user?.email || investorProfile.email || ''

    // Look up property and validate
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, landlord_id, status, address, city, postcode, property_type, bedrooms, bathrooms, monthly_rent, availability, property_licence, property_condition, photos, ref_number')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      )
    }

    if (property.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Property is not active' },
        { status: 400 }
      )
    }

    // Check for duplicate active viewing (same investor + property with pending/approved)
    const { data: existingViewing } = await supabase
      .from('property_viewings')
      .select('id, status')
      .eq('user_id', investorId)
      .eq('property_id', propertyId)
      .in('status', ['pending', 'approved'])
      .maybeSingle()

    if (existingViewing) {
      return NextResponse.json(
        { success: false, error: `This investor already has an active viewing (${existingViewing.status}) for this property` },
        { status: 409 }
      )
    }

    // Check time slot not already booked
    const { data: conflictingViewing } = await supabase
      .from('property_viewings')
      .select('id')
      .eq('property_id', propertyId)
      .eq('viewing_date', viewingDate)
      .eq('viewing_time', viewingTime)
      .in('status', ['pending', 'approved'])
      .maybeSingle()

    if (conflictingViewing) {
      return NextResponse.json(
        { success: false, error: 'This time slot is already booked' },
        { status: 409 }
      )
    }

    // Insert viewing with approved status (admin-created = auto-approved)
    const { data: viewing, error: insertError } = await supabase
      .from('property_viewings')
      .insert({
        property_id: propertyId,
        user_id: investorId,
        landlord_id: property.landlord_id,
        viewing_date: viewingDate,
        viewing_time: viewingTime,
        user_name: investorProfile.full_name || 'Investor',
        user_email: investorEmail,
        user_phone: investorProfile.phone || '',
        message: message || null,
        status: 'approved'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating viewing:', insertError)
      return NextResponse.json(
        { success: false, error: `Failed to create viewing: ${insertError.message}` },
        { status: 500 }
      )
    }

    // Send notifications
    try {
      // Get landlord profile
      const { data: landlordProfile } = await supabase
        .from('user_profiles')
        .select('full_name, email, phone')
        .eq('id', property.landlord_id)
        .single()

      const { data: landlordAuth } = await supabase.auth.admin.getUserById(property.landlord_id)
      const landlordEmail = landlordAuth?.user?.email || landlordProfile?.email || ''

      const monthlyRentPounds = property.monthly_rent
        ? Math.round(property.monthly_rent / 100).toLocaleString()
        : '0'
      const propertyImage = Array.isArray(property.photos) && property.photos.length > 0
        ? property.photos[0]
        : ''
      const propertyTitle = formatPropertyTitle(property)

      // Send landlord notification (ViewingRequest template)
      if (landlordEmail) {
        await sendEmail({
          to: landlordEmail,
          subject: `New Viewing Booked - ${propertyTitle}`,
          react: ViewingRequest({
            propertyTitle,
            propertyAddress: formatPropertyAddress(property),
            propertyType: property.property_type || 'property',
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            propertyPrice: monthlyRentPounds,
            availability: property.availability || 'unknown',
            propertyLicence: property.property_licence || 'none',
            condition: property.property_condition || 'good',
            propertyImage,
            viewingDate,
            viewingTime,
            message: message || '',
            approveLink: `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/viewings/${viewing.id}/approve`,
            declineLink: `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/viewings/${viewing.id}/decline`,
          })
        })
      }

      // Send investor confirmation (ViewingConfirmation template)
      if (investorEmail) {
        await sendEmail({
          to: investorEmail,
          subject: `Viewing Confirmed - ${propertyTitle}`,
          react: ViewingConfirmation({
            propertyTitle,
            propertyAddress: formatPropertyAddress(property),
            propertyType: property.property_type || 'property',
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            propertyPrice: monthlyRentPounds,
            availability: property.availability || 'unknown',
            propertyLicence: property.property_licence || 'none',
            condition: property.property_condition || 'good',
            propertyImage,
            viewingDate,
            viewingTime,
            dashboardLink: `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`,
          })
        })
      }
    } catch (emailError) {
      console.error('Failed to send viewing notification emails:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      viewing,
      message: 'Viewing created successfully'
    })

  } catch (error) {
    console.error('Error in admin create viewing API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
