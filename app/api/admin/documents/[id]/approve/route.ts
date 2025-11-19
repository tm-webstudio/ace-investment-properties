import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { id: documentId } = await params

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify the user is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Update the document status to approved
    const { error: updateError } = await supabase
      .from('property_documents')
      .update({ status: 'approved' })
      .eq('id', documentId)

    if (updateError) {
      console.error('Error approving document:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to approve document' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Document approved successfully'
    })

  } catch (error) {
    console.error('Error in document approval API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
