"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PropertyCard } from "@/components/property-card"
import { ViewingRequests } from "@/components/viewing-requests"
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

interface DashboardOverviewProps {
  userId: string
}

export function DashboardOverview({ userId }: DashboardOverviewProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    if (userId) {
      fetchProperties()
    }
  }, [userId])

  const handlePropertyDeleted = () => {
    // Refresh the properties list when a property is deleted
    fetchProperties()
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


  // Mock compliance & documents data
  const complianceItems = [
    {
      id: "1",
      document: "Gas Safety Certificate",
      property: "Modern Downtown Loft",
      status: "expiring",
      expiryDate: "2024-02-15",
    },
    {
      id: "2", 
      document: "EPC Certificate",
      property: "Spacious Family Home",
      status: "valid",
      expiryDate: "2024-08-20",
    },
    {
      id: "3",
      document: "Electrical Safety Certificate",
      property: "Modern Downtown Loft", 
      status: "expired",
      expiryDate: "2024-01-10",
    },
    {
      id: "4",
      document: "Insurance Policy",
      property: "Spacious Family Home",
      status: "valid",
      expiryDate: "2024-12-31",
    },
  ]

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800"
      case "expiring":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
                        deposit: property.security_deposit, // API already converted
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
            <div className="text-center py-8 text-muted-foreground">
              <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No properties yet</p>
              <p className="mb-4">Get started by adding your first property</p>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Compliance & Documents</CardTitle>
            <Link href="/landlord/compliance">
              <Button variant="outline" size="sm" className="bg-transparent">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{item.document}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 mr-1" />
                      {item.property}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Expires: {new Date(item.expiryDate).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getComplianceStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {complianceItems.length === 0 && (
                <p className="text-muted-foreground text-center py-4">All compliance documents up to date</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Viewing Requests */}
        <ViewingRequests variant="dashboard" limit={5} />
      </div>

    </div>
  )
}
