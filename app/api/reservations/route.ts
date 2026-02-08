import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import ReservationRequest from '@/emails/admin/reservation-request'

interface ReservationRequestBody {
  propertyId: string
  propertyTitle: string
  propertyAddress: string
  name: string
  email: string
  phone: string
  message?: string
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePhone(phone: string): boolean {
  // Basic phone validation - allows various formats
  const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

export async function POST(request: NextRequest) {
  try {
    const body: ReservationRequestBody = await request.json()

    // Validate required fields
    if (!body.propertyId || !body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate phone format
    if (!validatePhone(body.phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Send email notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'q@aceinvestmentproperties.com'

    try {
      await sendEmail({
        to: adminEmail,
        subject: `New Reservation Request - ${body.propertyTitle}`,
        react: ReservationRequest({
          propertyTitle: body.propertyTitle,
          propertyAddress: body.propertyAddress,
          requesterName: body.name,
          requesterEmail: body.email,
          requesterPhone: body.phone,
          message: body.message || '',
          dashboardLink: `${process.env.NEXT_PUBLIC_SITE_URL}/admin`
        })
      })
    } catch (emailError) {
      console.error('Failed to send reservation email:', emailError)
      // Still return success since we received the request
    }

    return NextResponse.json({
      success: true,
      message: 'Reservation request submitted successfully'
    })

  } catch (error) {
    console.error('Reservation request error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
