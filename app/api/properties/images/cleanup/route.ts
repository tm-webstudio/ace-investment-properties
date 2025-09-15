import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, rateLimit } from '@/lib/middleware'
import { cleanupOrphanedImages } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting - 2 cleanup operations per hour
    const rateLimitResult = rateLimit(3600000, 2)(request)
    if (rateLimitResult) return rateLimitResult

    const result = await requireAuth(request)
    if (result instanceof NextResponse) return result

    const req = result
    const body = await request.json()
    
    // Only allow admin users to run cleanup
    if (req.user?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { olderThanDays = 7 } = body

    // Validate olderThanDays parameter
    if (typeof olderThanDays !== 'number' || olderThanDays < 1 || olderThanDays > 365) {
      return NextResponse.json(
        { error: 'olderThanDays must be between 1 and 365' },
        { status: 400 }
      )
    }

    const cleanupResult = await cleanupOrphanedImages(olderThanDays)

    return NextResponse.json({
      success: true,
      deleted: cleanupResult.deleted,
      errors: cleanupResult.errors,
      message: `Cleaned up ${cleanupResult.deleted} orphaned images older than ${olderThanDays} days`
    })

  } catch (error: any) {
    console.error('Image cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup images' },
      { status: 500 }
    )
  }
}