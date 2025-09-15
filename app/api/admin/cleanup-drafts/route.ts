import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredDrafts } from '@/lib/cron-cleanup'
import { requireAuth } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  try {
    // Only allow admin users to manually trigger cleanup
    const result = await requireAuth(request)
    if (result instanceof NextResponse) return result
    
    const req = result
    if (req.user?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const cleanupResult = await cleanupExpiredDrafts()
    
    if (cleanupResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Cleanup completed successfully',
        remainingDrafts: cleanupResult.deletedCount
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: cleanupResult.error 
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in cleanup-drafts endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}