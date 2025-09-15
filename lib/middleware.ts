import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    user_type: 'admin' | 'landlord' | 'investor'
  }
}

export function rateLimit(windowMs: number = 60000, maxRequests: number = 10) {
  return (req: NextRequest) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const windowStart = now - windowMs
    
    const key = `${ip}:${req.nextUrl.pathname}`
    const current = rateLimitStore.get(key)
    
    if (!current || current.resetTime < now) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
      return null
    }
    
    if (current.count >= maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
    
    current.count++
    return null
  }
}

export async function optionalAuth(req: NextRequest): Promise<AuthenticatedRequest> {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  console.log('OptionalAuth debug - token:', token ? 'present' : 'missing')
  
  if (!token) {
    return req as AuthenticatedRequest
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    console.log('OptionalAuth debug - getUser result:', user ? `${user.email}` : 'no user', error ? `error: ${error.message}` : 'no error')
    
    if (error || !user) {
      return req as AuthenticatedRequest
    }
    
    // Get user profile with secure lookup
    let userType = 'investor' // default
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('id', user.id)
        .maybeSingle()
      
      if (profile && !profileError) {
        userType = profile.user_type
      }
      
      console.log('OptionalAuth debug - profile lookup:', profile ? `user_type: ${profile.user_type}` : 'no profile', profileError ? `error: ${profileError.message}` : 'no error')
    } catch (error) {
      console.log('OptionalAuth debug - profile lookup failed, using default investor role')
    }
    
    const authenticatedReq = req as AuthenticatedRequest
    authenticatedReq.user = {
      id: user.id,
      email: user.email!,
      user_type: userType
    }
    
    return authenticatedReq
  } catch (error) {
    return req as AuthenticatedRequest
  }
}

export async function requireAuth(req: NextRequest): Promise<AuthenticatedRequest | NextResponse> {
  const authenticatedReq = await optionalAuth(req)
  
  if (!authenticatedReq.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  return authenticatedReq
}

export async function requireLandlord(req: NextRequest): Promise<AuthenticatedRequest | NextResponse> {
  const result = await requireAuth(req)
  
  if (result instanceof NextResponse) {
    return result
  }
  
  if (result.user?.user_type !== 'landlord' && result.user?.user_type !== 'admin') {
    return NextResponse.json(
      { error: 'Landlord access required' },
      { status: 403 }
    )
  }
  
  return result
}

// Property validation schemas
export const stepValidationSchemas = {
  step1: z.object({
    propertyType: z.string().min(1, 'Property type is required'),
    bedrooms: z.string().min(1, 'Bedrooms is required'),
    bathrooms: z.string().min(1, 'Bathrooms is required'),
    monthlyRent: z.string().min(1, 'Monthly rent is required'),
    securityDeposit: z.string().min(1, 'Security deposit is required'),
    availableDate: z.string().min(1, 'Available date is required'),
    description: z.string().min(1, 'Description is required'), // Reduced from 10 to 1 for drafts
    amenities: z.array(z.string()).optional().default([])
  }),
  
  step2: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    postcode: z.string().min(1, 'Postcode is required')
  }),
  
  step3: z.object({
    photos: z.array(z.string()).min(1, 'At least one photo is required')
  }),
  
  step4: z.object({
    contactName: z.string().optional(),
    contactEmail: z.string().email().optional().or(z.literal('')),
    contactPhone: z.string().optional()
  })
}

export function validatePropertyStep(step: number, data: any) {
  const schema = stepValidationSchemas[`step${step}` as keyof typeof stepValidationSchemas]
  if (!schema) {
    throw new Error(`Invalid step: ${step}`)
  }
  
  return schema.parse(data)
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}