"use client"

import { PropertyCard } from "@/components/property-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"

interface Property {
  id: string
  title: string
  price: number
  deposit: number
  address: string
  city: string
  county: string
  bedrooms: number
  bathrooms: number
  propertyType: string
  description: string
  amenities: string[]
  images: string[]
  availableDate: string
  featured: boolean
}

export function FeaturedProperties() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
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


  // Fetch real properties from database
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/properties/featured')
        const data = await response.json()
        
        if (data.success) {
          setFeaturedProperties(data.properties.slice(0, 6)) // Limit to 6 for carousel
        }
      } catch (error) {
        console.error('Error fetching featured properties:', error)
        // Fallback to empty array if API fails
        setFeaturedProperties([])
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const scrollLeft = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 0
      const gap = 12 // gap-3 = 0.75rem = 12px
      scrollRef.current.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 0
      const gap = 12 // gap-3 = 0.75rem = 12px
      scrollRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' })
    }
  }


  useEffect(() => {
    const scrollContainer = scrollRef.current
    
    if (scrollContainer) {
      updateScrollButtons()
      scrollContainer.addEventListener('scroll', updateScrollButtons)
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', updateScrollButtons)
      }
    }
  }, [])

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-5 md:mb-6">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2 md:mb-3">Newly Added Properties</h2>
            <p className="text-muted-foreground max-w-2xl text-base md:text-[17px]">
              Discover our handpicked selection of premium rental properties available now
            </p>
          </div>
        </div>

        <div className="relative mb-12">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-3 pb-4 scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory'
            }}
          >
            {loading ? (
              // Loading skeleton
              [...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className="flex-none w-4/5 sm:w-1/2 lg:w-[23.5%]"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="border rounded-none overflow-hidden">
                    <div className="h-48 bg-gray-300 animate-pulse"></div>
                    <div className="p-4 space-y-3">
                      <div className="space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                      <div className="flex gap-4">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : featuredProperties.length > 0 ? (
              featuredProperties.map((property) => (
                <div 
                  key={property.id} 
                  className="flex-none w-4/5 sm:w-1/2 lg:w-[23.5%]" 
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <PropertyCard property={property} />
                </div>
              ))
            ) : (
              // No properties message
              <div className="flex-none w-full text-center py-12">
                <p className="text-muted-foreground">No properties available at the moment.</p>
              </div>
            )}
          </div>
          
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {!loading && canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg p-2 hover:bg-gray-50 transition-colors z-10"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          
          {!loading && canScrollRight && (
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
