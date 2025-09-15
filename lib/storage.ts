import { supabase } from '@/lib/supabase'

export interface UploadResult {
  publicUrl: string
  path: string
  error?: string
}

export interface ImageUploadOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  sessionId?: string
  userId?: string
}

// Allowed image types and sizes
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_IMAGES_PER_PROPERTY = 10

/**
 * Upload a single image to Supabase Storage
 */
export async function uploadPropertyImage(
  file: File,
  options: ImageUploadOptions = {}
): Promise<UploadResult> {
  try {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        publicUrl: '',
        path: '',
        error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
      }
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        publicUrl: '',
        path: '',
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 15)
    const filename = `${timestamp}_${randomStr}.${fileExt}`

    // Determine folder structure
    let folderPath: string
    if (options.userId) {
      // Authenticated user - organize by user ID
      folderPath = `${options.userId}/${filename}`
    } else if (options.sessionId) {
      // Anonymous user - organize by session ID
      folderPath = `anonymous/${options.sessionId}/${filename}`
    } else {
      // Fallback - temporary folder
      folderPath = `temp/${filename}`
    }

    // Process image if needed (resize, compress)
    const processedFile = await processImage(file, options)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(folderPath, processedFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (error) {
      console.error('Storage upload error:', error)
      return {
        publicUrl: '',
        path: '',
        error: `Upload failed: ${error.message}`
      }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(data.path)

    return {
      publicUrl: publicUrlData.publicUrl,
      path: data.path,
    }
  } catch (error: any) {
    console.error('Image upload error:', error)
    return {
      publicUrl: '',
      path: '',
      error: `Upload failed: ${error.message}`
    }
  }
}

/**
 * Upload multiple images concurrently
 */
export async function uploadMultipleImages(
  files: File[],
  options: ImageUploadOptions = {}
): Promise<UploadResult[]> {
  if (files.length > MAX_IMAGES_PER_PROPERTY) {
    throw new Error(`Maximum ${MAX_IMAGES_PER_PROPERTY} images allowed per property`)
  }

  const uploadPromises = files.map(file => uploadPropertyImage(file, options))
  return Promise.all(uploadPromises)
}

/**
 * Delete an image from storage
 */
export async function deletePropertyImage(imagePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from('property-images')
      .remove([imagePath])

    if (error) {
      console.error('Storage delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Image delete error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete multiple images from storage
 */
export async function deleteMultipleImages(imagePaths: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from('property-images')
      .remove(imagePaths)

    if (error) {
      console.error('Storage delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Images delete error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Process image: resize and compress if needed
 * Note: Server-side image processing requires different libraries
 * For now, return original file - client-side processing should be done in the browser
 */
async function processImage(file: File, options: ImageUploadOptions): Promise<File> {
  // Skip processing on server-side - return original file
  // TODO: Implement server-side image processing with Sharp or similar library
  return file
}

/**
 * Extract image path from public URL
 */
export function getImagePathFromUrl(publicUrl: string): string {
  const url = new URL(publicUrl)
  const pathParts = url.pathname.split('/')
  const bucketIndex = pathParts.indexOf('property-images')
  
  if (bucketIndex === -1) {
    throw new Error('Invalid property image URL')
  }
  
  return pathParts.slice(bucketIndex + 1).join('/')
}

/**
 * Validate image file on the client side
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`
    }
  }

  return { valid: true }
}

/**
 * Generate thumbnail URL from Supabase image URL
 */
export function getThumbnailUrl(publicUrl: string, width: number = 200, height: number = 200): string {
  // For now, return original URL. In production, you might want to use
  // image transformation service like Supabase Transform or Cloudinary
  return publicUrl
}

/**
 * Clean up orphaned images (images not referenced by any property or draft)
 */
export async function cleanupOrphanedImages(olderThanDays: number = 7): Promise<{ deleted: number; errors: string[] }> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    // Get all images from storage
    const { data: allFiles, error: listError } = await supabase.storage
      .from('property-images')
      .list('', { limit: 1000 })

    if (listError) {
      return { deleted: 0, errors: [listError.message] }
    }

    if (!allFiles) {
      return { deleted: 0, errors: [] }
    }

    // Get all image URLs from properties and drafts
    const { data: properties } = await supabase
      .from('properties')
      .select('photos')

    const { data: drafts } = await supabase
      .from('property_drafts')
      .select('step_3_data')

    const referencedPaths = new Set<string>()

    // Collect referenced paths from properties
    properties?.forEach(property => {
      property.photos?.forEach((url: string) => {
        try {
          const path = getImagePathFromUrl(url)
          referencedPaths.add(path)
        } catch (e) {
          // Invalid URL format, skip
        }
      })
    })

    // Collect referenced paths from drafts
    drafts?.forEach(draft => {
      draft.step_3_data?.photos?.forEach((url: string) => {
        try {
          const path = getImagePathFromUrl(url)
          referencedPaths.add(path)
        } catch (e) {
          // Invalid URL format, skip
        }
      })
    })

    // Find orphaned files
    const orphanedFiles = allFiles.filter(file => {
      const fileDate = new Date(file.created_at!)
      const isOld = fileDate < cutoffDate
      const isOrphaned = !referencedPaths.has(file.name)
      return isOld && isOrphaned
    })

    // Delete orphaned files
    const errors: string[] = []
    let deleted = 0

    for (const file of orphanedFiles) {
      const result = await deletePropertyImage(file.name)
      if (result.success) {
        deleted++
      } else {
        errors.push(`Failed to delete ${file.name}: ${result.error}`)
      }
    }

    return { deleted, errors }
  } catch (error: any) {
    return { deleted: 0, errors: [error.message] }
  }
}