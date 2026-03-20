import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Vapi sends different message types; we only care about end-of-call-report
    const messageType = body.message?.type
    if (messageType !== 'end-of-call-report') {
      return NextResponse.json({ received: true })
    }

    const callId = body.message?.call?.id
    const summary = body.message?.summary || ''
    const endedReason = body.message?.endedReason || ''

    if (!callId) {
      console.error('Vapi webhook: missing call ID')
      return NextResponse.json({ error: 'Missing call ID' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Look up the viewing request by Vapi call ID
    const { data: viewingRequest, error: lookupError } = await supabase
      .from('viewing_requests')
      .select('*, properties(address, city, title)')
      .eq('vapi_call_id', callId)
      .single()

    if (lookupError || !viewingRequest) {
      console.error('Vapi webhook: viewing request not found for call', callId)
      return NextResponse.json({ error: 'Viewing request not found' }, { status: 404 })
    }

    // Determine outcome from summary
    const summaryLower = summary.toLowerCase()
    const isConfirmed =
      summaryLower.includes('confirmed') ||
      summaryLower.includes('available') ||
      summaryLower.includes('accepted') ||
      summaryLower.includes('approved')

    const newStatus = isConfirmed ? 'confirmed' : 'unavailable'

    // Update status
    const { error: updateError } = await supabase
      .from('viewing_requests')
      .update({ status: newStatus })
      .eq('id', viewingRequest.id)

    if (updateError) {
      console.error('Vapi webhook: failed to update status', updateError)
    }

    // Build property address for email
    const property = viewingRequest.properties as any
    const propertyAddress = property?.address || 'the property'

    // Format the requested date nicely
    const requestedDate = new Date(viewingRequest.requested_date)
    const formattedDate = requestedDate.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    // Send outcome email to investor
    if (isConfirmed) {
      await sendEmail({
        to: viewingRequest.investor_email,
        subject: `Viewing Confirmed - ${propertyAddress}`,
        react: undefined,
        from: undefined,
        html: `
          <h2>Great news, ${viewingRequest.investor_name}!</h2>
          <p>Your viewing at <strong>${propertyAddress}</strong> on <strong>${formattedDate}</strong> has been confirmed by the landlord.</p>
          <p>Please arrive on time and bring a valid form of ID.</p>
          <br/>
          <p>Best regards,<br/>Ace Investment Properties</p>
        `
      })
    } else {
      await sendEmail({
        to: viewingRequest.investor_email,
        subject: `Viewing Update - ${propertyAddress}`,
        react: undefined,
        from: undefined,
        html: `
          <h2>Hello ${viewingRequest.investor_name},</h2>
          <p>Unfortunately, the landlord is unavailable for your requested viewing at <strong>${propertyAddress}</strong> on <strong>${formattedDate}</strong>.</p>
          <p>Please try booking a different date through our website.</p>
          <br/>
          <p>Best regards,<br/>Ace Investment Properties</p>
        `
      })
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    console.error('Vapi webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
