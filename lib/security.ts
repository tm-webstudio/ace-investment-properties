import { NextRequest, NextResponse } from 'next/server'

// Security headers for API responses
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Prevent XSS attacks
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Enforce HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy for API responses
  response.headers.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'")
  
  return response
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potential XSS characters
    .substring(0, 1000) // Limit length
}

// Email validation with additional checks
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Password strength validation
export function validatePassword(password: string): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Rate limiting with IP tracking
const rateLimitAttempts = new Map<string, { count: number; resetTime: number; blocked: boolean }>()

export function trackFailedAttempt(identifier: string, blockDurationMs: number = 900000): boolean {
  const now = Date.now()
  const current = rateLimitAttempts.get(identifier)
  
  if (!current) {
    rateLimitAttempts.set(identifier, { count: 1, resetTime: now + blockDurationMs, blocked: false })
    return false
  }
  
  if (current.resetTime < now) {
    // Reset the counter
    rateLimitAttempts.set(identifier, { count: 1, resetTime: now + blockDurationMs, blocked: false })
    return false
  }
  
  current.count++
  
  // Block after 5 failed attempts
  if (current.count >= 5) {
    current.blocked = true
    current.resetTime = now + blockDurationMs
    return true
  }
  
  return false
}

export function isBlocked(identifier: string): boolean {
  const current = rateLimitAttempts.get(identifier)
  if (!current) return false
  
  const now = Date.now()
  if (current.resetTime < now) {
    // Reset the block
    rateLimitAttempts.delete(identifier)
    return false
  }
  
  return current.blocked
}

// Clean up old entries periodically
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [key, value] of rateLimitAttempts.entries()) {
    if (value.resetTime < now) {
      rateLimitAttempts.delete(key)
    }
  }
}

// CSRF token generation and validation
export function generateCSRFToken(): string {
  return crypto.randomUUID()
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  // In a real implementation, you'd store and validate CSRF tokens properly
  // This is a simplified version
  return typeof token === 'string' && token.length > 0
}

// SQL injection prevention helpers
export function escapeSQL(input: string): string {
  return input.replace(/'/g, "''")
}

// General input validation
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}