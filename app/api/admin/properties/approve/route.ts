import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getInvestorMatches } from '@/lib/propertyMatching'


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

    if (action !== 'approve' && action !== 'reject' && action !== 'unapprove') {
      return NextResponse.json(
        { error: 'Action must be approve, reject, or unapprove' },
        { status: 400 }
      )
    }

    // Update property status
    const newStatus = action === 'approve' ? 'active' : action === 'unapprove' ? 'draft' : 'rejected'
    const updateData: any = {
      status: newStatus
    }

    // Set published_at timestamp when approving, clear it when unapproving
    if (action === 'approve') {
      updateData.published_at = new Date().toISOString()
    } else if (action === 'unapprove') {
      updateData.published_at = null
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

    // Fire n8n webhook for approved properties
    let webhookError: string | null = null
    if (action === 'approve' && process.env.N8N_WEBHOOK_URL) {
      try {
        // Fetch landlord info
        let landlordName = '', landlordEmail = '', landlordPhone = ''
        if (updatedProperty.landlord_id) {
          const [{ data: landlordUser }, { data: landlordProfile }] = await Promise.all([
            supabaseAdmin!.auth.admin.getUserById(updatedProperty.landlord_id),
            supabaseAdmin!.from('user_profiles').select('full_name, phone').eq('id', updatedProperty.landlord_id).single()
          ])
          landlordEmail = landlordUser?.user?.email || ''
          landlordName = landlordProfile?.full_name || ''
          landlordPhone = landlordProfile?.phone || ''
        }

        // Fetch matched investors
        const matchedInvestors = await getInvestorMatches(propertyId)

        const webhookRes = await fetch(process.env.N8N_WEBHOOK_URL!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property_id: updatedProperty.id,
            property_url: `https://www.aceinvestmentproperties.co.uk/properties/${updatedProperty.id}`,
            address: updatedProperty.address,
            postcode: updatedProperty.postcode,
            bedrooms: updatedProperty.bedrooms,
            monthly_rent: updatedProperty.monthly_rent,
            property_type: updatedProperty.property_type,
            landlord_name: landlordName,
            landlord_phone: landlordPhone,
            landlord_email: landlordEmail,
            matched_investors: matchedInvestors,
          }),
        })
        if (!webhookRes.ok) {
          webhookError = `Webhook returned ${webhookRes.status}`
          console.error('n8n webhook error for property:', propertyId, webhookError)
        } else {
          console.log('n8n webhook fired successfully for property:', propertyId)
        }
      } catch (err) {
        webhookError = err instanceof Error ? err.message : 'Unknown webhook error'
        console.error('n8n webhook failed for property:', propertyId, err)
      }
    }

    return NextResponse.json({
      success: true,
      property: updatedProperty,
      message: `Property ${action}d successfully`,
      webhookError,
    })

  } catch (error) {
    console.error('Error in property approval:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}