"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Grid3X3, Share } from "lucide-react"
import { SavePropertyButton } from "./save-property-button"

interface PropertyGalleryProps {
  images: string[]
  title: string
  propertyId?: string
}

export function PropertyGallery({ images, title, propertyId }: PropertyGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [mobileCurrentImage, setMobileCurrentImage] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const slideRef = useRef<HTMLDivElement>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && mobileCurrentImage < images.length - 1) {
      setMobileCurrentImage((prev) => prev + 1)
    }
    if (isRightSwipe && mobileCurrentImage > 0) {
      setMobileCurrentImage((prev) => prev - 1)
    }
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="space-y-4">
      {/* Mobile Gallery - Slideshow */}
      <div className="md:hidden">
        <div
          className="relative h-64 overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          ref={slideRef}
        >
          <div
            className="flex transition-transform duration-300 ease-out h-full"
            style={{ transform: `translateX(-${mobileCurrentImage * 100}%)` }}
          >
            {images.map((image, index) => (
              <div key={index} className="w-full h-full flex-shrink-0 relative">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${title} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Pagination dots for mobile */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === mobileCurrentImage ? "bg-white" : "bg-white/50"
                }`}
                onClick={() => setMobileCurrentImage(index)}
              />
            ))}
          </div>

        </div>
      </div>

      {/* Main Gallery */}
      <div className="hidden md:grid grid-cols-4 gap-4 h-[500px]">
        {/* Main Image */}
        <div className="col-span-3 relative group cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
          <Image src={images[0] || "/placeholder.svg"} alt={title} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Thumbnail Grid */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }, (_, index) => {
            const imageIndex = index + 1;
            const image = images[imageIndex];
            const hasImage = Boolean(image);
            
            return (
              <div
                key={index}
                className={`relative flex-1 ${hasImage ? 'cursor-pointer group' : ''}`}
                onClick={() => {
                  if (hasImage) {
                    setCurrentImage(imageIndex)
                    setIsLightboxOpen(true)
                  }
                }}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={hasImage ? `${title} - Image ${imageIndex + 1}` : "No image available"}
                  fill
                  className={`object-cover ${!hasImage ? 'opacity-30' : ''}`}
                />
                {!hasImage && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 rounded"></div>
                      <span className="text-xs">No Image</span>
                    </div>
                  </div>
                )}
                {hasImage && <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />}
                {index === 1 && images.length > 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Grid3X3 className="h-8 w-8 mx-auto mb-2" />
                      <span className="text-lg font-semibold">+{images.length - 3} more</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setIsLightboxOpen(true)} className="bg-transparent rounded-none">
          <Grid3X3 className="mr-2 h-4 w-4" />
          View All Photos ({images.length})
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="bg-transparent rounded-none">
            <Share className="h-4 w-4" />
          </Button>
          {propertyId && (
            <SavePropertyButton
              propertyId={propertyId}
              size="medium"
              variant="outline"
              className="bg-transparent rounded-none"
            />
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <DialogTitle className="sr-only">{title} - Image Gallery</DialogTitle>
          <div className="relative w-full h-full">
            <Image
              src={images[currentImage] || "/placeholder.svg"}
              alt={`${title} - Image ${currentImage + 1}`}
              fill
              className="object-contain"
            />

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 text-sm">
              {currentImage + 1} / {images.length}
            </div>

            {/* Thumbnail Strip */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-center">
              <div className="flex gap-2 max-w-md overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`relative w-16 h-12 flex-shrink-0 overflow-hidden ${
                      index === currentImage ? "ring-2 ring-white" : ""
                    }`}
                    onClick={() => setCurrentImage(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
