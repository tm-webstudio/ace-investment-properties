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

const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params

    // Verify property ownership
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('id, landlord_id')
      .eq('id', id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    if (property.landlord_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string
    const expiryDate = formData.get('expiryDate') as string | null

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPG, and PNG are allowed' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    if (!documentType) {
      return NextResponse.json(
        { error: 'Document type is required' },
        { status: 400 }
      )
    }

    // Check if document already exists for this type
    const { data: existingDoc } = await supabaseAdmin
      .from('property_documents')
      .select('id, storage_path')
      .eq('property_id', id)
      .eq('document_type', documentType)
      .single()

    // If exists, delete old file from storage
    if (existingDoc) {
      await supabaseAdmin.storage
        .from('property-documents')
        .remove([existingDoc.storage_path])

      // Delete old record
      await supabaseAdmin
        .from('property_documents')
        .delete()
        .eq('id', existingDoc.id)
    }

    // Generate unique file name
    const fileExtension = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${documentType}_${timestamp}.${fileExtension}`
    const storagePath = `${id}/${documentType}/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('property-documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Create document record
    const { data: document, error: docError } = await supabaseAdmin
      .from('property_documents')
      .insert({
        property_id: id,
        landlord_id: user.id,
        document_type: documentType,
        file_name: file.name,
        storage_path: storagePath,
        status: 'pending',
        expiry_date: expiryDate || null
      })
      .select()
      .single()

    if (docError) {
      console.error('Document record error:', docError)
      // Clean up uploaded file
      await supabaseAdmin.storage
        .from('property-documents')
        .remove([storagePath])

      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      document
    })

  } catch (error) {
    console.error('Error in upload document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
