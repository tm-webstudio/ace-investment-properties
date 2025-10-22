import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Fetch pending property by verification token
    const { data: pendingProperty, error } = await supabase
      .from('pending_properties')
      .select('*')
      .eq('verification_token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !pendingProperty) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid or expired token' 
      }, { status: 404 })
    }

    // Extract property preview data
    const propertyData = pendingProperty.property_data as any
    const preview = {
      title: `${propertyData.propertyType} in ${propertyData.city}`,
      address: `${propertyData.address}, ${propertyData.city}, ${propertyData.postcode}`,
      propertyType: propertyData.propertyType,
      monthlyRent: propertyData.monthlyRent,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      primaryImage: propertyData.photos?.[propertyData.primaryPhotoIndex || 0] || null,
      expiresAt: pendingProperty.expires_at
    }

    return NextResponse.json({
      valid: true,
      property: preview,
      pendingPropertyId: pendingProperty.id
    })

  } catch (error) {
    console.error('Error fetching pending property:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}