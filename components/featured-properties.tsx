"use client"

import { sampleProperties } from "@/lib/sample-data"
import { PropertyCard } from "@/components/property-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"

export function FeaturedProperties() {
  const featuredProperties = sampleProperties.filter((property) => property.featured).slice(0, 6)
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
      const gap = 20 // gap-5 = 1.25rem = 20px
      scrollRef.current.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 0
      const gap = 20 // gap-5 = 1.25rem = 20px
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

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left space-y-4 mb-12">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">Rental Properties in London</h2>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Discover our handpicked selection of premium rental properties available now
          </p>
        </div>

        <div className="relative mb-12">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-5 pb-4 scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory'
            }}
          >
            {featuredProperties.map((property) => (
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
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-10"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-10"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

      </div>
    </section>
  )
}
