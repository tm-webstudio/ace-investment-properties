"use client"

import { useState, useEffect } from 'react'
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PropertyCard } from "@/components/property-card"
import { Heart, Search, Filter, Loader2 } from "lucide-react"
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

export function InvestorDashboardSavedProperties() {
  const router = useRouter()
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('saved_at')
  const [order, setOrder] = useState('desc')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchSavedProperties()
  }, [sortBy, order])

  const fetchSavedProperties = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/auth/signin')
        return
      }

      const params = new URLSearchParams({
        page: '1',
        limit: '8', // Show only 8 on dashboard
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
      setTotal(data.total)
    } catch (error) {
      console.error('Error fetching saved properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSavedProperties()
  }

  const convertToPropertyCardFormat = (saved: SavedProperty) => {
    return {
      id: saved.property.id,
      title: saved.property.title,
      property_type: saved.property.property_type,
      propertyType: saved.property.property_type,
      bedrooms: parseInt(saved.property.bedrooms),
      bathrooms: parseInt(saved.property.bathrooms),
      price: saved.property.monthly_rent,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-red-500 fill-current" />
            <h2 className="text-2xl font-bold text-gray-900">Saved Properties</h2>
          </div>
          <p className="text-gray-600 mt-1">
            {total > 0 ? `${total} saved properties` : 'You haven\'t saved any properties yet'}
          </p>
        </div>
        {total > 0 && (
          <Link href="/investor/saved-properties">
            <Button variant="outline">View All</Button>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      {total > 0 && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search saved properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saved_at">Date Saved</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="property_name">Address</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={order} onValueChange={setOrder}>
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
      )}

      {/* Properties Grid */}
      {savedProperties.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
          <Heart className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-base font-medium mb-1.5">No Saved Properties</p>
          <p className="text-sm mb-4">Start browsing properties and save the ones you're interested in</p>
          <Link href="/investor/property-matching">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Find Properties
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {savedProperties.map((saved) => (
            <PropertyCard
              key={saved.savedPropertyId}
              property={convertToPropertyCardFormat(saved)}
              variant="default"
            />
          ))}
        </div>
      )}
    </div>
  )
}
