import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PropertyCard } from "@/components/property-card"
import { Settings, Eye, CheckCircle, XCircle, Clock, Calendar, Home, Users, BarChart3, Plus, Shield } from "lucide-react"
import Link from "next/link"
import type { Admin } from "@/lib/sample-data"
import { samplePendingProperties, sampleViewings, sampleProperties, sampleLandlords, sampleInvestors } from "@/lib/sample-data"

interface AdminDashboardOverviewProps {
  admin: Admin
}

export function AdminDashboardOverview({ admin }: AdminDashboardOverviewProps) {
  // Get pending properties for approval
  const pendingProperties = samplePendingProperties.filter(p => p.status === "pending").slice(0, 6)
  
  // Transform pending properties to match Property interface
  const pendingPropertiesForDisplay = pendingProperties.map(pending => ({
    ...pending.propertyData,
    id: pending.id,
    property_type: pending.propertyData.propertyType,
    monthly_rent: pending.propertyData.price,
    photos: ["/spacious-family-home.png"], // Use working placeholder image
    images: ["/spacious-family-home.png"], // Use working placeholder image  
    available_date: pending.propertyData.availableDate,
    availableDate: pending.propertyData.availableDate, // Also set this for consistency
    _pendingInfo: {
      status: pending.status,
      submittedBy: pending.submittedBy,
      submittedDate: pending.submittedDate,
      landlordName: pending.propertyData.landlordName
    }
  }))
  
  // Get all viewings for management
  const allViewings = sampleViewings.slice(0, 5)
  
  // Calculate statistics
  const totalProperties = sampleProperties.length
  const totalPendingProperties = samplePendingProperties.filter(p => p.status === "pending").length
  const totalLandlords = sampleLandlords.length
  const totalInvestors = sampleInvestors.length
  const totalViewings = sampleViewings.length

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

  const handleApproveProperty = (propertyId: string) => {
    // In a real app, this would make an API call
    console.log("Approving property:", propertyId)
  }

  const handleRejectProperty = (propertyId: string) => {
    // In a real app, this would make an API call
    console.log("Rejecting property:", propertyId)
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
            <div className="text-2xl font-bold">{totalProperties}</div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPendingProperties}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Landlords</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLandlords}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvestors}</div>
            <p className="text-xs text-muted-foreground">Active investors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Viewings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViewings}</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pendingPropertiesForDisplay.map((property) => (
              <div key={property.id} className="relative">
                <PropertyCard 
                  property={property}
                  variant="default"
                />
                
                {/* Admin overlay with status and actions */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                  <Badge className={getStatusColor(property._pendingInfo.status)}>
                    {property._pendingInfo.status}
                  </Badge>
                  <div className="flex gap-1">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleApproveProperty(property.id)}
                      className="bg-green-100 hover:bg-green-200 border-green-300 h-8 w-8 p-0"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleRejectProperty(property.id)}
                      className="bg-red-100 hover:bg-red-200 border-red-300 h-8 w-8 p-0"
                    >
                      <XCircle className="h-4 w-4 text-red-600" />
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="bg-blue-100 hover:bg-blue-200 border-blue-300 h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                  </div>
                </div>
                
                {/* Submission info */}
                <div className="absolute bottom-3 left-3 right-3 z-10">
                  <div className="bg-white/95 backdrop-blur-sm rounded p-2 text-xs text-gray-700 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">By: {property._pendingInfo.landlordName}</span>
                      <span>Submitted: {new Date(property._pendingInfo.submittedDate).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Viewings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Viewings</CardTitle>
            <Link href="/admin/viewings">
              <Button variant="outline" size="sm" className="bg-transparent">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allViewings.map((viewing) => (
                <div key={viewing.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{viewing.propertyTitle}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(viewing.viewingDate).toLocaleDateString('en-GB')} at {viewing.viewingTime}
                    </div>
                  </div>
                  <Badge className={getStatusColor(viewing.status)}>
                    {viewing.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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