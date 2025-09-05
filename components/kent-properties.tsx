"use client"

import { kentProperties } from "@/lib/sample-data"
import { PropertyCard } from "@/components/property-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"

export function KentProperties() {
  const featuredKentProperties = kentProperties.filter((property) => property.featured).slice(0, 6)
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

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-5 md:mb-6">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2 md:mb-3">Rental Properties in Kent</h2>
            <p className="text-muted-foreground max-w-2xl text-base md:text-[17px]">
              Explore our curated selection of rental properties in beautiful Kent countryside
            </p>
          </div>
          <div className="hidden md:block">
            <Link href="/properties">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white">
                View All
              </Button>
            </Link>
          </div>
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
            {featuredKentProperties.map((property) => (
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
      </div>
    </section>
  )
}