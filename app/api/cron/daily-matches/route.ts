import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractPreferences, calculateMatchScore } from '@/lib/propertyMatching'
import { formatPropertyForCard, formatPropertyTitle } from '@/lib/property-utils'
import { sendEmail } from '@/lib/email'
import PropertyMatches from '@/emails/investor/property-matches'
import React from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch properties created in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: newProperties, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .gte('created_at', oneDayAgo)

    if (propError || !newProperties || newProperties.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new properties in the last 24 hours',
        propertiesChecked: 0,
        emailsSent: 0
      })
    }

    // Fetch all active investors with preferences
    const { data: investors, error: invError } = await supabase
      .from('investor_preferences')
      .select(`
        id,
        investor_id,
        preference_data,
        is_active,
        user_profiles!inner (
          id,
          full_name,
          email,
          notification_enabled
        )
      `)
      .eq('is_active', true)

    if (invError || !investors) {
      return NextResponse.json({
        success: true,
        message: 'No active investors found',
        propertiesChecked: newProperties.length,
        emailsSent: 0
      })
    }

    let emailsSent = 0

    for (const investor of investors) {
      const profile = investor.user_profiles as any
      if (!profile?.email || profile.notification_enabled === false) continue

      const extracted = extractPreferences(investor.preference_data)
      if (!extracted) continue

      // Score new properties against this investor
      const matches = newProperties
        .map(property => {
          const { matchScore, matchBreakdown } = calculateMatchScore(extracted, property)
          return { property, matchScore, matchBreakdown }
        })
        .filter(m => m.matchScore >= 85)
        .sort((a, b) => b.matchScore - a.matchScore)

      if (matches.length === 0) continue

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aceinvestmentproperties.co.uk'
      const topMatches = matches.slice(0, 5)

      const propertyItems = topMatches.map(m => {
        const formatted = formatPropertyForCard(m.property)
        const title = formatPropertyTitle(m.property)
        return {
          propertyType: m.property.property_type || 'Property',
          bedrooms: parseInt(m.property.bedrooms) || 0,
          bathrooms: parseInt(m.property.bathrooms) || 0,
          propertyAddress: title,
          propertyImage: m.property.photos?.[0] || '',
          propertyPrice: formatted.price?.toLocaleString() || '0',
          availability: m.property.availability || 'vacant',
          propertyLicence: m.property.property_licence || 'none',
          condition: m.property.property_condition || 'good',
          matchScore: m.matchScore,
          propertyUrl: `${siteUrl}/properties/${m.property.id}`,
        }
      })

      const count = propertyItems.length
      const subject = count === 1
        ? '1 New Property Match'
        : `${count} New Property Matches`

      await sendEmail({
        to: profile.email,
        subject,
        react: React.createElement(PropertyMatches, {
          investorName: profile.full_name || profile.email,
          context: 'new-matches',
          properties: propertyItems,
          dashboardLink: `${siteUrl}/investor/dashboard`,
          totalMatches: count,
        })
      })

      emailsSent++
    }

    return NextResponse.json({
      success: true,
      propertiesChecked: newProperties.length,
      investorsChecked: investors.length,
      emailsSent
    })

  } catch (error: any) {
    console.error('Daily matches cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
