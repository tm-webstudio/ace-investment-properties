/**
 * Background Job: Check Expiring Documents
 *
 * This job should be run daily via cron (e.g., Vercel Cron, GitHub Actions, or external cron service)
 * It checks for documents expiring in 30, 14, and 7 days and sends email reminders to landlords
 *
 * To set up in Vercel:
 * 1. Create /app/api/cron/check-expiring-documents/route.ts
 * 2. Add vercel.json with cron configuration
 * 3. Deploy to Vercel
 */

import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '../email.js'
import DocumentExpiring from '../../emails/DocumentExpiring.jsx'
import { calculateDaysUntil, formatDocType, formatPropertyAddress } from '../emailHelpers.js'

// Initialize Supabase client with service role key for background jobs
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Check for expiring documents and send email notifications
 * @param {boolean} dryRun - If true, only log what would be sent without sending emails
 * @returns {Promise<{success: boolean, processed: number, sent: number, errors: any[]}>}
 */
export async function checkExpiringDocuments(dryRun = false) {
  console.log(`[Document Expiry Check] Starting ${dryRun ? '(DRY RUN)' : ''}...`)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const thirtyDaysFromNow = new Date(today)
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const results = {
    success: true,
    processed: 0,
    sent: 0,
    errors: []
  }

  try {
    // Fetch documents expiring within the next 30 days
    const { data: expiringDocs, error: fetchError } = await supabase
      .from('property_documents')
      .select(`
        *,
        properties (
          id,
          title,
          address,
          street_address,
          city,
          postcode,
          landlord_id
        )
      `)
      .gte('expiry_date', today.toISOString().split('T')[0])
      .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
      .in('status', ['approved', 'active'])
      .order('expiry_date', { ascending: true })

    if (fetchError) {
      console.error('[Document Expiry Check] Error fetching documents:', fetchError)
      results.success = false
      results.errors.push(fetchError)
      return results
    }

    if (!expiringDocs || expiringDocs.length === 0) {
      console.log('[Document Expiry Check] No expiring documents found')
      return results
    }

    console.log(`[Document Expiry Check] Found ${expiringDocs.length} documents expiring within 30 days`)

    // Group documents by landlord and property
    const notificationMap = new Map()

    for (const doc of expiringDocs) {
      if (!doc.properties || !doc.expiry_date) continue

      const daysUntilExpiry = calculateDaysUntil(doc.expiry_date)

      // Only send reminders at 30, 14, and 7 days (or if expired)
      const shouldNotify = daysUntilExpiry <= 0 || [7, 14, 30].includes(daysUntilExpiry)

      if (!shouldNotify) continue

      const landlordId = doc.properties.landlord_id
      const propertyId = doc.properties.id
      const key = `${landlordId}_${propertyId}_${daysUntilExpiry}`

      if (!notificationMap.has(key)) {
        notificationMap.set(key, {
          landlordId,
          propertyId,
          property: doc.properties,
          documents: []
        })
      }

      notificationMap.get(key).documents.push({
        type: doc.document_type,
        expiryDate: doc.expiry_date,
        daysUntilExpiry
      })
    }

    console.log(`[Document Expiry Check] Preparing ${notificationMap.size} notifications`)

    // Send email for each landlord/property combination
    for (const [key, notification] of notificationMap) {
      try {
        results.processed++

        // Fetch landlord email
        const { data: landlordProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('email, first_name, last_name, full_name')
          .eq('id', notification.landlordId)
          .single()

        if (profileError || !landlordProfile?.email) {
          console.error(`[Document Expiry Check] No email found for landlord ${notification.landlordId}`)
          results.errors.push({
            key,
            error: 'No landlord email'
          })
          continue
        }

        // Send one email per document (multiple documents = multiple emails)
        for (const document of notification.documents) {
          const landlordName = landlordProfile.full_name ||
                              landlordProfile.first_name ||
                              'Landlord'

          if (dryRun) {
            console.log(`[DRY RUN] Would send email to ${landlordProfile.email}:`)
            console.log(`  Property: ${notification.property.title}`)
            console.log(`  Document: ${formatDocType(document.type)}`)
            console.log(`  Expires: ${document.expiryDate} (${document.daysUntilExpiry} days)`)
            results.sent++
            continue
          }

          // Send the email
          const emailResult = await sendEmail({
            to: landlordProfile.email,
            subject: document.daysUntilExpiry < 0
              ? `⚠️ Document Expired - ${notification.property.title}`
              : `Document Expiring ${document.daysUntilExpiry === 0 ? 'Today' : `in ${document.daysUntilExpiry} Days`} - ${notification.property.title}`,
            react: DocumentExpiring({
              landlordName: landlordName,
              propertyTitle: notification.property.title || 'Your Property',
              propertyAddress: formatPropertyAddress(notification.property),
              documentType: formatDocType(document.type),
              expiryDate: document.expiryDate,
              daysUntilExpiry: document.daysUntilExpiry,
              uploadLink: `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/documents?property=${notification.propertyId}`,
              dashboardLink: `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/dashboard`
            })
          })

          if (emailResult.success) {
            results.sent++
            console.log(`[Document Expiry Check] ✓ Sent to ${landlordProfile.email} for ${formatDocType(document.type)}`)
          } else {
            console.error(`[Document Expiry Check] ✗ Failed to send to ${landlordProfile.email}:`, emailResult.error)
            results.errors.push({
              key,
              email: landlordProfile.email,
              document: document.type,
              error: emailResult.error
            })
          }

          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100))
        }

      } catch (error) {
        console.error(`[Document Expiry Check] Error processing notification ${key}:`, error)
        results.errors.push({
          key,
          error: error.message
        })
      }
    }

    console.log(`[Document Expiry Check] Completed: ${results.sent}/${results.processed} emails sent`)

  } catch (error) {
    console.error('[Document Expiry Check] Fatal error:', error)
    results.success = false
    results.errors.push(error)
  }

  return results
}

/**
 * Run the job (for CLI execution)
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const dryRun = process.argv.includes('--dry-run')

  checkExpiringDocuments(dryRun)
    .then(results => {
      console.log('\n=== Results ===')
      console.log(JSON.stringify(results, null, 2))
      process.exit(results.success ? 0 : 1)
    })
    .catch(error => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}
