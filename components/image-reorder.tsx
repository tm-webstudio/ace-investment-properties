'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, GripVertical, Star, StarOff } from 'lucide-react'

interface ImageReorderProps {
  images: (File | string)[]
  primaryImageIndex: number
  onImagesReorder: (images: (File | string)[]) => void
  onPrimaryImageChange: (index: number) => void
  onImageRemove: (index: number) => void
  disabled?: boolean
}

export function ImageReorder({
  images,
  primaryImageIndex,
  onImagesReorder,
  onPrimaryImageChange,
  onImageRemove,
  disabled = false
}: ImageReorderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    if (disabled) return
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', '')
  }

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    if (disabled || draggedIndex === null) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (targetIndex: number) => (e: React.DragEvent) => {
    if (disabled || draggedIndex === null) return
    e.preventDefault()
    
    if (draggedIndex === targetIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newImages = [...images]
    const draggedItem = newImages[draggedIndex]
    
    // Remove dragged item
    newImages.splice(draggedIndex, 1)
    
    // Insert at new position
    const insertIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex
    newImages.splice(insertIndex, 0, draggedItem)
    
    // Update primary image index if needed
    let newPrimaryIndex = primaryImageIndex
    if (draggedIndex === primaryImageIndex) {
      // Primary image was moved
      newPrimaryIndex = insertIndex
    } else if (draggedIndex < primaryImageIndex && insertIndex >= primaryImageIndex) {
      // Image moved from before primary to after primary
      newPrimaryIndex = primaryImageIndex - 1
    } else if (draggedIndex > primaryImageIndex && insertIndex <= primaryImageIndex) {
      // Image moved from after primary to before primary
      newPrimaryIndex = primaryImageIndex + 1
    }
    
    onImagesReorder(newImages)
    onPrimaryImageChange(newPrimaryIndex)
    
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const getImageSrc = (image: File | string): string => {
    return typeof image === 'string' ? image : URL.createObjectURL(image)
  }

  if (images.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        <p>No images uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Property Photos ({images.length}/10)</h4>
        <p className="text-sm text-muted-foreground">
          Drag to reorder • Click star to set as primary
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            draggable={!disabled}
            onDragStart={handleDragStart(index)}
            onDragOver={handleDragOver(index)}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={`
              relative group cursor-move rounded-lg overflow-hidden
              transition-all duration-200 ease-in-out
              ${draggedIndex === index ? 'opacity-50 scale-95 rotate-3' : ''}
              ${dragOverIndex === index && draggedIndex !== index ? 'ring-2 ring-primary ring-offset-2' : ''}
              ${disabled ? 'cursor-not-allowed opacity-60' : ''}
            `}
          >
            {/* Drag Handle */}
            {!disabled && (
              <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 rounded p-1">
                  <GripVertical className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
            
            {/* Primary Badge */}
            {index === primaryImageIndex && (
              <Badge className="absolute top-2 right-12 z-10 bg-yellow-500 text-yellow-50">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Primary
              </Badge>
            )}
            
            {/* Remove Button */}
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={() => onImageRemove(index)}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Set Primary Button */}
            {index !== primaryImageIndex && (
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                onClick={() => onPrimaryImageChange(index)}
                disabled={disabled}
                title="Set as primary image"
              >
                <StarOff className="h-4 w-4" />
              </Button>
            )}
            
            {/* Image */}
            <div className="aspect-video bg-muted">
              <img
                src={getImageSrc(image)}
                alt={`Property photo ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg'
                }}
                draggable={false}
              />
            </div>
            
            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="text-white text-sm font-medium">
                Photo {index + 1}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Drag Instructions */}
      {images.length > 1 && !disabled && (
        <div className="text-center text-sm text-muted-foreground">
          <p>💡 Tip: The primary image will be shown first in property listings</p>
        </div>
      )}
    </div>
  )
}