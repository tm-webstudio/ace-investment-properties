"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PropertyCard } from "@/components/property-card"
import { KeyRound as Pound, Home, FileText, TrendingUp, Eye, MessageSquare, Plus, Clock } from "lucide-react"
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

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching properties:', error)
      } else {
        setProperties(data || [])
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

  // Mock requested viewings data
  const requestedViewings = [
    {
      id: "1",
      investorName: "Sarah Johnson",
      propertyTitle: "Modern Downtown Loft",
      status: "pending",
      requestedDate: "2024-01-15",
      preferredTime: "2:00 PM",
    },
    {
      id: "2",
      investorName: "Michael Chen",
      propertyTitle: "Spacious Family Home",
      status: "confirmed",
      requestedDate: "2024-01-16",
      preferredTime: "10:00 AM",
    },
    {
      id: "3",
      investorName: "Emily Davis",
      propertyTitle: "Modern Downtown Loft",
      status: "pending",
      requestedDate: "2024-01-17",
      preferredTime: "4:00 PM",
    },
    {
      id: "4",
      investorName: "David Wilson",
      propertyTitle: "Spacious Family Home",
      status: "cancelled",
      requestedDate: "2024-01-18",
      preferredTime: "11:30 AM",
    },
  ]

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {properties.slice(0, 4).map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={{
                    id: property.id.toString(),
                    title: property.title,
                    propertyType: property.property_type,
                    bedrooms: property.bedrooms,
                    bathrooms: property.bathrooms,
                    price: property.monthly_rent / 100, // Convert from pence to pounds
                    monthly_rent: property.monthly_rent / 100, // Also include this field
                    monthlyRent: property.monthly_rent / 100, // Convert from pence to pounds
                    deposit: property.security_deposit / 100, // Convert from pence to pounds
                    availableDate: property.available_date,
                    available_date: property.available_date, // Also include this field
                    address: property.address,
                    city: property.city,
                    state: property.county,
                    postcode: property.postcode,
                    photos: property.photos,
                    images: property.photos, // Also include this field for compatibility
                    amenities: [], // Default empty array for amenities
                    landlordId: property.landlord_id,
                    landlordName: "You", // Since it's the current user
                    landlordPhone: "",
                    landlordEmail: ""
                  }}
                  variant="landlord"
                  onPropertyDeleted={handlePropertyDeleted}
                />
              ))}
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

        {/* Requested Viewings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Requested Viewings</CardTitle>
            <Link href="/landlord/viewings">
              <Button variant="outline" size="sm" className="bg-transparent">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requestedViewings.map((viewing) => (
                <div key={viewing.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{viewing.propertyTitle}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Eye className="h-4 w-4 mr-1" />
                      {viewing.investorName}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {viewing.preferredTime} on {new Date(viewing.requestedDate).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(viewing.status)}>
                      {viewing.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {requestedViewings.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No viewing requests at the moment</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
