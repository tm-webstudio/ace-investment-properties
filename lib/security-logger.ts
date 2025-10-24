import { NextRequest } from 'next/server'

export interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit' | 'invalid_input' | 'suspicious_activity'
  timestamp: string
  ip: string
  userAgent: string
  details: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

class SecurityLogger {
  private events: SecurityEvent[] = []
  private maxEvents = 1000

  log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    }

    this.events.push(securityEvent)

    // Keep only the latest events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', securityEvent)
    }

    // In production, you would send this to your logging service
    // Examples: Sentry, DataDog, CloudWatch, etc.
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(securityEvent)
    }
  }

  private sendToLoggingService(event: SecurityEvent): void {
    // Implement your preferred logging service here
    // Example for Sentry:
    // Sentry.captureMessage('Security Event', {
    //   level: event.severity,
    //   extra: event
    // })
  }

  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(-limit)
  }

  getEventsByType(type: SecurityEvent['type'], limit: number = 100): SecurityEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit)
  }

  getEventsByIP(ip: string, limit: number = 100): SecurityEvent[] {
    return this.events
      .filter(event => event.ip === ip)
      .slice(-limit)
  }

  // Helper to extract IP and User Agent from request
  static extractRequestInfo(request: NextRequest): { ip: string; userAgent: string } {
    const ip = request.ip || 
               request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    return { ip, userAgent }
  }
}

export const securityLogger = new SecurityLogger()

// Helper functions for common security events
export function logAuthFailure(
  request: NextRequest, 
  email: string, 
  reason: string
): void {
  const { ip, userAgent } = SecurityLogger.extractRequestInfo(request)
  
  securityLogger.log({
    type: 'auth_failure',
    ip,
    userAgent,
    details: { email, reason },
    severity: 'medium'
  })
}

export function logRateLimit(
  request: NextRequest,
  endpoint: string,
  attempts: number
): void {
  const { ip, userAgent } = SecurityLogger.extractRequestInfo(request)
  
  securityLogger.log({
    type: 'rate_limit',
    ip,
    userAgent,
    details: { endpoint, attempts },
    severity: attempts > 10 ? 'high' : 'medium'
  })
}

export function logInvalidInput(
  request: NextRequest,
  field: string,
  value: string,
  reason: string
): void {
  const { ip, userAgent } = SecurityLogger.extractRequestInfo(request)
  
  securityLogger.log({
    type: 'invalid_input',
    ip,
    userAgent,
    details: { field, value: value.substring(0, 100), reason },
    severity: 'low'
  })
}

export function logSuspiciousActivity(
  request: NextRequest,
  activity: string,
  details: Record<string, any>
): void {
  const { ip, userAgent } = SecurityLogger.extractRequestInfo(request)
  
  securityLogger.log({
    type: 'suspicious_activity',
    ip,
    userAgent,
    details: { activity, ...details },
    severity: 'high'
  })
}