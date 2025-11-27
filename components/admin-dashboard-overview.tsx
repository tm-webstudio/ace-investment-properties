import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { PropertyCard } from "@/components/property-card"
import { PropertyTitle } from "@/components/property-title"
import { ViewingRequests } from "@/components/viewing-requests"
import { Settings, Eye, CheckCircle, XCircle, Clock, Calendar, Home, Users, BarChart3, Plus, Shield, Building, FileText, Download, ExternalLink, ChevronLeft, ChevronRight, Check } from "lucide-react"
import Link from "next/link"
import type { Admin } from "@/lib/sample-data"
import { samplePendingProperties, sampleViewings, sampleProperties, sampleLandlords, sampleInvestors } from "@/lib/sample-data"
import { supabase } from "@/lib/supabase"

interface AdminDashboardOverviewProps {
  admin: Admin
  onTabChange?: (tab: string) => void
}

export function AdminDashboardOverview({ admin, onTabChange }: AdminDashboardOverviewProps) {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalPendingProperties: 0,
    totalLandlords: 0,
    totalInvestors: 0,
    totalViewings: 0
  })
  const [pendingPropertiesForDisplay, setPendingPropertiesForDisplay] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [documentsForDisplay, setDocumentsForDisplay] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'success' | 'error'>('approve')
  const [modalMessage, setModalMessage] = useState('')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false)
  const [selectedPropertyForDocs, setSelectedPropertyForDocs] = useState<any>(null)
  const [propertyDocuments, setPropertyDocuments] = useState<any[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

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

              console.log('Admin Dashboard Overview - First pending property:', pendingForDisplay[0])
              console.log('Licence:', pendingForDisplay[0]?.property_licence)
              console.log('Condition:', pendingForDisplay[0]?.property_condition)
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

    const fetchDocuments = async () => {
      try {
        setDocumentsLoading(true)

        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.access_token) {
          console.error('No access token available')
          setDocumentsLoading(false)
          return
        }

        const response = await fetch('/api/admin/documents', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        const data = await response.json()

        console.log('Documents API Response:', data)

        if (!response.ok) {
          console.error('Documents API Error:', data.error)
          throw new Error(data.error || 'Failed to fetch documents')
        }

        if (data.success && data.documents) {
          console.log('Documents received:', data.documents.length)
          // Map the data to match the expected format
          const formattedDocs = data.documents.map((doc: any) => ({
            propertyId: doc.propertyId,
            address: doc.address,
            city: doc.city,
            postcode: doc.postcode,
            image: doc.photos?.[0] || '/placeholder.jpg',
            completedDocs: doc.completedDocs,
            totalDocs: doc.totalDocs
          }))

          console.log('Formatted docs:', formattedDocs)
          console.log('First doc example:', formattedDocs[0])
          // Filter to only show properties with at least one document for the overview
          const docsWithUploads = formattedDocs.filter((doc: any) => doc.completedDocs > 0)
          setDocumentsForDisplay(docsWithUploads)
        } else {
          console.log('No documents data in response')
        }
      } catch (error) {
        console.error('Error fetching documents:', error)
      } finally {
        setDocumentsLoading(false)
      }
    }

    fetchAdminData()
    fetchDocuments()
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

  const handleApproveClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId)
    setModalType('approve')
    setModalMessage('Are you sure you want to approve this property?')
    setModalOpen(true)
  }

  const handleRejectClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId)
    setModalType('reject')
    setModalMessage('Are you sure you want to reject this property?')
    setModalOpen(true)
  }

  const confirmAction = async () => {
    if (!selectedPropertyId) return

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setModalType('error')
        setModalMessage('Please log in to manage properties')
        return
      }

      const response = await fetch('/api/admin/properties/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          propertyId: selectedPropertyId,
          action: modalType === 'approve' ? 'approve' : 'reject'
        })
      })

      const data = await response.json()

      if (data.success) {
        // Remove from pending list
        setPendingPropertiesForDisplay(prev =>
          prev.filter(property => property.id !== selectedPropertyId)
        )
        // Update stats
        setStats(prev => ({
          ...prev,
          totalPendingProperties: prev.totalPendingProperties - 1,
          ...(modalType === 'approve' ? { totalProperties: prev.totalProperties + 1 } : {})
        }))

        setModalType('success')
        setModalMessage(`Property ${modalType === 'approve' ? 'approved' : 'rejected'} successfully`)
      } else {
        setModalType('error')
        setModalMessage(`Failed to ${modalType} property: ${data.error}`)
      }
    } catch (error) {
      console.error('Error managing property:', error)
      setModalType('error')
      setModalMessage(`Error ${modalType === 'approve' ? 'approving' : 'rejecting'} property`)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedPropertyId(null)
  }

  const handleViewDocuments = async (property: any) => {
    setSelectedPropertyForDocs(property)
    setDocumentsModalOpen(true)
    setLoadingDocuments(true)
    setPropertyDocuments([])

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.error('No access token available')
        return
      }

      const response = await fetch(`/api/admin/properties/${property.propertyId}/documents`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.documents) {
          setPropertyDocuments(data.documents)
        }
      }
    } catch (error) {
      console.error('Error fetching property documents:', error)
    } finally {
      setLoadingDocuments(false)
    }
  }

  const handleDownloadDocument = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Failed to download document')
    }
  }

  const handleApproveDocument = async (documentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert('Please log in to approve documents')
        return
      }

      const response = await fetch(`/api/admin/documents/${documentId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        // Refresh the documents list
        if (selectedPropertyForDocs) {
          handleViewDocuments(selectedPropertyForDocs)
        }
      } else {
        alert('Failed to approve document')
      }
    } catch (error) {
      console.error('Error approving document:', error)
      alert('Error approving document')
    }
  }

  const closeDocumentsModal = () => {
    setDocumentsModalOpen(false)
    setSelectedPropertyForDocs(null)
    setPropertyDocuments([])
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
  }, [pendingPropertiesForDisplay])

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent"
            onClick={() => onTabChange?.('properties')}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="relative">
              <div className="flex overflow-x-hidden gap-4 pb-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-none w-4/5 sm:w-1/2 lg:w-[23.5%] space-y-2">
                    <div className="border rounded-lg overflow-hidden">
                      {/* Image skeleton */}
                      <div className="h-48 bg-gray-200 animate-pulse"></div>
                      {/* Content skeleton */}
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                        <div className="flex gap-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                        <div className="flex gap-2">
                          <div className="h-9 bg-gray-200 rounded animate-pulse flex-1"></div>
                          <div className="h-9 bg-gray-200 rounded animate-pulse flex-1"></div>
                        </div>
                      </div>
                    </div>
                    {/* Admin info skeleton */}
                    <div className="flex items-center justify-between">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-28"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : pendingPropertiesForDisplay.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
              <Building className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-base font-medium mb-1.5">No Pending Approvals</p>
              <p className="text-sm max-w-[200px] mx-auto">All submitted properties have been reviewed</p>
            </div>
          ) : (
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
                {pendingPropertiesForDisplay.map((property) => (
                  <div
                    key={property.id}
                    className="flex-none w-4/5 sm:w-1/2 lg:w-[23.5%] space-y-2"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <PropertyCard
                      property={property}
                      variant="admin"
                      onApprove={handleApproveClick}
                      onReject={handleRejectClick}
                    />

                    {/* Admin info below the card */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium">By: {property._pendingInfo.landlordName}</span>
                      <span>Submitted: {new Date(property._pendingInfo.submittedDate).toLocaleDateString('en-GB')}</span>
                    </div>
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
          )}
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Viewings */}
        <ViewingRequests variant="dashboard" limit={5} onTabChange={onTabChange} isAdmin={true} />

        {/* Landlord Documents */}
        <Card className="max-h-[600px] overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Landlord Documents</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              onClick={() => onTabChange?.('documents')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1">
            {documentsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="mb-3">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                    <div className="flex items-end gap-3 sm:gap-6">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center mb-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded animate-pulse w-full"></div>
                      </div>
                      <div className="h-9 bg-gray-200 rounded animate-pulse w-[120px]"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : documentsForDisplay.length > 0 ? (
              <div className="space-y-3">
                {documentsForDisplay.map((property) => {
                  const percentage = (property.completedDocs / property.totalDocs) * 100
                  const getProgressBarColor = (percentage: number) => {
                    if (percentage >= 80) return "bg-green-500"
                    if (percentage >= 50) return "bg-yellow-500"
                    return "bg-destructive"
                  }

                  return (
                    <div
                      key={property.propertyId}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="mb-4">
                        <p className="font-semibold text-[15px] mb-1 line-clamp-1">
                          {property.address}, {property.city}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {property.postcode?.toUpperCase()}
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
                          variant="outline"
                          size="sm"
                          className="min-w-[120px]"
                          onClick={() => handleViewDocuments(property)}
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
                <p className="text-base font-medium mb-1.5">No Documents Found</p>
                <p className="text-sm max-w-[200px] mx-auto">Landlord documents will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation/Result Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalType === 'approve' && 'Approve Property'}
              {modalType === 'reject' && 'Reject Property'}
              {modalType === 'success' && 'Success'}
              {modalType === 'error' && 'Error'}
            </DialogTitle>
            <DialogDescription>
              {modalMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {(modalType === 'approve' || modalType === 'reject') ? (
              <>
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  onClick={confirmAction}
                  className={modalType === 'approve' ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'}
                >
                  {modalType === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </>
            ) : (
              <Button onClick={closeModal}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Documents Modal */}
      <Dialog open={documentsModalOpen} onOpenChange={setDocumentsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Documents</DialogTitle>
            <DialogDescription>
              {selectedPropertyForDocs && (
                <PropertyTitle
                  address={selectedPropertyForDocs.address}
                  city={selectedPropertyForDocs.city}
                  postcode={selectedPropertyForDocs.postcode}
                  variant="full"
                />
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {loadingDocuments ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border rounded-none">
                    <div className="py-2 px-3">
                      {/* Header skeleton */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-gray-200 rounded w-2/5 animate-pulse"></div>
                        </div>
                        {/* Badge skeleton */}
                        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      {/* Filename box skeleton */}
                      <div className="space-y-2 mb-2">
                        <div className="h-8 bg-gray-200 rounded w-3/5 animate-pulse"></div>
                      </div>
                      {/* Buttons skeleton */}
                      <div className="flex gap-2 pt-2 border-t">
                        <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : propertyDocuments.length > 0 ? (
              <div className="space-y-3">
                {propertyDocuments.map((docType) => (
                  <div
                    key={docType.type}
                    className="border rounded-none"
                  >
                    <div className="py-2 px-3">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[15px]">{docType.label}</h3>
                        </div>
                        <div className="flex-shrink-0 ml-3">
                          {docType.document ? (
                            docType.document.status === 'approved' ? (
                              <Badge variant="secondary" className="bg-green-200 text-green-800">Approved</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">Awaiting Approval</Badge>
                            )
                          ) : (
                            <Badge variant="secondary" className="bg-gray-200 text-gray-700">Not Uploaded</Badge>
                          )}
                        </div>
                      </div>

                      {docType.document && (
                        <div className="space-y-2">
                          {/* Filename with background */}
                          <div className="space-y-1.5">
                            <div className="bg-gray-50 rounded px-2 py-1.5 inline-block">
                              <p className="text-sm text-gray-700">
                                {docType.document.file_name}
                              </p>
                            </div>
                            {docType.document.expiry_date && (
                              <span className={`text-sm ${
                                new Date(docType.document.expiry_date) < new Date()
                                  ? 'text-red-600'
                                  : new Date(docType.document.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                  ? 'text-orange-600'
                                  : 'text-muted-foreground'
                              }`}>
                                Expires: {new Date(docType.document.expiry_date).toLocaleDateString('en-GB')}
                              </span>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(docType.document.file_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-1.5" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadDocument(docType.document.file_url, docType.document.file_name)}
                            >
                              <Download className="h-4 w-4 mr-1.5" />
                              Download
                            </Button>
                            {docType.document.status !== 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveDocument(docType.document.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                              >
                                <Check className="h-4 w-4 mr-1.5" />
                                Approve
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-base font-medium mb-1.5">No Documents Found</p>
                <p className="text-sm max-w-[200px] mx-auto">No documents have been uploaded for this property yet</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={closeDocumentsModal}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}