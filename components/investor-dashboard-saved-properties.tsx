"use client"

import { useState, useEffect } from 'react'
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PropertyCard } from "@/components/property-card"
import { Heart, Search, Filter } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

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
    localAuthority: string
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
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
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
          'Authorization': `Bearer ${session.access_token}`
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
      state: saved.property.localAuthority,
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

  return (
    <div className="space-y-6">
      {loading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-t-lg"></div>
              <div className="bg-white p-4 rounded-b-lg border border-t-0">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Properties Grid */}
          {savedProperties.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
          <Heart className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-base font-medium mb-1.5">No Saved Properties</p>
          <p className="text-sm mb-4 max-w-[240px] mx-auto">Start browsing properties and save the ones you're interested in</p>
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
        </>
      )}
    </div>
  )
}
