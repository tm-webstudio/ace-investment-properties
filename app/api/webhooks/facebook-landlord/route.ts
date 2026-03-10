import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'
import { formatPropertyTitle, formatPropertyAddress } from '@/lib/format-address'
import NewProperty from '@/emails/admin/new-property'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const districtToCityMap: Record<string, string> = {
  'barking and dagenham': 'London', 'barnet': 'London', 'bexley': 'London',
  'brent': 'London', 'bromley': 'London', 'camden': 'London', 'croydon': 'London',
  'ealing': 'London', 'enfield': 'London', 'greenwich': 'London', 'hackney': 'London',
  'hammersmith and fulham': 'London', 'haringey': 'London', 'harrow': 'London',
  'havering': 'London', 'hillingdon': 'London', 'hounslow': 'London',
  'islington': 'London', 'kensington and chelsea': 'London',
  'kingston upon thames': 'London', 'lambeth': 'London', 'lewisham': 'London',
  'merton': 'London', 'newham': 'London', 'redbridge': 'London',
  'richmond upon thames': 'London', 'southwark': 'London', 'sutton': 'London',
  'tower hamlets': 'London', 'waltham forest': 'London', 'wandsworth': 'London',
  'westminster': 'London', 'city of london': 'London',
  'manchester': 'Manchester', 'salford': 'Manchester', 'bolton': 'Manchester',
  'bury': 'Manchester', 'oldham': 'Manchester', 'rochdale': 'Manchester',
  'stockport': 'Manchester', 'tameside': 'Manchester', 'trafford': 'Manchester',
  'wigan': 'Manchester',
  'birmingham': 'Birmingham', 'coventry': 'Coventry', 'dudley': 'Birmingham',
  'sandwell': 'Birmingham', 'solihull': 'Birmingham', 'walsall': 'Birmingham',
  'wolverhampton': 'Birmingham',
  'liverpool': 'Liverpool', 'sefton': 'Liverpool', 'knowsley': 'Liverpool',
  'st helens': 'Liverpool', 'wirral': 'Liverpool',
  'leeds': 'Leeds', 'bradford': 'Leeds', 'calderdale': 'Leeds',
  'kirklees': 'Leeds', 'wakefield': 'Leeds',
  'newcastle upon tyne': 'Newcastle', 'gateshead': 'Newcastle',
  'north tyneside': 'Newcastle', 'south tyneside': 'Newcastle', 'sunderland': 'Newcastle',
  'brighton and hove': 'Brighton',
  'bristol, city of': 'Bristol', 'bristol': 'Bristol',
  'nottingham': 'Nottingham', 'leicester': 'Leicester',
}

// --- Helper functions ---

async function getStreetFromPostcode(postcode: string): Promise<string> {
  try {
    // Format postcode with space (e.g., "E78NH" → "E7 8NH")
    let formatted = postcode.trim().toUpperCase()
    if (formatted.length > 3 && !formatted.includes(' ')) {
      formatted = formatted.slice(0, -3) + ' ' + formatted.slice(-3)
    }
    const headers = { 'User-Agent': 'ACE Investment Properties (property rental platform)' }

    // Step 1: Forward geocode postcode to get coordinates
    const fwdRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formatted + ', UK')}&format=json&limit=1&countrycodes=gb`,
      { headers }
    )
    if (!fwdRes.ok) return ''
    const fwdData = await fwdRes.json()
    if (!fwdData[0]?.lat || !fwdData[0]?.lon) return ''

    // Step 2: Reverse geocode coordinates to get street name
    const revRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${fwdData[0].lat}&lon=${fwdData[0].lon}&format=json&addressdetails=1`,
      { headers }
    )
    if (!revRes.ok) return ''
    const revData = await revRes.json()
    return revData.address?.road ?? ''
  } catch {
    return ''
  }
}

