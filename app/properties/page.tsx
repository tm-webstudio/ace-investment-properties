"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PropertyCard } from "@/components/property-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react"
import Link from "next/link"
import type { Property } from "@/lib/sample-data"

// Map location slugs to display names
const locationDisplayNames: Record<string, string> = {
  // London
  "north-london": "North London",
  "east-london": "East London",
  "south-london": "South London",
  "west-london": "West London",
  "central-london": "Central London",
  // Midlands
  "birmingham": "Birmingham",
  "coventry": "Coventry",
  "leicester": "Leicester",
  "nottingham": "Nottingham",
  // North England
  "manchester": "Manchester",
  "liverpool": "Liverpool",
  "leeds": "Leeds",
  "newcastle": "Newcastle",
  // South England
  "brighton": "Brighton",
  "bristol": "Bristol",
  "oxford": "Oxford",
  "cambridge": "Cambridge",
}

// Map location slugs to search configuration
// For London areas, we use postcode prefixes; for other cities, we use city name
interface LocationConfig {
  city?: string
  postcodePrefix?: string
}

const locationSearchConfig: Record<string, LocationConfig> = {
  // London areas - filter by postcode prefix
  // N = North London (N1-N22), NW = North West London (NW1-NW11)
  "north-london": { city: "London", postcodePrefix: "N,NW" },
  // E = East London (E1-E20), IG = Ilford/Barking
  "east-london": { city: "London", postcodePrefix: "E,IG,RM" },
  // SE = South East London (SE1-SE28), BR = Bromley, CR = Croydon, DA = Dartford
  "south-london": { city: "London", postcodePrefix: "SE,BR,CR,DA" },
  // W = West London (W2-W14), SW = South West (SW3-SW20), TW = Twickenham, UB = Uxbridge
  "west-london": { city: "London", postcodePrefix: "W,SW,TW,UB,HA" },
  // EC = East Central, WC = West Central, W1 = West End, SW1 = Westminster
  "central-london": { city: "London", postcodePrefix: "EC,WC" },
  // Other cities - use city name directly
  "birmingham": { city: "Birmingham" },
  "coventry": { city: "Coventry" },
  "leicester": { city: "Leicester" },
  "nottingham": { city: "Nottingham" },
  "manchester": { city: "Manchester" },
  "liverpool": { city: "Liverpool" },
  "leeds": { city: "Leeds" },
  "newcastle": { city: "Newcastle" },
  "brighton": { city: "Brighton" },
  "bristol": { city: "Bristol" },
  "oxford": { city: "Oxford" },
  "cambridge": { city: "Cambridge" },
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

function PropertiesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const location = searchParams.get("location")

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter states
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [bedroomFilter, setBedroomFilter] = useState("any")
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("any")

  const displayName = location ? locationDisplayNames[location] || location : "All Locations"
  const searchConfig = location ? locationSearchConfig[location] : null

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("page", currentPage.toString())
        params.set("limit", "12")
        params.set("sortBy", sortBy)
        params.set("sortOrder", sortOrder)

        if (searchConfig?.city) {
          params.set("city", searchConfig.city)
        }

        if (searchConfig?.postcodePrefix) {
          params.set("postcodePrefix", searchConfig.postcodePrefix)
        }

        if (bedroomFilter && bedroomFilter !== "any") {
          params.set("bedrooms", bedroomFilter)
        }

        if (propertyTypeFilter && propertyTypeFilter !== "any") {
          params.set("propertyType", propertyTypeFilter)
        }

        const response = await fetch(`/api/properties?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          // Convert API response to Property format
          const formattedProperties = data.properties.map((p: any) => ({
            id: p.id,
            title: p.title || `${p.property_type} in ${p.city}`,
            price: p.monthly_rent,
            monthly_rent: p.monthly_rent,
            address: p.address || "",
            city: p.city,
            state: "",
            bedrooms: parseInt(p.bedrooms) || 0,
            bathrooms: parseInt(p.bathrooms) || 0,
            propertyType: p.property_type,
            property_type: p.property_type,
            description: p.description || "",
            amenities: p.amenities || [],
            images: p.photos || [],
            photos: p.photos || [],
            availableDate: p.available_date || "",
            available_date: p.available_date,
            availability: p.availability || "vacant",
            property_licence: p.property_licence || "none",
            property_condition: p.property_condition || "good",
            landlordId: p.landlord_id || "",
            landlordName: p.landlord?.full_name || "",
            landlordPhone: "",
            landlordEmail: "",
            featured: false,
            status: p.status,
            postcode: p.postcode,
          }))
          setProperties(formattedProperties)
          setPagination(data.pagination)
        }
      } catch (error) {
        console.error("Error fetching properties:", error)
        setProperties([])
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [currentPage, searchConfig, sortBy, sortOrder, bedroomFilter, propertyTypeFilter])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [location, sortBy, sortOrder, bedroomFilter, propertyTypeFilter])

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  const handleOrderChange = (value: string) => {
    setSortOrder(value)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-serif text-2xl md:text-3xl font-medium text-foreground">
              {displayName}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              {pagination && pagination.total > 0
                ? `${pagination.total} ${pagination.total === 1 ? 'property' : 'properties'} available`
                : loading ? 'Loading properties...' : 'No properties found'
              }
            </p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 mb-6">
            <Select value={bedroomFilter} onValueChange={setBedroomFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Beds</SelectItem>
                <SelectItem value="0">Studio</SelectItem>
                <SelectItem value="1">1 Bed</SelectItem>
                <SelectItem value="2">2 Beds</SelectItem>
                <SelectItem value="3">3 Beds</SelectItem>
                <SelectItem value="4+">4+ Beds</SelectItem>
              </SelectContent>
            </Select>

            <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Type</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="terraced">Terraced</SelectItem>
                <SelectItem value="semi-detached">Semi-Detached</SelectItem>
                <SelectItem value="detached">Detached</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Added</SelectItem>
                <SelectItem value="monthly_rent">Price</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={handleOrderChange}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">{sortBy === "monthly_rent" ? "High to Low" : "Newest"}</SelectItem>
                <SelectItem value="asc">{sortBy === "monthly_rent" ? "Low to High" : "Oldest"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border rounded-none overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                    <div className="flex gap-4">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Properties Grid */}
          {!loading && properties.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={!pagination.hasPrev}
                    className="rounded-none"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const page = i + 1
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className="rounded-none min-w-[40px]"
                          >
                            {page}
                          </Button>
                        )
                      } else if (
                        (page === 2 && currentPage > 3) ||
                        (page === pagination.totalPages - 1 && currentPage < pagination.totalPages - 2)
                      ) {
                        return <span key={page} className="px-2 text-muted-foreground">...</span>
                      }
                      return null
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={!pagination.hasNext}
                    className="rounded-none"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && properties.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {location
                    ? `We don't have any properties listed in ${displayName} at the moment. Try adjusting your filters or explore other areas.`
                    : "We don't have any properties listed at the moment. Check back soon."
                  }
                </p>
                <Link href="/">
                  <Button variant="outline">
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Loading fallback for Suspense
function PropertiesLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mt-2" />
          </div>

          {/* Filter Skeleton */}
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 mb-6">
            <div className="h-10 w-full sm:w-36 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full sm:w-36 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full sm:w-36 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full sm:w-32 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border rounded-none overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                  <div className="flex gap-4">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<PropertiesLoading />}>
      <PropertiesContent />
    </Suspense>
  )
}
