"use client"

import { PropertyCard } from "@/components/property-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"

interface SimilarPropertiesProps {
  currentPropertyId: string
  propertyType: string
}

export function SimilarProperties({ currentPropertyId, propertyType }: SimilarPropertiesProps) {
  const [similarProperties, setSimilarProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSimilarProperties() {
      try {
        setLoading(true)

        // If propertyType is not provided, fetch all properties
        if (!propertyType) {
          console.warn('No property type provided for similar properties')
          setLoading(false)
          return
        }

        // Map old property types to new ones
        const propertyTypeMap: Record<string, string> = {
          'Studio': 'studio',
          'studio': 'studio',
          '1BR': '1-bedroom',
          '1-bedroom': '1-bedroom',
          '2BR': '2-bedroom',
          '2-bedroom': '2-bedroom',
          '3BR+': '3-bedroom',
          '3-bedroom': '3-bedroom',
          '4-bedroom': '4-bedroom',
          'House': 'house',
          'house': 'house'
        }

        const mappedPropertyType = propertyTypeMap[propertyType] || propertyType.toLowerCase()

        console.log('Fetching similar properties:', {
          originalType: propertyType,
          mappedType: mappedPropertyType,
          currentPropertyId
        })

        // Fetch properties from API with property type filter
        const response = await fetch(`/api/properties?status=active&propertyType=${mappedPropertyType}&limit=20`)

        if (!response.ok) {
          throw new Error('Failed to fetch properties')
        }

        const data = await response.json()

        console.log('API response:', data)

        if (data.success && data.properties) {
          // Filter out current property and limit to 8
          let filtered = data.properties
            .filter((property: any) => property.id !== currentPropertyId)
            .slice(0, 8)
            .map((property: any) => ({
              ...property,
              price: property.monthly_rent,
              images: property.photos || [],
              propertyType: propertyType,
              landlordName: property.landlord?.full_name || property.landlord?.company_name || 'ACE Investment Properties',
              landlordPhone: '+44 748 048 5707',
              landlordEmail: 'info@aceproperties.co.uk'
            }))

          console.log('Filtered similar properties:', filtered.length)

          // If no properties found with the specific type, fetch any active properties
          if (filtered.length === 0) {
            console.log('No properties found with specific type, fetching all active properties')
            const fallbackResponse = await fetch(`/api/properties?status=active&limit=9`)
            const fallbackData = await fallbackResponse.json()

            if (fallbackData.success && fallbackData.properties) {
              filtered = fallbackData.properties
                .filter((property: any) => property.id !== currentPropertyId)
                .slice(0, 8)
                .map((property: any) => ({
                  ...property,
                  price: property.monthly_rent,
                  images: property.photos || [],
                  propertyType: property.property_type || propertyType,
                  landlordName: property.landlord?.full_name || property.landlord?.company_name || 'ACE Investment Properties',
                  landlordPhone: '+44 748 048 5707',
                  landlordEmail: 'info@aceproperties.co.uk'
                }))
            }
          }

          setSimilarProperties(filtered)
        }
      } catch (error) {
        console.error('Error fetching similar properties:', error)
        setSimilarProperties([])
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarProperties()
  }, [currentPropertyId, propertyType])
  
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
      return () => scrollContainer.removeEventListener('scroll', updateScrollButtons)
    }
  }, [])

  if (loading) {
    return (
      <section className="mt-16">
        <div className="mb-5 md:mb-6">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2 md:mb-3">Similar Properties</h2>
          <p className="text-muted-foreground text-base md:text-[17px]">
            Loading similar properties...
          </p>
        </div>
        <div className="flex overflow-x-auto gap-3 pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-none w-4/5 sm:w-1/2 lg:w-[23.5%]">
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
          ))}
        </div>
      </section>
    )
  }

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
          className="flex overflow-x-auto gap-3 pb-4 scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory'
          }}
        >
          {similarProperties.map((property) => (
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
