import { supabase } from '@/lib/supabase'
import { cleanupOrphanedImages } from '@/lib/storage'

export interface CleanupJob {
  id: string
  type: 'orphaned_images' | 'expired_drafts'
  status: 'pending' | 'running' | 'completed' | 'failed'
  scheduled_at: string
  started_at?: string
  completed_at?: string
  error?: string
  result?: {
    deleted?: number
    errors?: string[]
    message?: string
  }
}

/**
 * Schedule a cleanup job for orphaned images
 */
export async function scheduleImageCleanup(olderThanDays: number = 7): Promise<{ jobId: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('cleanup_jobs')
      .insert({
        type: 'orphaned_images',
        status: 'pending',
        scheduled_at: new Date().toISOString(),
        config: { olderThanDays }
      })
      .select()
      .single()

    if (error) {
      return { jobId: '', error: error.message }
    }

    return { jobId: data.id }
  } catch (error: any) {
    return { jobId: '', error: error.message }
  }
}

/**
 * Execute a cleanup job
 */
export async function executeCleanupJob(jobId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Mark job as running
    const { error: updateError } = await supabase
      .from('cleanup_jobs')
      .update({
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', jobId)

    if (updateError) {
      throw new Error(`Failed to update job status: ${updateError.message}`)
    }

    // Get job details
    const { data: job, error: fetchError } = await supabase
      .from('cleanup_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (fetchError || !job) {
      throw new Error(`Job not found: ${fetchError?.message}`)
    }

    let result: any = {}
    let error: string | undefined

    // Execute based on job type
    switch (job.type) {
      case 'orphaned_images':
        const olderThanDays = job.config?.olderThanDays || 7
        const cleanupResult = await cleanupOrphanedImages(olderThanDays)
        result = {
          deleted: cleanupResult.deleted,
          errors: cleanupResult.errors,
          message: `Deleted ${cleanupResult.deleted} orphaned images older than ${olderThanDays} days`
        }
        
        if (cleanupResult.errors.length > 0) {
          error = `Some deletions failed: ${cleanupResult.errors.join(', ')}`
        }
        break

      case 'expired_drafts':
        // Implement draft cleanup logic here
        result = { message: 'Draft cleanup not implemented yet' }
        break

      default:
        throw new Error(`Unknown job type: ${job.type}`)
    }

    // Update job as completed
    await supabase
      .from('cleanup_jobs')
      .update({
        status: error ? 'failed' : 'completed',
        completed_at: new Date().toISOString(),
        result,
        error
      })
      .eq('id', jobId)

    return { success: !error }
  } catch (error: any) {
    // Mark job as failed
    await supabase
      .from('cleanup_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error: error.message
      })
      .eq('id', jobId)

    return { success: false, error: error.message }
  }
}

/**
 * Get cleanup jobs with optional filtering
 */
export async function getCleanupJobs(
  options: {
    status?: string
    type?: string
    limit?: number
    offset?: number
  } = {}
): Promise<{ jobs: CleanupJob[]; total: number; error?: string }> {
  try {
    let query = supabase
      .from('cleanup_jobs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (options.status) {
      query = query.eq('status', options.status)
    }

    if (options.type) {
      query = query.eq('type', options.type)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      return { jobs: [], total: 0, error: error.message }
    }

    return { jobs: data || [], total: count || 0 }
  } catch (error: any) {
    return { jobs: [], total: 0, error: error.message }
  }
}

/**
 * Auto-schedule daily cleanup job
 */
export async function scheduleAutomaticCleanup(): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if there's already a pending or running cleanup job
    const { data: existingJobs } = await supabase
      .from('cleanup_jobs')
      .select('id')
      .eq('type', 'orphaned_images')
      .in('status', ['pending', 'running'])
      .limit(1)

    if (existingJobs && existingJobs.length > 0) {
      return { success: true } // Job already exists
    }

    // Schedule new cleanup job for images older than 7 days
    const { error } = await scheduleImageCleanup(7)
    if (error) {
      return { success: false, error }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Process pending cleanup jobs
 */
export async function processPendingJobs(): Promise<{ processed: number; errors: string[] }> {
  try {
    // Get all pending jobs
    const { data: pendingJobs, error } = await supabase
      .from('cleanup_jobs')
      .select('id')
      .eq('status', 'pending')
      .limit(5) // Process max 5 jobs at a time

    if (error || !pendingJobs) {
      return { processed: 0, errors: [error?.message || 'Failed to fetch pending jobs'] }
    }

    const errors: string[] = []
    let processed = 0

    // Process each job
    for (const job of pendingJobs) {
      const result = await executeCleanupJob(job.id)
      if (result.success) {
        processed++
      } else {
        errors.push(`Job ${job.id}: ${result.error}`)
      }
    }

    return { processed, errors }
  } catch (error: any) {
    return { processed: 0, errors: [error.message] }
  }
}

/**
 * Clean up old completed jobs (keep only last 100)
 */
export async function cleanupCompletedJobs(): Promise<{ deleted: number; error?: string }> {
  try {
    // Get IDs of old completed jobs (keep last 100)
    const { data: oldJobs, error } = await supabase
      .from('cleanup_jobs')
      .select('id')
      .in('status', ['completed', 'failed'])
      .order('completed_at', { ascending: false })
      .range(100, 999) // Skip first 100, get rest

    if (error) {
      return { deleted: 0, error: error.message }
    }

    if (!oldJobs || oldJobs.length === 0) {
      return { deleted: 0 } // No old jobs to delete
    }

    const oldJobIds = oldJobs.map(job => job.id)

    // Delete old jobs
    const { error: deleteError } = await supabase
      .from('cleanup_jobs')
      .delete()
      .in('id', oldJobIds)

    if (deleteError) {
      return { deleted: 0, error: deleteError.message }
    }

    return { deleted: oldJobs.length }
  } catch (error: any) {
    return { deleted: 0, error: error.message }
  }
}