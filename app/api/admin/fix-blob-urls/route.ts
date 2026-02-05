import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin client with service role
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

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Service unavailable - admin client not configured'
      }, { status: 503 })
    }

    // Verify admin access (you can add your own admin check here)
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all properties with their photos
    const { data: properties, error: fetchError } = await supabaseAdmin
      .from('properties')
      .select('id, address, city, photos')
      .order('created_at', { ascending: false })

    if (fetchError) {
      return NextResponse.json({
        error: 'Failed to fetch properties',
        details: fetchError.message
      }, { status: 500 })
    }

    // Analyze photo URLs
    const analysis = {
      total: properties?.length || 0,
      withPhotos: 0,
      withoutPhotos: 0,
      withBlobUrls: 0,
      withValidUrls: 0,
      propertiesWithBlobUrls: [] as any[]
    }

    properties?.forEach(property => {
      if (!property.photos || property.photos.length === 0) {
        analysis.withoutPhotos++
        return
      }

      analysis.withPhotos++

      const hasBlobUrl = property.photos.some((url: string) =>
        url.startsWith('blob:') || !url.startsWith('http')
      )

      if (hasBlobUrl) {
        analysis.withBlobUrls++
        analysis.propertiesWithBlobUrls.push({
          id: property.id,
          address: property.address,
          city: property.city,
          photos: property.photos
        })
      } else {
        analysis.withValidUrls++
      }
    })

    return NextResponse.json({
      success: true,
      analysis,
      message: `Found ${analysis.withBlobUrls} properties with blob URLs out of ${analysis.total} total properties`
    })

  } catch (error: any) {
    console.error('Error analyzing blob URLs:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Service unavailable - admin client not configured'
      }, { status: 503 })
    }

    // Verify admin access
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const action = body.action // 'remove_blob_urls' or 'clear_all_photos'

    // Get all properties with blob URLs
    const { data: properties, error: fetchError } = await supabaseAdmin
      .from('properties')
      .select('id, photos')

    if (fetchError) {
      return NextResponse.json({
        error: 'Failed to fetch properties',
        details: fetchError.message
      }, { status: 500 })
    }

    const updates: any[] = []
    const results = {
      total: 0,
      updated: 0,
      errors: [] as string[]
    }

    for (const property of properties || []) {
      if (!property.photos || property.photos.length === 0) continue

      const hasBlobUrl = property.photos.some((url: string) =>
        url.startsWith('blob:') || !url.startsWith('http')
      )

      if (!hasBlobUrl) continue

      results.total++

      let newPhotos: string[] = []

      if (action === 'remove_blob_urls') {
        // Remove blob URLs, keep valid ones
        newPhotos = property.photos.filter((url: string) =>
          url.startsWith('http') && !url.startsWith('blob:')
        )
      } else if (action === 'clear_all_photos') {
        // Clear all photos for properties with blob URLs
        newPhotos = []
      } else {
        results.errors.push(`Unknown action: ${action}`)
        continue
      }

      // Update the property
      const { error: updateError } = await supabaseAdmin
        .from('properties')
        .update({ photos: newPhotos })
        .eq('id', property.id)

      if (updateError) {
        results.errors.push(`Failed to update property ${property.id}: ${updateError.message}`)
      } else {
        results.updated++
      }
    }

    return NextResponse.json({
      success: true,
      action,
      results,
      message: `Updated ${results.updated} of ${results.total} properties with blob URLs`
    })

  } catch (error: any) {
    console.error('Error fixing blob URLs:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
