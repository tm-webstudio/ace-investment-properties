import { NextRequest, NextResponse } from 'next/server'
import { checkExpiringDocuments } from '@/lib/jobs/checkExpiringDocuments.js'

/**
 * Cron Endpoint: Check Expiring Documents
 *
 * This endpoint should be called daily by a cron service (e.g., Vercel Cron, GitHub Actions)
 *
 * Security: Use authorization header or Vercel Cron secret to protect this endpoint
 *
 * Vercel Cron Setup:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-expiring-documents",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or has valid auth
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-cron-secret-here'

    // Check if request is from Vercel Cron or has valid auth
    const isVercelCron = authHeader === `Bearer ${cronSecret}`
    const hasValidAuth = authHeader === `Bearer ${cronSecret}`

    if (!isVercelCron && !hasValidAuth) {
      console.warn('[Document Expiry Cron] Unauthorized access attempt')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check for dry run mode
    const { searchParams } = new URL(request.url)
    const dryRun = searchParams.get('dryRun') === 'true'

    console.log(`[Document Expiry Cron] Starting job ${dryRun ? '(DRY RUN)' : ''}`)

    // Run the background job
    const results = await checkExpiringDocuments(dryRun)

    return NextResponse.json({
      success: results.success,
      timestamp: new Date().toISOString(),
      processed: results.processed,
      sent: results.sent,
      errors: results.errors.length > 0 ? results.errors : undefined,
      dryRun
    })

  } catch (error) {
    console.error('[Document Expiry Cron] Fatal error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Also support POST for compatibility with some cron services
export async function POST(request: NextRequest) {
  return GET(request)
}
