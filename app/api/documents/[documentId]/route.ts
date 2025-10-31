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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string } }
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

    const { documentId } = params

    // Get document
    const { data: document, error: docError } = await supabaseAdmin
      .from('property_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (document.landlord_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete file from storage
    const { error: storageError } = await supabaseAdmin.storage
      .from('property-documents')
      .remove([document.storage_path])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
    }

    // Delete document record
    const { error: deleteError } = await supabaseAdmin
      .from('property_documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      console.error('Document deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    })

  } catch (error) {
    console.error('Error in delete document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
