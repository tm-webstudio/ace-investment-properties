import { NextRequest, NextResponse } from 'next/server'
import { optionalAuth, rateLimit } from '@/lib/middleware'
import { uploadMultipleImages, validateImageFile, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting - 20 uploads per minute
    const rateLimitResult = rateLimit(60000, 20)(request)
    if (rateLimitResult) return rateLimitResult

    const req = await optionalAuth(request)
    
    // Check content type
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data for file uploads' },
        { status: 400 }
      )
    }
    
    // Parse form data
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    const sessionId = formData.get('sessionId') as string
    const draftId = formData.get('draftId') as string

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    // Validate session or draft access
    if (!sessionId && !draftId) {
      return NextResponse.json(
        { error: 'Session ID or draft ID is required' },
        { status: 400 }
      )
    }

    // Validate each file before processing
    const validationErrors: string[] = []
    files.forEach((file, index) => {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        validationErrors.push(`File ${index + 1}: ${validation.error}`)
      }
    })

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'File validation failed',
          details: validationErrors
        },
        { status: 400 }
      )
    }

    // Upload images
    const uploadOptions = {
      userId: req.user?.id,
      sessionId: sessionId || undefined,
      quality: 0.9,
      maxWidth: 1920,
      maxHeight: 1080
    }

    const uploadResults = await uploadMultipleImages(files, uploadOptions)

    // Check for upload errors
    const errors = uploadResults.filter(result => result.error)
    const successful = uploadResults.filter(result => !result.error)

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Some uploads failed',
          successful: successful.length,
          failed: errors.length,
          errors: errors.map(e => e.error),
          images: successful.map(r => ({
            url: r.publicUrl,
            path: r.path
          }))
        },
        { status: 207 } // Multi-status
      )
    }

    return NextResponse.json({
      success: true,
      count: successful.length,
      images: successful.map(result => ({
        url: result.publicUrl,
        path: result.path
      }))
    })

  } catch (error: any) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    )
  }
}

// Get upload configuration
export async function GET() {
  return NextResponse.json({
    allowedTypes: ALLOWED_IMAGE_TYPES,
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: Math.round(MAX_FILE_SIZE / (1024 * 1024)),
    maxImagesPerProperty: 10
  })
}