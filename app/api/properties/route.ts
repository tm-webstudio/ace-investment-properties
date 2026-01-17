import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { optionalAuth, rateLimit } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const city = searchParams.get('city')
    const postcodePrefix = searchParams.get('postcodePrefix')
    const minRent = searchParams.get('minRent')
    const maxRent = searchParams.get('maxRent')
    const bedrooms = searchParams.get('bedrooms')
    const propertyType = searchParams.get('propertyType')
    const status = searchParams.get('status') || 'active'
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    const offset = (page - 1) * limit
    
    let query = supabase
      .from('properties')
      .select(`
        *,
        landlord:user_profiles!landlord_id(
          full_name,
          company_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('status', status)
    
    // Apply filters
    if (city) {
      query = query.ilike('city', `%${city}%`)
    }

    // Filter by postcode prefix (for London areas like N, E, SE, W, NW, EC, WC)
    if (postcodePrefix) {
      // Handle multiple prefixes separated by comma (e.g., "SE,SW" for South London)
      const prefixes = postcodePrefix.split(',').map(p => p.trim().toUpperCase())
      if (prefixes.length === 1) {
        query = query.ilike('postcode', `${prefixes[0]}%`)
      } else {
        // Use OR filter for multiple prefixes
        // Supabase OR syntax: column.operator.value
        const orFilter = prefixes.map(p => `postcode.ilike.${p}%`).join(',')
        query = query.or(orFilter)
      }
    }

    if (minRent) {
      query = query.gte('monthly_rent', parseInt(minRent) * 100) // Convert to pence
    }
    
    if (maxRent) {
      query = query.lte('monthly_rent', parseInt(maxRent) * 100) // Convert to pence
    }
    
    if (bedrooms && bedrooms !== 'any') {
      if (bedrooms === '4+') {
        query = query.gte('bedrooms', '4')
      } else {
        query = query.eq('bedrooms', bedrooms)
      }
    }
    
    if (propertyType && propertyType !== 'any') {
      query = query.eq('property_type', propertyType)
    }
    
    // Apply sorting
    const validSortFields = ['created_at', 'monthly_rent', 'views_count']
    const validSortOrders = ['asc', 'desc']
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    } else {
      query = query.order('created_at', { ascending: false })
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1)
    
    const { data: properties, error, count } = await query

    console.log('Properties API - First property from DB:', properties?.[0] ? {
      id: properties[0].id,
      property_licence: properties[0].property_licence,
      property_condition: properties[0].property_condition
    } : null)

    if (error) {
      console.error('Error fetching properties:', error)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }
    
    const totalPages = Math.ceil((count || 0) / limit)
    
    // Convert amounts from pence back to pounds for display
    const formattedProperties = properties.map(property => ({
      ...property,
      monthly_rent: property.monthly_rent / 100,
      availability: property.availability || 'vacant' // Default to vacant if not set
    }))
    
    return NextResponse.json({
      success: true,
      properties: formattedProperties,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error in properties GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}