"use client"

import { sampleProperties, kentProperties, midlandsProperties } from "@/lib/sample-data"
import { PropertyCard } from "@/components/property-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"

interface SimilarPropertiesProps {
  currentPropertyId: string
  propertyType: string
}

export function SimilarProperties({ currentPropertyId, propertyType }: SimilarPropertiesProps) {
  // Combine all property arrays
  const allProperties = [...sampleProperties, ...kentProperties, ...midlandsProperties]
  
  const similarProperties = allProperties
    .filter((property) => property.id !== currentPropertyId && property.propertyType === propertyType)
    .slice(0, 8)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 0
      const gap = 16 // gap-4 = 1rem = 16px
      scrollRef.current.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 0
      const gap = 16 // gap-4 = 1rem = 16px
      scrollRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (scrollContainer) {
      updateScrollButtons()
      scrollContainer.addEventListener('scroll', updateScrollButtons)
      return () => scrollContainer.removeEventListener('scroll', updateScrollButtons)
    }
  }, [])

  if (similarProperties.length === 0) {
    return null
  }

  return (
    <section className="mt-16">
      <div className="mb-5 md:mb-6">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2 md:mb-3">Similar Properties</h2>
        <p className="text-muted-foreground text-base md:text-[17px]">
          Other {propertyType} properties you might be interested in
        </p>
      </div>

      <div className="relative mb-12">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 pb-4 scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory'
          }}
        >
          {similarProperties.map((property) => (
            <div 
              key={property.id} 
              className="flex-none w-4/5 sm:w-1/2 lg:w-[30.77%]" 
              style={{ scrollSnapAlign: 'start' }}
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
        
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg p-2 hover:bg-gray-50 transition-colors z-10"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg p-2 hover:bg-gray-50 transition-colors z-10"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </section>
  )
}
