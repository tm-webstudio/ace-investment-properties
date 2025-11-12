import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Helper function to get admin client at runtime
function getSupabaseAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Helper function to get regular client at runtime
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const DOCUMENT_TYPES = [
  { key: 'proof_of_ownership', label: 'Proof of Ownership' },
  { key: 'gas_safety', label: 'Gas Safety Certificate' },
  { key: 'epc', label: 'EPC Certificate' },
  { key: 'electrical_safety', label: 'Electrical Certificate' },
  { key: 'hmo_license', label: 'Licenses' }
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient()
    const supabaseAdmin = getSupabaseAdmin()

    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Service temporarily unavailable'
      }, { status: 503 })
    }

    // Get auth token from header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Verify user is admin
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profileError || userProfile?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Verify property exists
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('id, address, city, postcode')
      .eq('id', id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Get all documents for this property
    const { data: documents, error: docsError } = await supabaseAdmin
      .from('property_documents')
      .select('*')
      .eq('property_id', id)
      .order('uploaded_at', { ascending: false })

    if (docsError) {
      console.error('Error fetching documents:', docsError)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    // Group documents by type and generate signed URLs
    const documentsByType = await Promise.all(
      DOCUMENT_TYPES.map(async (docType) => {
        const doc = documents.find(d => d.document_type === docType.key)

        // If document exists, generate a signed URL
        if (doc && doc.storage_path) {
          try {
            const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
              .from('property-documents')
              .createSignedUrl(doc.storage_path, 3600) // URL valid for 1 hour

            if (signedUrlError) {
              console.error('Error creating signed URL:', signedUrlError)
              return {
                type: docType.key,
                label: docType.label,
                document: {
                  ...doc,
                  file_url: null,
                  error: 'Failed to generate download link'
                }
              }
            }

            return {
              type: docType.key,
              label: docType.label,
              document: {
                ...doc,
                file_url: signedUrlData.signedUrl
              }
            }
          } catch (error) {
            console.error('Error generating signed URL:', error)
            return {
              type: docType.key,
              label: docType.label,
              document: {
                ...doc,
                file_url: null,
                error: 'Failed to generate download link'
              }
            }
          }
        }

        return {
          type: docType.key,
          label: docType.label,
          document: null
        }
      })
    )

    return NextResponse.json({
      success: true,
      documents: documentsByType,
      property: property
    })

  } catch (error) {
    console.error('Error in get documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
