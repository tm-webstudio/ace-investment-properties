import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import React from 'react'
import { getInvestorMatches } from '@/lib/propertyMatching'
import { formatPropertyForCard, formatPropertyTitle } from '@/lib/property-utils'
import { sendEmail } from '@/lib/email'
import NewPropertyMatch from '@/emails/investor/new-property-match'

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

// Create regular client for auth verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Service temporarily unavailable' 
      }, { status: 503 })
    }

    const body = await request.json()
    const { propertyId, action } = body // action: 'approve' or 'reject'
    
    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profileError || userProfile?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    if (!propertyId || !action) {
      return NextResponse.json(
        { error: 'Property ID and action are required' },
        { status: 400 }
      )
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Action must be approve or reject' },
        { status: 400 }
      )
    }

    // Update property status
    const newStatus = action === 'approve' ? 'active' : 'rejected'
    const updateData: any = {
      status: newStatus
    }

    // Set published_at timestamp when approving
    if (action === 'approve') {
      updateData.published_at = new Date().toISOString()
    }

    const { data: updatedProperty, error: updateError } = await supabaseAdmin
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .select()
      .single()

    if (updateError || !updatedProperty) {
      console.error('Update error:', updateError)
      console.error('Property ID:', propertyId)
      console.error('Update data:', updateData)
      return NextResponse.json(
        { error: 'Failed to update property status', details: updateError?.message || 'No property found' },
        { status: 500 }
      )
    }

    // Send match emails to investors when a property is approved (non-blocking)
    if (action === 'approve') {
      try {
        const matches = await getInvestorMatches(propertyId, { minScore: 60 })
        if (matches.length > 0) {
          const formatted = formatPropertyForCard(updatedProperty)
          const title = formatPropertyTitle(updatedProperty)
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aceinvestmentproperties.co.uk'

          for (const investor of matches) {
            if (!investor.email) continue
            try {
              await sendEmail({
                to: investor.email,
                subject: `New ${investor.match_score}% Match: ${title}`,
                react: React.createElement(NewPropertyMatch, {
                  propertyType: updatedProperty.property_type || 'Property',
                  bedrooms: parseInt(updatedProperty.bedrooms) || 0,
                  bathrooms: parseInt(updatedProperty.bathrooms) || 0,
                  propertyAddress: title,
                  propertyImage: updatedProperty.photos?.[0] || '',
                  propertyPrice: formatted.price?.toLocaleString() || '0',
                  availability: updatedProperty.availability || 'vacant',
                  propertyLicence: updatedProperty.property_licence || 'none',
                  condition: updatedProperty.property_condition || 'good',
                  matchScore: investor.match_score,
                  matchBreakdown: investor.match_breakdown,
                  propertyUrl: `${siteUrl}/properties/${updatedProperty.id}`,
                  dashboardLink: `${siteUrl}/investor/dashboard`,
                })
              })
            } catch (emailError) {
              console.error(`Match email failed for investor ${investor.id}:`, emailError)
            }
          }
        }
      } catch (matchError) {
        console.error('Match notifications failed:', matchError)
      }
    }

    return NextResponse.json({
      success: true,
      property: updatedProperty,
      message: `Property ${action}d successfully`
    })

  } catch (error) {
    console.error('Error in property approval:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}