async function enrichPostcode(postcode: string) {
  const clean = postcode.replace(/\s+/g, '').toUpperCase()
  try {
    const [postcodeRes, street] = await Promise.all([
      fetch(`https://api.postcodes.io/postcodes/${clean}`),
      getStreetFromPostcode(clean),
    ])
    if (!postcodeRes.ok) {
      console.log(`[facebook-lead] Postcode lookup failed for ${clean}: ${postcodeRes.status}`)
      return { city: '', local_authority: '', region: '', postcode_clean: clean, street }
    }
    const json = await postcodeRes.json()
    const result = json.result
    const adminDistrict: string = result.admin_district ?? ''
    const city = adminDistrict
      ? (districtToCityMap[adminDistrict.toLowerCase()] ?? adminDistrict)
      : ''
    return {
      city,
      local_authority: adminDistrict,
      region: result.region ?? '',
      postcode_clean: result.postcode ?? clean,
      street,
    }
  } catch (err) {
    console.error('[facebook-lead] Postcode enrichment error:', err)
    return { city: '', local_authority: '', region: '', postcode_clean: clean, street: '' }
  }
}

async function updateGHLContact(contactId: string, fields: Record<string, string>) {
  const apiKey = process.env.GHL_API_KEY
  if (!apiKey) {
    console.log('[facebook-lead] GHL API key not configured, skipping contact update')
    return
  }

  try {
    const res = await fetch(`https://rest.gohighlevel.com/v1/contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ customField: fields }),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error(`[facebook-lead] GHL update failed (${res.status}):`, text)
    } else {
      console.log('[facebook-lead] GHL contact updated successfully')
    }
  } catch (err) {
    console.error('[facebook-lead] GHL update error:', err)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createOrFindLandlord(
  supabase: any,
  data: { email: string; name: string; phone: string; ghl_contact_id: string }
) {
  const { data: existing } = await supabase
    .from('landlords')
    .select('*')
    .eq('email', data.email)
    .single()

  if (existing) {
    // Update with latest info
    const { data: updated, error } = await supabase
      .from('landlords')
      .update({
        name: data.name || existing.name,
        phone: data.phone || existing.phone,
        ghl_contact_id: data.ghl_contact_id || existing.ghl_contact_id,
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      console.error('[facebook-lead] Landlord update error:', error)
      return existing
    }
    return updated
  }

  const { data: created, error } = await supabase
    .from('landlords')
    .insert({
      email: data.email,
      name: data.name,
      phone: data.phone,
      ghl_contact_id: data.ghl_contact_id,
      source: 'facebook',
    })
    .select()
    .single()

  if (error) {
    console.error('[facebook-lead] Landlord creation error:', error)
    throw new Error(`Failed to create landlord: ${error.message}`)
  }
  return created
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createPropertyListing(
  supabase: any,
  data: {
    address: string
    city: string
    local_authority: string
    postcode: string
    bedrooms: string
    bathrooms: string
    monthly_rent: number
    property_type: string
    available_date: string | null
    description: string
    contact_name: string
    contact_email: string
    contact_phone: string
  }
) {
  const { data: property, error } = await supabase
    .from('properties')
    .insert({
      landlord_id: null,
      address: data.address,
      city: data.city,
      local_authority: data.local_authority,
      postcode: data.postcode,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      monthly_rent: data.monthly_rent,
      property_type: data.property_type,
      available_date: data.available_date,
      description: data.description,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      status: 'draft',
      source: 'facebook',
      address_complete: false,
    })
    .select()
    .single()

  if (error) {
    console.error('[facebook-lead] Property creation error:', error)
    throw new Error(`Failed to create property: ${error.message}`)
  }
  return property
}

function parseAvailability(available: string | undefined): string | null {
  if (!available) return null
  const lower = available.toLowerCase().trim()
  if (lower === 'immediately' || lower === 'now') {
    return new Date().toISOString().split('T')[0]
  }
  // Try to parse as a date
  const parsed = new Date(available)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]
  }
  // Common patterns like "1 month", "2 weeks"
  const monthMatch = lower.match(/(\d+)\s*month/)
  if (monthMatch) {
    const d = new Date()
    d.setMonth(d.getMonth() + parseInt(monthMatch[1]))
    return d.toISOString().split('T')[0]
  }
  const weekMatch = lower.match(/(\d+)\s*week/)
  if (weekMatch) {
    const d = new Date()
    d.setDate(d.getDate() + parseInt(weekMatch[1]) * 7)
    return d.toISOString().split('T')[0]
  }
  return null
}

async function sendVerificationEmail(
  email: string,
  name: string,
  propertyTitle: string,
  token: string
) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://www.aceinvestmentproperties.co.uk' : 'http://localhost:3000'}/api/verify-email?token=${token}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a365d;">Verify Your Property Listing</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Thank you for submitting your property <strong>${propertyTitle}</strong> to Ace Investment Properties.</p>
      <p>Please verify your email address to activate your listing:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Verify Email
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
      <p style="color: #666; font-size: 14px;">If you didn't submit this listing, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">Ace Investment Properties</p>
    </div>
  `

  const result = await sendEmail({
    to: email,
    subject: `Verify your property listing - ${propertyTitle}`,
    html,
    from: 'Ace Properties <noreply@aceinvestmentproperties.co.uk>',
  })

  if (!result.success) {
    console.error('[facebook-lead] Verification email failed:', result.error)
  } else {
    console.log('[facebook-lead] Verification email sent to', email)
  }
}

async function sendAdminNotification(
  landlord: { name: string; email: string; phone: string },
  property: { id: string; address: string; monthly_rent: number; bedrooms: string; bathrooms: string; property_type: string },
  enriched: { city: string; local_authority: string; postcode_clean: string }
) {
  const result = await sendEmail({
    to: 'tmwebstudio1@gmail.com', // TODO: revert to admin@aceinvestmentproperties.co.uk after testing
    subject: `New Facebook Lead – ${property.address}`,
    from: 'Ace Properties <notifications@aceinvestmentproperties.co.uk>',
    react: NewProperty({
      submittedByName: landlord.name || 'N/A',
      submittedByEmail: landlord.email,
      submittedByPhone: landlord.phone || '—',
      dashboardLink: `${process.env.NEXT_PUBLIC_SITE_URL}/admin`,
      propertyAddress: property.address,
      propertyType: property.property_type || 'N/A',
      propertyPrice: (property.monthly_rent / 100).toLocaleString(),
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      availability: 'vacant',
      propertyLicence: 'none',
      propertyImage: '',
    }),
  })

  if (!result.success) {
    console.error('[facebook-lead] Admin email failed:', result.error)
  } else {
    console.log('[facebook-lead] Admin notification sent')
  }
}

function parseBedrooms(raw: string): string {
  if (!raw) return '1'
  const match = raw.match(/(\d+)/)
  if (match) return match[1]
  if (raw.toLowerCase().includes('studio')) return '0'
  return '1'
}

function parseRent(raw: string): string {
  if (!raw) return '0'
  const cleaned = raw.replace(/[£$,\s]/g, '').replace(/\/(month|mo|pcm|pw).*$/i, '')
  const match = cleaned.match(/(\d+)/)
  return match ? match[1] : '0'
}

// --- Main POST handler ---

export async function POST(request: NextRequest) {
  console.log('========== FACEBOOK LEAD WEBHOOK ==========')

  try {
    const body = await request.json()
    console.log('[facebook-lead] Full payload:', JSON.stringify(body, null, 2))
    console.log('[facebook-lead] Top-level keys:', Object.keys(body))

    // Extract from customData (programmatic keys) or human-readable GHL field names
    const cd = body.customData || {}

    const contactId = body.contact_id || body.contactId || cd.contact_id || body.id || ''
    const name = body.full_name || body.name || body.fullName || cd.name || body.first_name || body.contact_name || ''
    const email = body.email || cd.email || body.contact_email || ''
    const phone = body.phone || body.pone || cd.phone || body.contact_phone || body['Property Contact Phone'] || ''
    const postcode = cd.postcode || body['Property Postcode'] || body['Post Code']
      || body.postcode || body.postal_code || ''
    const rawBedrooms = cd.bedrooms || body['How Many Bedrooms Does The Property Have?']
      || body['Property Bedrooms'] || body.bedrooms || ''
    const bedrooms = parseBedrooms(rawBedrooms)
    const bathrooms = cd.bathrooms || body['Property Bathrooms'] || body.bathrooms || '1'
    const rawRent = cd.rent || body['Rental Price'] || body['Property Monthly Rent']
      || body.rent || body.monthly_rent || ''
    const rent = parseRent(rawRent)
    const propertyType = cd.property_type || body['Property Type'] || body.property_type || ''
    const available = cd.available || body['Property Availability?'] || body.available || body.availability || ''
    const availableDate = body['What date do you expect the property to be available for vacant possession or ready for occupation? (Please provide the exact date or your best estimate E.G. DAY/MONTH/YEAR)']
      || body['Property Available Date'] || body.available_date || ''
    const description = cd.description || body['Tell us a bit about the property']
      || body['Property Description'] || body.description || body.notes || ''
    const streetAddress = cd.address || body['Property Address'] || body['Street Address']
      || body.address || body.street_address || ''

    console.log('[facebook-lead] Extracted — email:', email, '| postcode:', postcode, '| name:', name, '| phone:', phone)

    if (!email) {
      console.error('[facebook-lead] No email provided. Received fields:', Object.keys(body))
      return NextResponse.json(
        { error: 'Email is required', received_fields: Object.keys(body), hint: 'Send email in the payload' },
        { status: 400 }
      )
    }

    if (!postcode) {
      console.warn('[facebook-lead] No postcode found. Received fields:', Object.keys(body))
      console.warn('[facebook-lead] Continuing without postcode — enrichment will be skipped')
    }

    // Step 1: Enrich postcode (skip if empty)
    const enriched = postcode
      ? await enrichPostcode(postcode)
      : { city: '', local_authority: '', region: '', postcode_clean: '', street: '' }
    console.log('[facebook-lead] Enriched postcode:', enriched)

    // Step 2: Build property title and address (same format as website)
    // Use GHL street address if provided, otherwise fall back to Google geocoded street
    const resolvedStreet = streetAddress || enriched.street
    const propertyTitle = formatPropertyTitle(resolvedStreet, enriched.city, enriched.postcode_clean)
    const propertyAddress = formatPropertyAddress(resolvedStreet, enriched.city, enriched.postcode_clean)

    // Step 3: Update GHL contact (non-critical)
    if (contactId) {
      try {
        await updateGHLContact(contactId, {
          property_title: propertyTitle,
          property_address: propertyAddress,
          property_city: enriched.city,
          property_local_authority: enriched.local_authority,
        })
      } catch (err) {
        console.error('[facebook-lead] GHL update failed (continuing):', err)
      }
    }

    // Step 4: Create Supabase client and create/find landlord
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const landlord = await createOrFindLandlord(supabase, {
      email,
      name,
      phone,
      ghl_contact_id: contactId,
    })
    console.log('[facebook-lead] Landlord:', landlord.id)

    // Step 5: Create property listing
    const property = await createPropertyListing(supabase, {
      address: propertyAddress,
      city: enriched.city,
      local_authority: enriched.local_authority,
      postcode: enriched.postcode_clean,
      bedrooms,
      bathrooms,
      monthly_rent: parseInt(rent || '0') * 100, // pounds → pence
      property_type: propertyType,
      available_date: parseAvailability(availableDate || available),
      description,
      contact_name: name,
      contact_email: email,
      contact_phone: phone,
    })
    console.log('[facebook-lead] Property created:', property.id)

    // Step 6: Create verification token (expires 24h)
    const { data: verificationToken, error: tokenError } = await supabase
      .from('verification_tokens')
      .insert({
        email,
        property_id: property.id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (tokenError) {
      console.error('[facebook-lead] Token creation error:', tokenError)
    }

    // Step 7: Send emails (non-critical)
    // TODO: Re-enable verification email once testing is complete
    // try {
    //   if (verificationToken) {
    //     await sendVerificationEmail(email, name, propertyTitle, verificationToken.token)
    //   }
    // } catch (err) {
    //   console.error('[facebook-lead] Verification email error:', err)
    // }
    console.log('[facebook-lead] Verification email SKIPPED (paused for testing)')

    try {
      await sendAdminNotification(
        { name, email, phone },
        property,
        enriched
      )
    } catch (err) {
      console.error('[facebook-lead] Admin email error:', err)
    }

    console.log('[facebook-lead] Webhook processed successfully')
    return NextResponse.json({ success: true, propertyId: property.id, landlordId: landlord.id })
  } catch (err) {
    console.error('[facebook-lead] Webhook error:', err)
    return NextResponse.json(
      { error: 'Internal server error', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
