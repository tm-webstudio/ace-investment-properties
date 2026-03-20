import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/viewing-middleware'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await requireAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status || 401 }
      )
    }

    const body = await request.json()
    const { propertyId, requestedDate, userName, userEmail, userPhone, message } = body

    // Validate required fields
    if (!propertyId || !requestedDate || !userName || !userEmail || !userPhone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: propertyId, requestedDate, userName, userEmail, userPhone' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch property with landlord info
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, address, city, title, contact_phone, landlord_id, user_profiles!properties_landlord_id_fkey(phone, full_name)')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      )
    }

    // Extract landlord phone
    const landlordProfile = property.user_profiles as any
    const landlordPhone = landlordProfile?.phone || property.contact_phone
    if (!landlordPhone) {
      return NextResponse.json(
        { success: false, error: 'No landlord phone number available for this property' },
        { status: 400 }
      )
    }

    // Insert viewing request
    const { data: viewingRequest, error: insertError } = await supabase
      .from('viewing_requests')
      .insert({
        property_id: propertyId,
        investor_name: userName,
        investor_email: userEmail,
        investor_phone: userPhone,
        requested_date: requestedDate,
        message: message || null,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError || !viewingRequest) {
      console.error('Failed to create viewing request:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create viewing request' },
        { status: 500 }
      )
    }

    // Trigger Vapi AI phone call
    const vapiKey = process.env.VAPI_PRIVATE_KEY
    const vapiAssistantId = process.env.VAPI_ASSISTANT_ID

    if (!vapiKey || !vapiAssistantId) {
      console.error('Vapi configuration missing: VAPI_PRIVATE_KEY or VAPI_ASSISTANT_ID')
      await supabase
        .from('viewing_requests')
        .update({ status: 'failed' })
        .eq('id', viewingRequest.id)

      return NextResponse.json({
        success: true,
        requestId: viewingRequest.id,
        warning: 'Viewing request saved but AI call could not be initiated (configuration missing)'
      })
    }

    try {
      const vapiResponse = await fetch('https://api.vapi.ai/call/phone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vapiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assistantId: vapiAssistantId,
          customer: { number: landlordPhone },
          assistantOverrides: {
            variableValues: {
              propertyAddress: property.address,
              investorName: userName,
              investorPhone: userPhone,
              requestedDate: requestedDate
            }
          }
        })
      })

      const vapiData = await vapiResponse.json()

      if (!vapiResponse.ok) {
        console.error('Vapi API error:', vapiData)
        await supabase
          .from('viewing_requests')
          .update({ status: 'failed' })
          .eq('id', viewingRequest.id)

        return NextResponse.json({
          success: true,
          requestId: viewingRequest.id,
          warning: 'Viewing request saved but AI call failed'
        })
      }

      // Update with Vapi call ID
      await supabase
        .from('viewing_requests')
        .update({ vapi_call_id: vapiData.id })
        .eq('id', viewingRequest.id)

      return NextResponse.json({
        success: true,
        requestId: viewingRequest.id
      })
    } catch (vapiError) {
      console.error('Vapi call failed:', vapiError)
      await supabase
        .from('viewing_requests')
        .update({ status: 'failed' })
        .eq('id', viewingRequest.id)

      return NextResponse.json({
        success: true,
        requestId: viewingRequest.id,
        warning: 'Viewing request saved but AI call failed'
      })
    }
  } catch (error) {
    console.error('Book viewing error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
