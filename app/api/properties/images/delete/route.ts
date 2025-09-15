import { NextRequest, NextResponse } from 'next/server'
import { optionalAuth, rateLimit } from '@/lib/middleware'
import { deleteMultipleImages, getImagePathFromUrl } from '@/lib/storage'
import { supabase } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    // Apply rate limiting - 30 deletions per minute
    const rateLimitResult = rateLimit(60000, 30)(request)
    if (rateLimitResult) return rateLimitResult

    const req = await optionalAuth(request)
    const body = await request.json()
    
    const { imageUrls, sessionId, draftId } = body

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'No image URLs provided' },
        { status: 400 }
      )
    }

    if (!sessionId && !draftId) {
      return NextResponse.json(
        { error: 'Session ID or draft ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership if user is authenticated
    if (req.user && draftId) {
      const { data: draft, error } = await supabase
        .from('property_drafts')
        .select('user_id, session_id')
        .eq('id', draftId)
        .single()

      if (error || !draft) {
        return NextResponse.json(
          { error: 'Draft not found' },
          { status: 404 }
        )
      }

      // Check if user owns the draft
      if (draft.user_id && draft.user_id !== req.user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }

      // For anonymous drafts, check session ID
      if (!draft.user_id && draft.session_id !== sessionId) {
        return NextResponse.json(
          { error: 'Invalid session' },
          { status: 403 }
        )
      }
    }

    // Extract image paths from URLs
    const imagePaths: string[] = []
    const invalidUrls: string[] = []

    imageUrls.forEach((url: string) => {
      try {
        const path = getImagePathFromUrl(url)
        imagePaths.push(path)
      } catch (error) {
        invalidUrls.push(url)
      }
    })

    if (invalidUrls.length > 0) {
      return NextResponse.json(
        {
          error: 'Some URLs are invalid',
          invalidUrls
        },
        { status: 400 }
      )
    }

    // Delete images from storage
    const deleteResult = await deleteMultipleImages(imagePaths)

    if (!deleteResult.success) {
      return NextResponse.json(
        { error: deleteResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      deleted: imagePaths.length,
      message: `${imagePaths.length} image(s) deleted successfully`
    })

  } catch (error: any) {
    console.error('Image deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete images' },
      { status: 500 }
    )
  }
}