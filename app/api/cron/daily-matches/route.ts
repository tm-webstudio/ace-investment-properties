import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import React from 'react'
import { extractPreferences, calculateMatchScore } from '@/lib/propertyMatching'
import { formatPropertyForCard, formatPropertyTitle } from '@/lib/property-utils'
import { sendEmail } from '@/lib/email'
import PropertyMatches from '@/emails/investor/property-matches'

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aceinvestmentproperties.co.uk'

  // Fetch properties published in the last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: newProperties, error: propError } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .gte('published_at', since)

  if (propError) {
    console.error('Error fetching new properties:', propError)
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
  }

  if (!newProperties || newProperties.length === 0) {
    return NextResponse.json({ success: true, message: 'No new properties, skipping emails' })
  }

  console.log(`Found ${newProperties.length} new properties since ${since}`)

  // Fetch all active investor preferences with profile data
  const { data: investorPrefs, error: invError } = await supabase
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
        user_type
      )
    `)
    .eq('is_active', true)

  if (invError || !investorPrefs || investorPrefs.length === 0) {
    console.log('No active investor preferences found')
    return NextResponse.json({ success: true, message: 'No investors to notify' })
  }

  let emailsSent = 0
  let investorsEmailed = 0

  for (const inv of investorPrefs) {
    const profile = (inv as any).user_profiles
    if (!profile?.email) continue

    const extracted = extractPreferences(inv.preference_data)
    if (!extracted) continue

    // Score all new properties for this investor
    const matchedProperties = newProperties
      .map(property => {
        const { matchScore } = calculateMatchScore(extracted, property)
        return { property, matchScore }
      })
      .filter(item => item.matchScore >= 85)
      .sort((a, b) => b.matchScore - a.matchScore)
      .map(item => {
        const formatted = formatPropertyForCard(item.property)
        return {
          propertyType: item.property.property_type || 'Property',
          bedrooms: parseInt(item.property.bedrooms) || 0,
          bathrooms: parseInt(item.property.bathrooms) || 0,
          propertyAddress: formatPropertyTitle(item.property),
          propertyImage: item.property.photos?.[0] || '',
          propertyPrice: formatted.price?.toLocaleString() || '0',
          availability: item.property.availability || 'vacant',
          propertyLicence: item.property.property_licence || 'none',
          condition: item.property.property_condition || 'good',
          matchScore: item.matchScore,
          propertyUrl: `${siteUrl}/properties/${item.property.id}`,
        }
      })

    if (matchedProperties.length === 0) continue

    try {
      await sendEmail({
        to: profile.email,
        subject: `New property matches for you`,
        react: React.createElement(PropertyMatches, {
          investorName: profile.full_name || 'Investor',
          context: 'daily',
          properties: matchedProperties,
          dashboardLink: `${siteUrl}/investor/dashboard`,
          totalMatches: matchedProperties.length,
        })
      })
      emailsSent++
      investorsEmailed++
      console.log(`Sent digest to ${profile.email} with ${matchedProperties.length} matches`)
    } catch (emailError) {
      console.error(`Digest email failed for ${profile.email}:`, emailError)
    }
  }

  return NextResponse.json({
    success: true,
    newProperties: newProperties.length,
    investorsEmailed,
    emailsSent,
  })
}
