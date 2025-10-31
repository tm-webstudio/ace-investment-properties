import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PropertyCard } from "@/components/property-card"
import { ViewingRequests } from "@/components/viewing-requests"
import { Settings, Eye, CheckCircle, XCircle, Clock, Calendar, Home, Users, BarChart3, Plus, Shield, Building } from "lucide-react"
import Link from "next/link"
import type { Admin } from "@/lib/sample-data"
import { samplePendingProperties, sampleViewings, sampleProperties, sampleLandlords, sampleInvestors } from "@/lib/sample-data"
import { supabase } from "@/lib/supabase"

interface AdminDashboardOverviewProps {
  admin: Admin
}

export function AdminDashboardOverview({ admin }: AdminDashboardOverviewProps) {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalPendingProperties: 0,
    totalLandlords: 0,
    totalInvestors: 0,
    totalViewings: 0
  })
  const [pendingPropertiesForDisplay, setPendingPropertiesForDisplay] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        let totalProperties = 0
        let totalPendingProperties = 0
        let pendingForDisplay: any[] = []

        // Fetch properties count
        try {
          const propertiesResponse = await fetch('/api/properties')
          if (propertiesResponse.ok) {
            const propertiesData = await propertiesResponse.json()
            totalProperties = propertiesData.success ? propertiesData.properties.length : 0
          }
        } catch (error) {
          console.error('Error fetching properties:', error)
        }

        // Fetch properties pending approval
        try {
          const pendingResponse = await fetch('/api/properties?status=draft')
          if (pendingResponse.ok) {
            const pendingData = await pendingResponse.json()
            if (pendingData.success && pendingData.properties) {
              totalPendingProperties = pendingData.properties.length

              // Get pending properties for display (first 6)
              pendingForDisplay = pendingData.properties.slice(0, 6).map((property: any) => ({
                  ...property,
                  id: property.id,
                  property_type: property.property_type,
                  propertyType: property.property_type,
                  bedrooms: property.bedrooms,
                  bathrooms: property.bathrooms,
                  monthly_rent: property.monthly_rent,
                  price: property.monthly_rent,
                  photos: property.photos || ["/spacious-family-home.png"],
                  images: property.photos || ["/spacious-family-home.png"],
                  available_date: property.available_date,
                  availableDate: property.available_date,
                  availability: property.availability,
                  address: property.address,
                  city: property.city,
                  county: property.county,
                  postcode: property.postcode,
                  property_licence: property.property_licence,
                  property_condition: property.property_condition,
                  amenities: property.amenities || [],
                  _pendingInfo: {
                    status: property.status,
                    submittedBy: property.landlord_id,
                    submittedDate: property.created_at,
                    landlordName: property.contact_name
                  }
                }))
            }
          }
        } catch (error) {
          console.error('Error fetching pending properties:', error)
        }

        // Fetch admin stats (landlords, investors, viewings)
        let totalLandlords = 0
        let totalInvestors = 0
        let totalViewings = 0

        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            const statsResponse = await fetch('/api/admin/stats', {
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            })

            if (statsResponse.ok) {
              const statsData = await statsResponse.json()
              if (statsData.success) {
                totalLandlords = statsData.stats.totalLandlords
                totalInvestors = statsData.stats.totalInvestors
                totalViewings = statsData.stats.totalViewings
              }
            }
          }
        } catch (error) {
          console.error('Error fetching admin stats:', error)
        }

        setStats({
          totalProperties,
          totalPendingProperties,
          totalLandlords,
          totalInvestors,
          totalViewings
        })

        setPendingPropertiesForDisplay(pendingForDisplay)
        
      } catch (error) {
        console.error('Error fetching admin data:', error)
        // Set all to 0 on error
        setStats({
          totalProperties: 0,
          totalPendingProperties: 0,
          totalLandlords: 0,
          totalInvestors: 0,
          totalViewings: 0
        })
        setPendingPropertiesForDisplay([])
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  const formatStatValue = (value: number, isLoading: boolean) => {
    if (isLoading) return '...'
    return value.toString() // Show actual value (including 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleApproveProperty = async (propertyId: string) => {
    try {
      // Get session from Supabase
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        alert('Please log in to approve properties')
        return
      }

      const response = await fetch('/api/admin/properties/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          propertyId,
          action: 'approve'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Remove from pending list
        setPendingPropertiesForDisplay(prev => 
          prev.filter(property => property.id !== propertyId)
        )
        // Update stats
        setStats(prev => ({
          ...prev,
          totalPendingProperties: prev.totalPendingProperties - 1,
          totalProperties: prev.totalProperties + 1
        }))
        alert('Property approved successfully')
      } else {
        alert('Failed to approve property: ' + data.error)
      }
    } catch (error) {
      console.error('Error approving property:', error)
      alert('Error approving property')
    }
  }

  const handleRejectProperty = async (propertyId: string) => {
    try {
      // Get session from Supabase
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        alert('Please log in to reject properties')
        return
      }

      const response = await fetch('/api/admin/properties/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          propertyId,
          action: 'reject'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Remove from pending list
        setPendingPropertiesForDisplay(prev => 
          prev.filter(property => property.id !== propertyId)
        )
        // Update stats
        setStats(prev => ({
          ...prev,
          totalPendingProperties: prev.totalPendingProperties - 1
        }))
        alert('Property rejected successfully')
      } else {
        alert('Failed to reject property: ' + data.error)
      }
    } catch (error) {
      console.error('Error rejecting property:', error)
      alert('Error rejecting property')
    }
  }

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatStatValue(stats.totalProperties, loading)}</div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatStatValue(stats.totalPendingProperties, loading)}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Landlords</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatStatValue(stats.totalLandlords, loading)}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatStatValue(stats.totalInvestors, loading)}</div>
            <p className="text-xs text-muted-foreground">Active investors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Viewings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatStatValue(stats.totalViewings, loading)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Properties for Approval */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pending Property Approvals</CardTitle>
          <Link href="/admin/properties">
            <Button variant="outline" size="sm" className="bg-transparent">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {pendingPropertiesForDisplay.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/30 flex items-center justify-center">
                <Building className="w-5 h-5 text-muted-foreground/60" />
              </div>
              <h3 className="text-base font-medium text-muted-foreground mb-2">No Pending Approvals</h3>
              <p className="text-sm text-muted-foreground/70 mb-3 max-w-sm mx-auto">
                All submitted properties have been reviewed. New submissions will appear here.
              </p>
              <Badge variant="outline" className="text-xs text-muted-foreground/50 border-muted-foreground/20">
                {loading ? 'Loading...' : 'All caught up!'}
              </Badge>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pendingPropertiesForDisplay.map((property) => (
              <div key={property.id} className="space-y-2">
                <PropertyCard
                  property={property}
                  variant="admin"
                  onApprove={handleApproveProperty}
                  onReject={handleRejectProperty}
                />

                {/* Admin info below the card */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">By: {property._pendingInfo.landlordName}</span>
                  <span>Submitted: {new Date(property._pendingInfo.submittedDate).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            ))}
            </div>
          )}
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Viewings */}
        <ViewingRequests variant="dashboard" limit={5} />

        {/* Landlord Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Landlord Documents</CardTitle>
            <Link href="/admin/documents">
              <Button variant="outline" size="sm" className="bg-transparent">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 1, landlordName: "John Smith", documentType: "Gas Safety Certificate", property: "Modern Studio Apartment", status: "pending", submittedDate: "2025-10-25" },
                { id: 2, landlordName: "Emma Williams", documentType: "EPC Certificate", property: "Victorian Terrace", status: "approved", submittedDate: "2025-10-24" },
                { id: 3, landlordName: "Oliver Davies", documentType: "Electrical Certificate", property: "Luxury Penthouse", status: "pending", submittedDate: "2025-10-23" },
                { id: 4, landlordName: "Sarah Johnson", documentType: "Insurance Certificate", property: "Family Home", status: "rejected", submittedDate: "2025-10-22" },
                { id: 5, landlordName: "Michael Brown", documentType: "HMO License", property: "Student Accommodation", status: "pending", submittedDate: "2025-10-21" }
              ].map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{doc.documentType}</p>
                      <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{doc.property}</p>
                    <p className="text-xs text-muted-foreground">By: {doc.landlordName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(doc.submittedDate).toLocaleDateString('en-GB')}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {doc.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}