"use client"

import { useState, useEffect } from 'react'
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SavePropertyButton } from "@/components/save-property-button"
import { PropertyCard } from "@/components/property-card"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Heart, Search, Filter, MapPin, Bed, Bath, PoundSterling, Calendar, StickyNote, ExternalLink, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface SavedProperty {
  savedPropertyId: string
  savedAt: string
  notes: string | null
  property: {
    id: string
    title: string
    property_type: string
    bedrooms: string
    bathrooms: string
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
    availability?: string
    property_licence?: string
    property_condition?: string
    created_at: string
    updated_at: string
  }
}

interface SavedPropertiesResponse {
  properties: SavedProperty[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function SavedPropertiesPage() {
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('saved_at')
  const [order, setOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Check authentication and user type
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
      return
    }
    
    if (user && user.user_metadata?.user_type !== 'investor') {
      router.push('/dashboard')
      return
    }
  }, [user, authLoading, router])

  // Fetch saved properties
  useEffect(() => {
    if (user && user.user_metadata?.user_type === 'investor') {
      fetchSavedProperties()
    }
  }, [user, page, sortBy, order, searchTerm])

  const fetchSavedProperties = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/auth/signin')
        return
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy,
        order,
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/saved-properties?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch saved properties')
      }

      const data: SavedPropertiesResponse = await response.json()
      setSavedProperties(data.properties)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error('Error fetching saved properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page when searching
    fetchSavedProperties()
  }

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy)
    setPage(1)
  }

  const handleOrderChange = (newOrder: string) => {
    setOrder(newOrder)
    setPage(1)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount / 100) // Convert from pence to pounds
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handlePropertyUnsaved = (propertyId: string) => {
    // Remove the property from the list when it's unsaved
    setSavedProperties(prev => prev.filter(item => item.property.id !== propertyId))
    setTotal(prev => prev - 1)
  }

  // Convert saved property to PropertyCard format
  const convertToPropertyCardFormat = (saved: SavedProperty) => {
    return {
      id: saved.property.id,
      title: saved.property.title, // Use title from API
      property_type: saved.property.property_type,
      propertyType: saved.property.property_type,
      bedrooms: parseInt(saved.property.bedrooms),
      bathrooms: parseInt(saved.property.bathrooms),
      price: saved.property.monthly_rent, // Already in pounds from database
      monthly_rent: saved.property.monthly_rent,
      monthlyRent: saved.property.monthly_rent,
      availableDate: saved.property.available_date,
      available_date: saved.property.available_date,
      availability: saved.property.availability || 'vacant',
      address: saved.property.address,
      city: saved.property.city,
      state: saved.property.county,
      postcode: saved.property.postcode,
      photos: saved.property.photos,
      images: saved.property.photos,
      amenities: [],
      property_licence: saved.property.property_licence || 'none',
      property_condition: saved.property.property_condition || 'good',
      landlordId: '',
      landlordName: '',
      landlordPhone: '',
      landlordEmail: ''
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading your saved properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-6 w-6 text-red-500 fill-current" />
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary">
                Saved Properties
              </h1>
            </div>
            <p className="text-muted-foreground">
              {total > 0 ? `${total} saved properties` : 'You haven\'t saved any properties yet'}
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by address, city, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saved_at">Date Saved</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="property_name">Address</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={order} onValueChange={handleOrderChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest</SelectItem>
                      <SelectItem value="asc">Oldest</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" variant="outline">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Properties Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }, (_, index) => (
                <SavedPropertyCardSkeleton key={index} />
              ))}
            </div>
          ) : savedProperties.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No saved properties yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start browsing properties and save the ones you're interested in.
                </p>
                <Link href="/investor/property-matching">
                  <Button>Find Properties</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {savedProperties.map((saved) => (
                  <PropertyCard
                    key={saved.savedPropertyId}
                    property={convertToPropertyCardFormat(saved)}
                    variant="default"
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages, page - 2 + i))
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          onClick={() => setPage(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function SavedPropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {/* Property Image Skeleton */}
        <div className="aspect-video relative bg-muted animate-pulse" />
        
        {/* Save Button Skeleton */}
        <div className="absolute top-2 right-2">
          <div className="h-8 w-8 bg-muted-foreground/20 rounded animate-pulse" />
        </div>

        {/* Status Badge Skeleton */}
        <div className="absolute bottom-2 left-2">
          <div className="h-6 w-16 bg-muted-foreground/20 rounded animate-pulse" />
        </div>
      </div>

      <CardContent className="p-4">
        {/* Property Details Skeleton */}
        <div className="mb-3">
          <div className="h-6 w-3/4 bg-muted animate-pulse rounded mb-1" />
          <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
        </div>

        {/* Property Features Skeleton */}
        <div className="flex items-center gap-4 text-sm mb-3">
          <div className="flex items-center">
            <div className="h-4 w-4 bg-muted animate-pulse rounded mr-1" />
            <div className="h-4 w-6 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 bg-muted animate-pulse rounded mr-1" />
            <div className="h-4 w-6 bg-muted animate-pulse rounded" />
          </div>
        </div>

        {/* Price Skeleton */}
        <div className="flex items-center mb-3">
          <div className="h-4 w-4 bg-muted animate-pulse rounded mr-1" />
          <div className="h-5 w-20 bg-muted animate-pulse rounded" />
          <div className="h-4 w-12 bg-muted animate-pulse rounded ml-1" />
        </div>

        {/* Saved Date Skeleton */}
        <div className="flex items-center mb-3">
          <div className="h-4 w-4 bg-muted animate-pulse rounded mr-1" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>

        <Separator className="my-3" />

        {/* Actions Skeleton */}
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  )
}