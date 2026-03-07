import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import React from 'react'
import { formatPropertyForCard, formatPropertyTitle } from '@/lib/property-utils'
import { sendEmail } from '@/lib/email'
import PropertyMatches from '@/emails/investor/property-matches'

// TEMPORARY test endpoint — remove after testing
export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(3)

  if (error || !properties?.length) {
    return NextResponse.json({ error: 'No properties found', details: error }, { status: 500 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aceinvestmentproperties.co.uk'

  const matchedProperties = properties.map((property, i) => {
    const formatted = formatPropertyForCard(property)
    return {
      propertyType: property.property_type || 'Property',
      bedrooms: parseInt(property.bedrooms) || 0,
      bathrooms: parseInt(property.bathrooms) || 0,
      propertyAddress: formatPropertyTitle(property),
      propertyImage: property.photos?.[0] || '',
      propertyPrice: formatted.price?.toLocaleString() || '0',
      availability: property.availability || 'vacant',
      propertyLicence: property.property_licence || 'none',
      condition: property.property_condition || 'good',
      matchScore: 95 - i * 5,
      propertyUrl: `${siteUrl}/properties/${property.id}`,
    }
  })

  const result = await sendEmail({
    to: 'tmwebstudio1@gmail.com',
    subject: 'Test: Properties Matching Your Criteria',
    react: React.createElement(PropertyMatches, {
      investorName: 'Tolu',
      context: 'daily',
      properties: matchedProperties,
      dashboardLink: `${siteUrl}/investor/dashboard`,
      totalMatches: matchedProperties.length,
    })
  })

  return NextResponse.json({ success: true, propertiesSent: matchedProperties.length, result })
}
