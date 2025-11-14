"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PropertyCard } from "@/components/property-card"
import { ViewingRequests } from "@/components/viewing-requests"
import { PropertyDocumentsModal } from "@/components/property-documents-modal"
import { PropertyTitle } from "@/components/property-title"
import { KeyRound as Pound, Home, FileText, TrendingUp, Eye, MessageSquare, Plus, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Property {
  id: number
  title: string
  property_type: string
  bedrooms: number
  bathrooms: number
  monthly_rent: number
  security_deposit: number
  available_date: string
  description: string
  address: string
  city: string
  county: string
  postcode: string
  photos: string[]
  status: string
  landlord_id: string
}

interface PropertySummary {
  propertyId: string
  name: string
  address: string
  city?: string
  postcode?: string
  image: string
  completedDocs: number
  totalDocs: number
}

interface DashboardOverviewProps {
  userId: string
  onTabChange?: (tab: string) => void
}

export function DashboardOverview({ userId, onTabChange }: DashboardOverviewProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [propertiesDocSummary, setPropertiesDocSummary] = useState<PropertySummary[]>([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<PropertySummary | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const fetchProperties = async () => {
    try {
      setLoading(true)

      // Get current session for API authentication
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        console.error('No access token available')
        setLoading(false)
        return
      }

      // Use the landlord properties API endpoint instead of direct DB query
      const response = await fetch('/api/landlord/properties', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (result.success) {
        setProperties(result.properties || [])
      } else {
        console.error('Error fetching properties:', result.error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPropertiesDocSummary = async () => {
    try {
      setLoadingDocs(true)

      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        return
      }

      const response = await fetch('/api/landlord/properties-documents-summary', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setPropertiesDocSummary(data.properties || [])
      }
    } catch (error) {
      console.error('Error fetching documents summary:', error)
    } finally {
      setLoadingDocs(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchProperties()
      fetchPropertiesDocSummary()
    }
  }, [userId])

  const handlePropertyDeleted = async () => {
    // Refresh the properties list when a property is deleted
    await fetchProperties()
  }

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
      window.addEventListener('resize', updateScrollButtons)
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', updateScrollButtons)
        window.removeEventListener('resize', updateScrollButtons)
      }
    }
  }, [properties])


  const handleViewDocuments = (property: PropertySummary) => {
    setSelectedProperty(property)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedProperty(null)
    // Refresh the summary to get updated counts
    fetchPropertiesDocSummary()
  }

  const getProgressColor = (completedDocs: number, totalDocs: number) => {
    const percentage = (completedDocs / totalDocs) * 100
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-destructive"
  }

  return (
    <div className="space-y-8">

      {/* My Properties */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Properties</CardTitle>
          <Link href="/landlord/properties">
            <Button variant="outline" size="sm" className="bg-transparent">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="relative">
              <div
                className="flex overflow-x-hidden gap-4 pb-4"
              >
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-none w-4/5 sm:w-1/2 lg:w-[23.5%]"
                  >
                    <div className="border rounded-none overflow-hidden">
                      <div className="h-48 bg-gray-300 animate-pulse"></div>
                      <div className="p-4 space-y-3">
                        <div className="space-y-2">
                          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                        <div className="flex gap-4">
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : properties.length > 0 ? (
            <div className="relative">
              <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-4 pb-4 scroll-smooth"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  scrollSnapType: 'x mandatory'
                }}
              >
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="flex-none w-4/5 sm:w-1/2 lg:w-[23.5%]"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <PropertyCard
                      property={{
                        id: property.id.toString(),
                        title: property.title,
                        property_type: property.property_type,
                        propertyType: property.property_type,
                        bedrooms: property.bedrooms,
                        bathrooms: property.bathrooms,
                        price: property.monthly_rent, // API already converted from pence to pounds
                        monthly_rent: property.monthly_rent, // API already converted
                        monthlyRent: property.monthly_rent, // API already converted
                        availableDate: property.available_date,
                        available_date: property.available_date, // Also include this field
                        availability: property.availability || 'vacant', // Ensure availability is set
                        address: property.address,
                        city: property.city,
                        state: property.county,
                        postcode: property.postcode,
                        photos: property.photos,
                        images: property.photos, // Also include this field for compatibility
                        amenities: [], // Default empty array for amenities
                        property_licence: property.property_licence || 'none',
                        property_condition: property.property_condition || 'good',
                        status: property.status, // Pass the status for approval indication
                        landlordId: property.landlord_id,
                        landlordName: "You", // Since it's the current user
                        landlordPhone: "",
                        landlordEmail: ""
                      }}
                      variant="landlord"
                      onPropertyDeleted={handlePropertyDeleted}
                    />
                  </div>
                ))}
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
          ) : (
            <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
              <Home className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-base font-medium mb-1.5">No Properties Yet</p>
              <p className="text-sm mb-4">Get started by adding your first property</p>
              <Link href="/landlord/add-property">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance & Documents */}
        <Card className="max-h-[600px] overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Compliance & Documents</CardTitle>
            {onTabChange ? (
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent"
                onClick={() => onTabChange('documents')}
              >
                View All
              </Button>
            ) : (
              <Link href="/landlord/property-documents">
                <Button variant="outline" size="sm" className="bg-transparent">
                  View All
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1">
            {loadingDocs ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    {/* Title and address skeleton */}
                    <div className="mb-4">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    </div>
                    {/* Progress bar and button skeleton */}
                    <div className="flex items-end gap-6">
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded animate-pulse w-full"></div>
                      </div>
                      <div className="h-9 bg-gray-200 rounded animate-pulse w-[120px]"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : propertiesDocSummary.length > 0 ? (
              <div className="space-y-3">
                {propertiesDocSummary.map((property) => {
                  const percentage = (property.completedDocs / property.totalDocs) * 100
                  return (
                    <div
                      key={property.propertyId}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="mb-4">
                        <p className="font-semibold text-[15px] mb-1 line-clamp-1">
                          <PropertyTitle
                            address={property.address}
                            city={property.city}
                            postcode={property.postcode}
                          />
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          <PropertyTitle
                            address={property.address}
                            city={property.city}
                            postcode={property.postcode}
                            variant="full"
                          />
                        </p>
                      </div>

                      <div className="flex items-end gap-3 sm:gap-6">
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-0 text-sm">
                            <span className="text-muted-foreground">Documents:</span>
                            <span className="font-semibold">{property.completedDocs}/{property.totalDocs} Complete</span>
                          </div>
                          <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
                            <div
                              className={`h-full rounded-full transition-all ${getProgressBarColor(percentage)}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => handleViewDocuments(property)}
                          variant="outline"
                          size="sm"
                          className="min-w-[120px]"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground min-h-[280px] flex flex-col items-center justify-center">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-base font-medium mb-1.5">No Properties Found</p>
                <p className="text-sm">Add a property to start managing documents</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Viewing Requests */}
        <ViewingRequests variant="dashboard" limit={5} />
      </div>

      {modalOpen && selectedProperty && (
        <PropertyDocumentsModal
          property={selectedProperty}
          open={modalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
