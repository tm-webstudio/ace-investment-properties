import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireLandlord, ValidationUtils } from '@/lib/viewing-middleware'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Property viewing API is working',
    endpoints: {
      'POST /api/viewings/request': 'Create new viewing request',
      'GET /api/viewings/my-requests': 'Get user viewing requests',
      'GET /api/viewings/for-my-properties': 'Get landlord viewing requests',
      'GET /api/viewings/:id': 'Get single viewing details',
      'PUT /api/viewings/:id/approve': 'Approve viewing request',
      'PUT /api/viewings/:id/reject': 'Reject viewing request',
      'PUT /api/viewings/:id/cancel': 'Cancel viewing request',
      'GET /api/properties/[id]/available-slots': 'Get property availability'
    },
    validation: {
      email: ValidationUtils.validateEmail('test@example.com'),
      ukPhone: ValidationUtils.validateUKPhone('07123456789'),
      businessHours: ValidationUtils.validateBusinessHours('14:30'),
      futureDate: ValidationUtils.validateFutureDate('2025-11-01')
    }
  })
}

export async function POST(request: NextRequest) {
  // Test authentication middleware
  const authResult = await requireAuth(request)
  
  if (!authResult.success) {
    return NextResponse.json(authResult, { status: authResult.status })
  }

  return NextResponse.json({
    success: true,
    message: 'Authentication test successful',
    user: authResult.user
  })
}

export async function PUT(request: NextRequest) {
  // Test landlord middleware
  const authResult = await requireLandlord(request)
  
  if (!authResult.success) {
    return NextResponse.json(authResult, { status: authResult.status })
  }

  return NextResponse.json({
    success: true,
    message: 'Landlord authentication test successful',
    user: authResult.user
  })
}