"use client"

import { kentProperties, midlandsProperties } from "@/lib/sample-data"
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
  const featuredKentProperties = kentProperties.filter((property) => property.featured).slice(0, 6)
  const featuredMidlandsProperties = midlandsProperties.filter((property) => property.featured).slice(0, 6)
  const scrollRef = useRef<HTMLDivElement>(null)
  const kentScrollRef = useRef<HTMLDivElement>(null)
  const midlandsScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [kentCanScrollLeft, setKentCanScrollLeft] = useState(false)
  const [kentCanScrollRight, setKentCanScrollRight] = useState(true)
  const [midlandsCanScrollLeft, setMidlandsCanScrollLeft] = useState(false)
  const [midlandsCanScrollRight, setMidlandsCanScrollRight] = useState(true)

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const updateKentScrollButtons = () => {
    if (kentScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = kentScrollRef.current
      setKentCanScrollLeft(scrollLeft > 0)
      setKentCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const updateMidlandsScrollButtons = () => {
    if (midlandsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = midlandsScrollRef.current
      setMidlandsCanScrollLeft(scrollLeft > 0)
      setMidlandsCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
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

  const kentScrollLeft = () => {
    if (kentScrollRef.current) {
      const cardWidth = kentScrollRef.current.children[0]?.clientWidth || 0
      const gap = 12 // gap-3 = 0.75rem = 12px
      kentScrollRef.current.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' })
    }
  }

  const kentScrollRight = () => {
    if (kentScrollRef.current) {
      const cardWidth = kentScrollRef.current.children[0]?.clientWidth || 0
      const gap = 12 // gap-3 = 0.75rem = 12px
      kentScrollRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' })
    }
  }

  const midlandsScrollLeft = () => {
    if (midlandsScrollRef.current) {
      const cardWidth = midlandsScrollRef.current.children[0]?.clientWidth || 0
      const gap = 12 // gap-3 = 0.75rem = 12px
      midlandsScrollRef.current.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' })
    }
  }

  const midlandsScrollRight = () => {
    if (midlandsScrollRef.current) {
      const cardWidth = midlandsScrollRef.current.children[0]?.clientWidth || 0
      const gap = 12 // gap-3 = 0.75rem = 12px
      midlandsScrollRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const scrollContainer = scrollRef.current
    const kentScrollContainer = kentScrollRef.current
    const midlandsScrollContainer = midlandsScrollRef.current
    
    if (scrollContainer) {
      updateScrollButtons()
      scrollContainer.addEventListener('scroll', updateScrollButtons)
    }
    
    if (kentScrollContainer) {
      updateKentScrollButtons()
      kentScrollContainer.addEventListener('scroll', updateKentScrollButtons)
    }
    
    if (midlandsScrollContainer) {
      updateMidlandsScrollButtons()
      midlandsScrollContainer.addEventListener('scroll', updateMidlandsScrollButtons)
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', updateScrollButtons)
      }
      if (kentScrollContainer) {
        kentScrollContainer.removeEventListener('scroll', updateKentScrollButtons)
      }
      if (midlandsScrollContainer) {
        midlandsScrollContainer.removeEventListener('scroll', updateMidlandsScrollButtons)
      }
    }
  }, [])

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-5 md:mb-6">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2 md:mb-3">Rental Properties in London</h2>
            <p className="text-muted-foreground max-w-2xl text-base md:text-[17px]">
              Discover our handpicked selection of premium rental properties available now
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

        {/* Kent Properties Section */}
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
            ref={kentScrollRef}
            className="flex overflow-x-auto gap-3 pb-4 scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory'
            }}
          >
            {featuredKentProperties.map((property) => (
              <div 
                key={property.id} 
                className="flex-none w-4/5 sm:w-1/2 lg:w-[23.5%]" 
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
          
          {kentCanScrollLeft && (
            <button
              onClick={kentScrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg p-2 hover:bg-gray-50 transition-colors z-10"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          
          {kentCanScrollRight && (
            <button
              onClick={kentScrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg p-2 hover:bg-gray-50 transition-colors z-10"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Midlands Properties Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-5 md:mb-6">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2 md:mb-3">Rental Properties in the Midlands</h2>
            <p className="text-muted-foreground max-w-2xl text-base md:text-[17px]">
              Discover affordable rental properties in Birmingham, Nottingham, Leicester and Coventry
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
            ref={midlandsScrollRef}
            className="flex overflow-x-auto gap-3 pb-4 scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory'
            }}
          >
            {featuredMidlandsProperties.map((property) => (
              <div 
                key={property.id} 
                className="flex-none w-4/5 sm:w-1/2 lg:w-[23.5%]" 
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
          
          {midlandsCanScrollLeft && (
            <button
              onClick={midlandsScrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg p-2 hover:bg-gray-50 transition-colors z-10"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          
          {midlandsCanScrollRight && (
            <button
              onClick={midlandsScrollRight}
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
