import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface AuthenticatedUser {
  id: string
  email: string
  user_type?: string
}

export interface AuthResult {
  success: boolean
  user?: AuthenticatedUser
  error?: string
  status?: number
}

/**
 * Verify user is authenticated and return user info
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Authentication required',
        status: 401
      }
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Invalid authentication token',
        status: 401
      }
    }

    // Get user profile for additional info
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_type, full_name')
      .eq('id', user.id)
      .single()

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email!,
        user_type: userProfile?.user_type
      }
    }
  } catch (error) {
    return {
      success: false,
      error: 'Authentication failed',
      status: 500
    }
  }
}

/**
 * Verify user is a landlord
 */
export async function requireLandlord(request: NextRequest): Promise<AuthResult> {
  const authResult = await requireAuth(request)
  
  if (!authResult.success) {
    return authResult
  }

  if (authResult.user?.user_type !== 'landlord') {
    return {
      success: false,
      error: 'Landlord access required',
      status: 403
    }
  }

  return authResult
}

/**
 * Verify user is an admin
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const authResult = await requireAuth(request)
  
  if (!authResult.success) {
    return authResult
  }

  if (authResult.user?.user_type !== 'admin') {
    return {
      success: false,
      error: 'Admin access required',
      status: 403
    }
  }

  return authResult
}

/**
 * Verify user owns the viewing request
 */
export async function verifyViewingOwnership(userId: string, viewingId: string): Promise<{
  success: boolean
  viewing?: any
  error?: string
  status?: number
}> {
  try {
    const { data: viewing, error } = await supabase
      .from('property_viewings')
      .select('*')
      .eq('id', viewingId)
      .single()

    if (error || !viewing) {
      return {
        success: false,
        error: 'Viewing not found',
        status: 404
      }
    }

    if (viewing.user_id !== userId) {
      return {
        success: false,
        error: 'Access denied. You can only access your own viewing requests.',
        status: 403
      }
    }

    return {
      success: true,
      viewing
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to verify viewing ownership',
      status: 500
    }
  }
}

/**
 * Verify landlord owns the property associated with a viewing
 */
export async function verifyPropertyOwnership(landlordId: string, viewingId: string): Promise<{
  success: boolean
  viewing?: any
  error?: string
  status?: number
}> {
  try {
    const { data: viewing, error } = await supabase
      .from('property_viewings')
      .select(`
        *,
        properties (
          id,
          landlord_id
        )
      `)
      .eq('id', viewingId)
      .single()

    if (error || !viewing) {
      return {
        success: false,
        error: 'Viewing not found',
        status: 404
      }
    }

    const propertyLandlordId = viewing.properties?.landlord_id || viewing.landlord_id

    if (propertyLandlordId !== landlordId) {
      return {
        success: false,
        error: 'Access denied. You can only manage viewings for your own properties.',
        status: 403
      }
    }

    return {
      success: true,
      viewing
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to verify property ownership',
      status: 500
    }
  }
}

/**
 * Validation functions
 */
export const ValidationUtils = {
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  validateUKPhone(phone: string): boolean {
    // UK phone number validation (basic)
    const ukPhoneRegex = /^(\+44|0)[1-9]\d{8,9}$/
    return ukPhoneRegex.test(phone.replace(/\s/g, ''))
  },

  validateBusinessHours(time: string): boolean {
    const [hours] = time.split(':').map(Number)
    return hours >= 9 && hours < 18 // 9 AM to 6 PM
  },

  validateFutureDate(date: string): boolean {
    const viewingDate = new Date(date)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 60) // Max 60 days in future
    
    return viewingDate >= tomorrow && viewingDate <= maxDate
  },

  validateViewingDateTime(date: string, time: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!this.validateFutureDate(date)) {
      errors.push('Viewing date must be between tomorrow and 60 days from now')
    }

    if (!this.validateBusinessHours(time)) {
      errors.push('Viewing time must be between 9 AM and 6 PM')
    }

    // Check if it's not Sunday
    const viewingDate = new Date(date)
    if (viewingDate.getDay() === 0) {
      errors.push('Viewings are not available on Sundays')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Check if a viewing status transition is valid
 */
export function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const validTransitions: Record<string, string[]> = {
    'pending': ['approved', 'rejected', 'cancelled'],
    'approved': ['rejected', 'cancelled', 'completed'],
    'rejected': [], // Cannot transition from rejected
    'cancelled': [], // Cannot transition from cancelled
    'completed': [] // Cannot transition from completed
  }

  return validTransitions[currentStatus]?.includes(newStatus) || false
}

/**
 * Error response helper
 */
export function createErrorResponse(error: string, status: number = 400) {
  return Response.json(
    { success: false, error },
    { status }
  )
}

/**
 * Success response helper
 */
export function createSuccessResponse(data: any, message?: string) {
  return Response.json({
    success: true,
    ...(message && { message }),
    ...data
  })
}