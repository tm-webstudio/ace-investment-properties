"use client"

import { useState, use, useEffect } from "react"
import { notFound } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PropertyGallery } from "@/components/property-gallery"
import { PropertyDetails } from "@/components/property-details"
import { LandlordCard } from "@/components/landlord-card"
import { SimilarProperties } from "@/components/similar-properties"
import { ApplicationModal } from "@/components/application-modal"
import { BookViewingModal } from "@/components/book-viewing-modal"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import { sampleProperties } from "@/lib/sample-data"

interface PropertyPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const { id } = use(params)
  const [isBookViewingOpen, setIsBookViewingOpen] = useState(false)
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProperty() {
      try {
        setLoading(true)
        
        // First try to find property in sample data (for demo purposes)
        const sampleProperty = sampleProperties.find(p => p.id === id)
        
        if (sampleProperty) {
          setProperty(sampleProperty)
          setLoading(false)
          return
        }
        
        // If not found in sample data, try API
        const response = await fetch(`/api/properties/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound()
          }
          throw new Error('Failed to fetch property')
        }
        
        const data = await response.json()
        if (data.success && data.property) {
          // API already formats the data correctly
          setProperty(data.property)
        } else {
          setError('Property not found')
        }
      } catch (err) {
        console.error('Error fetching property:', err)
        setError('Failed to load property')
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [id])

  const handleBookViewing = () => {
    setIsBookViewingOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[22px]">
            <div className="animate-pulse space-y-8">
              <div className="h-64 bg-gray-300 rounded-lg"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-32 bg-gray-300 rounded"></div>
                  <div className="h-24 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !property) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[22px]">
          {/* Property Gallery */}
          <PropertyGallery images={property.images} title={property.title} propertyId={property.id} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 md:mt-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <PropertyDetails property={property} />
            </div>

            {/* Sidebar - Sticky on desktop */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-4 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto">
                <ApplicationModal property={property} onBookViewing={handleBookViewing} />
                <LandlordCard
                  name={property.landlordName}
                  phone={property.landlordPhone}
                  email={property.landlordEmail}
                />
              </div>
            </div>
          </div>

          {/* Similar Properties */}
          <SimilarProperties
            currentPropertyId={property.id}
            propertyType={property.propertyType || property.property_type}
          />
        </div>
        
        {/* Mobile Sticky Book Viewing Button */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-50">
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground text-base py-6"
              onClick={handleBookViewing}
            >
              Book Viewing
            </Button>
            <Button
              variant="outline"
              className="bg-transparent px-6 py-6 text-base"
              onClick={() => window.open('tel:+447480485707', '_self')}
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Us
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Book Viewing Modal */}
      <BookViewingModal
        isOpen={isBookViewingOpen}
        onClose={() => setIsBookViewingOpen(false)}
        propertyId={property.id}
        propertyData={{
          id: property.id,
          title: property.title,
          address: property.address,
          city: property.city,
          postcode: property.postcode,
          monthly_rent: property.price,
          photos: property.images,
          images: property.images
        }}
      />
    </div>
  )
}
