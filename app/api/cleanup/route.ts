import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { 
  scheduleImageCleanup, 
  executeCleanupJob, 
  getCleanupJobs, 
  processPendingJobs,
  scheduleAutomaticCleanup 
} from '@/lib/image-cleanup'

// Schedule cleanup job
export async function POST(request: NextRequest) {
  try {
    const result = await requireAuth(request)
    if (result instanceof NextResponse) return result

    const req = result
    
    // Only allow admin users
    if (req.user?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, jobId, olderThanDays = 7 } = body

    switch (action) {
      case 'schedule':
        const scheduleResult = await scheduleImageCleanup(olderThanDays)
        if (scheduleResult.error) {
          return NextResponse.json(
            { error: scheduleResult.error },
            { status: 500 }
          )
        }
        return NextResponse.json({
          success: true,
          jobId: scheduleResult.jobId,
          message: `Cleanup job scheduled for images older than ${olderThanDays} days`
        })

      case 'execute':
        if (!jobId) {
          return NextResponse.json(
            { error: 'Job ID is required' },
            { status: 400 }
          )
        }
        const executeResult = await executeCleanupJob(jobId)
        return NextResponse.json({
          success: executeResult.success,
          error: executeResult.error
        })

      case 'process_pending':
        const processResult = await processPendingJobs()
        return NextResponse.json({
          success: true,
          processed: processResult.processed,
          errors: processResult.errors
        })

      case 'schedule_automatic':
        const autoResult = await scheduleAutomaticCleanup()
        return NextResponse.json({
          success: autoResult.success,
          error: autoResult.error
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Cleanup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get cleanup jobs
export async function GET(request: NextRequest) {
  try {
    const result = await requireAuth(request)
    if (result instanceof NextResponse) return result

    const req = result
    
    // Only allow admin users
    if (req.user?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status') || undefined
    const type = url.searchParams.get('type') || undefined
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const result2 = await getCleanupJobs({ status, type, limit, offset })

    if (result2.error) {
      return NextResponse.json(
        { error: result2.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      jobs: result2.jobs,
      total: result2.total,
      pagination: {
        limit,
        offset,
        hasMore: result2.total > offset + limit
      }
    })

  } catch (error: any) {
    console.error('Cleanup jobs fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}