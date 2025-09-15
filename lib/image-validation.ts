import { NextRequest } from 'next/server'

export interface ImageValidationResult {
  valid: boolean
  error?: string
  details?: string[]
}

// Image validation constants
export const IMAGE_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_FILE_SIZE: 1024, // 1KB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_IMAGES_PER_UPLOAD: 10,
  MAX_IMAGES_PER_PROPERTY: 15,
  MIN_DIMENSIONS: { width: 200, height: 200 },
  MAX_DIMENSIONS: { width: 4096, height: 4096 },
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp']
}

/**
 * Validate image files from form data
 */
export async function validateImageFiles(files: File[]): Promise<ImageValidationResult> {
  if (!files || files.length === 0) {
    return { valid: false, error: 'No files provided' }
  }

  if (files.length > IMAGE_CONSTRAINTS.MAX_IMAGES_PER_UPLOAD) {
    return {
      valid: false,
      error: `Too many files. Maximum ${IMAGE_CONSTRAINTS.MAX_IMAGES_PER_UPLOAD} images per upload`
    }
  }

  const errors: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileValidation = await validateSingleImageFile(file, i + 1)
    
    if (!fileValidation.valid) {
      errors.push(fileValidation.error || `File ${i + 1} is invalid`)
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      error: 'File validation failed',
      details: errors
    }
  }

  return { valid: true }
}

/**
 * Validate a single image file
 */
export async function validateSingleImageFile(file: File, fileIndex?: number): Promise<ImageValidationResult> {
  const prefix = fileIndex ? `File ${fileIndex}` : 'File'

  // Check if file exists
  if (!file) {
    return { valid: false, error: `${prefix}: No file provided` }
  }

  // Check file size
  if (file.size > IMAGE_CONSTRAINTS.MAX_FILE_SIZE) {
    const sizeMB = Math.round(IMAGE_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024))
    return {
      valid: false,
      error: `${prefix}: File too large (${Math.round(file.size / (1024 * 1024))}MB). Maximum size: ${sizeMB}MB`
    }
  }

  if (file.size < IMAGE_CONSTRAINTS.MIN_FILE_SIZE) {
    return {
      valid: false,
      error: `${prefix}: File too small (${file.size} bytes). Minimum size: 1KB`
    }
  }

  // Check MIME type
  if (!IMAGE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `${prefix}: Invalid file type (${file.type}). Allowed: ${IMAGE_CONSTRAINTS.ALLOWED_TYPES.join(', ')}`
    }
  }

  // Check file extension
  const extension = file.name.toLowerCase().split('.').pop()
  if (!extension || !IMAGE_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(`.${extension}`)) {
    return {
      valid: false,
      error: `${prefix}: Invalid file extension. Allowed: ${IMAGE_CONSTRAINTS.ALLOWED_EXTENSIONS.join(', ')}`
    }
  }

  // Check for potentially malicious files
  const maliciousCheck = await checkForMaliciousContent(file)
  if (!maliciousCheck.valid) {
    return maliciousCheck
  }

  // Validate image dimensions (if in browser environment)
  if (typeof window !== 'undefined') {
    try {
      const dimensions = await getImageDimensions(file)
      
      if (dimensions.width < IMAGE_CONSTRAINTS.MIN_DIMENSIONS.width || 
          dimensions.height < IMAGE_CONSTRAINTS.MIN_DIMENSIONS.height) {
        return {
          valid: false,
          error: `${prefix}: Image too small (${dimensions.width}x${dimensions.height}). Minimum: ${IMAGE_CONSTRAINTS.MIN_DIMENSIONS.width}x${IMAGE_CONSTRAINTS.MIN_DIMENSIONS.height}`
        }
      }

      if (dimensions.width > IMAGE_CONSTRAINTS.MAX_DIMENSIONS.width || 
          dimensions.height > IMAGE_CONSTRAINTS.MAX_DIMENSIONS.height) {
        return {
          valid: false,
          error: `${prefix}: Image too large (${dimensions.width}x${dimensions.height}). Maximum: ${IMAGE_CONSTRAINTS.MAX_DIMENSIONS.width}x${IMAGE_CONSTRAINTS.MAX_DIMENSIONS.height}`
        }
      }
    } catch (error) {
      return {
        valid: false,
        error: `${prefix}: Invalid or corrupted image file`
      }
    }
  }

  return { valid: true }
}

/**
 * Get image dimensions from file
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Check for potentially malicious content
 */
async function checkForMaliciousContent(file: File): Promise<ImageValidationResult> {
  // Check file name for suspicious patterns
  const suspiciousPatterns = [
    /\.php$/i,
    /\.js$/i,
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.vbs$/i,
    /\.sh$/i,
    /<script/i,
    /<iframe/i,
    /javascript:/i
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return {
        valid: false,
        error: 'File name contains suspicious patterns'
      }
    }
  }

  // For additional security, you might want to:
  // 1. Check file headers/magic bytes
  // 2. Scan for embedded scripts
  // 3. Use a virus scanning service
  // 4. Strip EXIF data

  return { valid: true }
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  // Remove or replace dangerous characters
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace non-alphanumeric with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .toLowerCase()
}

/**
 * Generate secure filename
 */
export function generateSecureFileName(originalName: string, userId?: string, sessionId?: string): string {
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 12)
  const userPrefix = userId ? userId.substring(0, 8) : (sessionId ? sessionId.substring(0, 8) : 'anon')
  
  return `${userPrefix}_${timestamp}_${random}.${extension}`
}

/**
 * Validate total images for a property
 */
export function validateImageCount(currentImageUrls: string[], newImageCount: number): ImageValidationResult {
  const totalImages = currentImageUrls.length + newImageCount

  if (totalImages > IMAGE_CONSTRAINTS.MAX_IMAGES_PER_PROPERTY) {
    return {
      valid: false,
      error: `Too many images. Maximum ${IMAGE_CONSTRAINTS.MAX_IMAGES_PER_PROPERTY} images per property. Current: ${currentImageUrls.length}, Adding: ${newImageCount}`
    }
  }

  return { valid: true }
}

/**
 * Middleware-style image validation for API routes
 */
export async function validateRequestImages(request: NextRequest): Promise<ImageValidationResult> {
  try {
    const contentType = request.headers.get('content-type')
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return {
        valid: false,
        error: 'Content-Type must be multipart/form-data for file uploads'
      }
    }

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]

    if (!files || files.length === 0) {
      return {
        valid: false,
        error: 'No images found in request'
      }
    }

    return await validateImageFiles(files)
  } catch (error: any) {
    return {
      valid: false,
      error: `Request validation failed: ${error.message}`
    }
  }
}

/**
 * Image security headers for responses
 */
export const IMAGE_SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'none'",
  'Cache-Control': 'public, max-age=31536000, immutable'
}