import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireLandlord } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const result = await requireLandlord(request)
    if (result instanceof NextResponse) return result
    
    const req = result
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'all'
    const sortBy = searchParams.get('sortBy') || 'updated_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    const offset = (page - 1) * limit
    
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('landlord_id', req.user!.id)
    
    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status)
    }
    
    // Apply sorting
    const validSortFields = ['created_at', 'updated_at', 'monthly_rent', 'views_count']
    const validSortOrders = ['asc', 'desc']
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    } else {
      query = query.order('updated_at', { ascending: false })
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1)
    
    const { data: properties, error, count } = await query
    
    if (error) {
      console.error('Error fetching landlord properties:', error)
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
    console.error('Error in my-listings GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}