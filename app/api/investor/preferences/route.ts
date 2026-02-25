import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'
import NewInvestor from '@/emails/admin/new-investor'
import PropertyMatches from '@/emails/investor/property-matches'
import { getMatchedProperties } from '@/lib/propertyMatching'

// Create admin client for database operations (only if env vars are available)
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

// Create regular client for auth verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Fetch investor preferences
export async function GET(request: NextRequest) {
  try {
    // Check if admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Service temporarily unavailable' 
      }, { status: 503 })
    }

    // Get the authorization header
    const authorization = request.headers.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    
    // Verify the session with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Invalid or expired token' 
      }, { status: 401 })
    }

    // Get user profile and verify they are an investor
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ 
        error: 'User profile not found' 
      }, { status: 404 })
    }

    if (userProfile.user_type !== 'investor') {
      return NextResponse.json({ 
        error: 'This feature is for investors only' 
      }, { status: 403 })
    }

    // Get investor preferences
    const { data: preferences, error: prefError } = await supabaseAdmin
      .from('investor_preferences')
      .select('*')
      .eq('investor_id', user.id)
      .single()

    if (prefError && prefError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.error('Error fetching preferences:', prefError)
      return NextResponse.json({ 
        error: 'Failed to fetch preferences' 
      }, { status: 500 })
    }

    // Get match statistics if preferences exist
    let matchStats = null
    if (preferences) {
      try {
        // Count total matching properties (simplified for now)
        const { data: properties, error: propError } = await supabaseAdmin
          .from('properties')
          .select('*')
          .eq('status', 'active')

        if (!propError && properties) {
          // This would be replaced with actual matching logic
          const totalMatches = properties.length
          const newMatches = Math.floor(totalMatches * 0.1) // Simulate 10% new matches
          
          matchStats = {
            totalMatches,
            newMatches,
            lastUpdated: preferences.updated_at
          }
        }
      } catch (error) {
        console.error('Error calculating match stats:', error)
      }
    }

    return NextResponse.json({
      success: true,
      preferences: preferences || null,
      hasPreferences: !!preferences,
      matchStats
    })

  } catch (error) {
    console.error('Error in get preferences API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// POST - Create or update investor preferences
export async function POST(request: NextRequest) {
  try {
    // Check if admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Service temporarily unavailable' 
      }, { status: 503 })
    }

    // Get the authorization header
    const authorization = request.headers.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    
    // Verify the session with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Invalid or expired token' 
      }, { status: 401 })
    }

    // Get user profile and verify they are an investor
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_type, full_name, first_name, last_name, phone')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({
        error: 'User profile not found'
      }, { status: 404 })
    }

    if (userProfile.user_type !== 'investor') {
      return NextResponse.json({
        error: 'This feature is for investors only'
      }, { status: 403 })
    }

    // Check if this is first-time preferences (to avoid emailing on every update)
    const { data: existingPrefs } = await supabaseAdmin
      .from('investor_preferences')
      .select('investor_id')
      .eq('investor_id', user.id)
      .maybeSingle()

    const isNewInvestor = !existingPrefs

    // Parse request body
    const body = await request.json()
    const { 
      operator_type, 
      operator_type_other, 
      properties_managing, 
      preference_data,
      notification_enabled 
    } = body

    // Validate required fields
    if (!operator_type || !preference_data) {
      return NextResponse.json({
        error: 'operator_type and preference_data are required'
      }, { status: 400 })
    }

    // Validate operator_type
    const validOperatorTypes = ['sa_operator', 'supported_living', 'social_housing', 'other']
    if (!validOperatorTypes.includes(operator_type)) {
      return NextResponse.json({
        error: 'Invalid operator_type'
      }, { status: 400 })
    }

    // Check if operator_type_other is provided when operator_type is 'other'
    if (operator_type === 'other' && !operator_type_other) {
      return NextResponse.json({
        error: 'operator_type_other is required when operator_type is "other"'
      }, { status: 400 })
    }

    // Validate and normalize location data
    if (preference_data.locations && Array.isArray(preference_data.locations)) {
      preference_data.locations = preference_data.locations.map((loc: any) => {
        // Ensure we have localAuthorities array
        if (!loc.localAuthorities || !Array.isArray(loc.localAuthorities)) {
          if (loc.localAuthority) {
            // Convert singular to plural for consistency
            loc.localAuthorities = [loc.localAuthority]
            delete loc.localAuthority
          } else {
            throw new Error('Invalid location: localAuthorities required')
          }
        }

        // Validate required fields
        if (!loc.city || loc.localAuthorities.length === 0) {
          throw new Error('Invalid location: city and localAuthorities required')
        }

        // Filter out empty strings
        loc.localAuthorities = loc.localAuthorities.filter((auth: string) => auth && auth.trim())

        if (loc.localAuthorities.length === 0) {
          throw new Error('Invalid location: at least one local authority required')
        }

        return loc
      })
    }

    // Prepare data for upsert
    const preferencesData = {
      investor_id: user.id,
      operator_type,
      operator_type_other: operator_type === 'other' ? operator_type_other : null,
      properties_managing: properties_managing || 0,
      preference_data,
      notification_enabled: notification_enabled !== false, // Default to true
      is_active: true,
      updated_at: new Date().toISOString()
    }

    // Use upsert to create or update preferences
    const { data: upsertedPreferences, error: upsertError } = await supabaseAdmin
      .from('investor_preferences')
      .upsert(preferencesData, {
        onConflict: 'investor_id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Error upserting preferences:', upsertError)
      return NextResponse.json({ 
        error: 'Failed to save preferences' 
      }, { status: 500 })
    }

    // Send admin notification on first signup (non-blocking)
    if (isNewInvestor) {
      try {
        const investorName = userProfile.full_name ||
          [userProfile.first_name, userProfile.last_name].filter(Boolean).join(' ') ||
          user.email

        const pref = preference_data || {}
        const locationNames = (pref.locations || [])
          .map((loc: any) => loc.city || '')
          .filter(Boolean)

        await sendEmail({
          to: process.env.ADMIN_EMAIL || 'tmwebstudio1@gmail.com',
          subject: 'New Investor Registered',
          react: NewInvestor({
            investorName,
            investorEmail: user.email,
            investorPhone: userProfile.phone || '—',
            operatorType: operator_type,
            budgetMin: pref.budgetMin || 0,
            budgetMax: pref.budgetMax || 0,
            budgetType: pref.budgetType || 'monthly',
            bedroomsMin: pref.bedroomsMin || 0,
            bedroomsMax: pref.bedroomsMax || 0,
            propertyTypes: pref.propertyTypes || [],
            propertyLicences: pref.propertyLicences || [],
            locations: locationNames,
            propertiesManaging: properties_managing || 0,
            dashboardLink: `${process.env.NEXT_PUBLIC_SITE_URL}/admin`
          })
        })
      } catch (emailError) {
        console.error('Admin investor notification failed:', emailError)
      }

      // Send initial matches email to the new investor (non-blocking)
      try {
        const investorEmail = user.email
        const investorName = userProfile.full_name ||
          [userProfile.first_name, userProfile.last_name].filter(Boolean).join(' ') ||
          investorEmail

        const { properties: matches } = await getMatchedProperties(user.id, { minScore: 75, limit: 5 })

        if (matches.length > 0) {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aceinvestmentproperties.co.uk'
          const propertyItems = matches.map((item: any) => ({
            propertyType: item.property_type || 'Property',
            bedrooms: parseInt(item.bedrooms) || 0,
            bathrooms: parseInt(item.bathrooms) || 0,
            propertyAddress: item.title,
            propertyImage: item.photos?.[0] || '',
            propertyPrice: item.price?.toLocaleString() || '0',
            availability: item.availability || 'vacant',
            propertyLicence: item.property_licence || 'none',
            condition: item.property_condition || 'good',
            matchScore: item.matchScore,
            propertyUrl: `${siteUrl}/properties/${item.id}`,
          }))

          const count = propertyItems.length
          const propertyWord = count === 1 ? 'property' : 'properties'

          await sendEmail({
            to: investorEmail,
            subject: `We found ${count} ${propertyWord} matching your criteria`,
            react: PropertyMatches({
              investorName,
              context: 'welcome',
              properties: propertyItems,
              dashboardLink: `${siteUrl}/investor/dashboard`,
              totalMatches: count,
            }),
          })
        }
      } catch (matchEmailError) {
        console.error('Initial matches email failed:', matchEmailError)
      }
    }

    return NextResponse.json({
      success: true,
      preferences: upsertedPreferences,
      message: 'Preferences saved successfully'
    })

  } catch (error) {
    console.error('Error in save preferences API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}