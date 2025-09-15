import { supabase } from '@/lib/supabase'

/**
 * Cleanup expired property drafts
 * This function should be called periodically (e.g., via a cron job)
 */
export async function cleanupExpiredDrafts(): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
  try {
    // Call the database function to cleanup expired drafts
    const { error } = await supabase.rpc('cleanup_expired_drafts')
    
    if (error) {
      console.error('Error cleaning up expired drafts:', error)
      return { success: false, error: error.message }
    }
    
    // Get count of remaining drafts for monitoring
    const { count } = await supabase
      .from('property_drafts')
      .select('*', { count: 'exact', head: true })
    
    console.log('Expired drafts cleaned up successfully. Remaining drafts:', count)
    return { success: true, deletedCount: count }
  } catch (error: any) {
    console.error('Error in cleanupExpiredDrafts:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Manual cleanup API endpoint for testing or manual triggers
 */
export async function handleCleanupRequest(): Promise<Response> {
  const result = await cleanupExpiredDrafts()
  
  if (result.success) {
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cleanup completed successfully',
        remainingDrafts: result.deletedCount 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } else {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: result.error 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}