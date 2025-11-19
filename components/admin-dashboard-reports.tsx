"use client"

import { useState, useEffect } from "react"
import { FileText, Download, ExternalLink, CheckCircle, XCircle, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { PropertyTitle } from "@/components/property-title"
import { supabase } from "@/lib/supabase"

interface PropertyDocument {
  propertyId: string
  address: string
  city: string
  postcode: string
  image: string
  completedDocs: number
  totalDocs: number
}

interface DocumentDetail {
  type: string
  label: string
  document?: {
    file_name: string
    file_url: string
    uploaded_at: string
    expiry_date?: string
  }
}

export function AdminDashboardReports() {
  const [documents, setDocuments] = useState<PropertyDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<PropertyDocument | null>(null)
  const [propertyDocuments, setPropertyDocuments] = useState<DocumentDetail[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const filteredDocuments = documents.filter((doc) => {
    // Status filter
    let matchesStatus = true
    if (statusFilter === "complete") {
      matchesStatus = doc.completedDocs === doc.totalDocs
    } else if (statusFilter === "incomplete") {
      matchesStatus = doc.completedDocs > 0 && doc.completedDocs < doc.totalDocs
    } else if (statusFilter === "none") {
      matchesStatus = doc.completedDocs === 0
    }

    // Search filter
    const matchesSearch = searchQuery === "" ||
      doc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.postcode.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Authentication required')
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/documents', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch documents')
      }

      if (data.success && data.documents) {
        const formattedDocs = data.documents.map((doc: any) => ({
          propertyId: doc.propertyId,
          address: doc.address,
          city: doc.city,
          postcode: doc.postcode,
          image: doc.photos?.[0] || '/placeholder.jpg',
          completedDocs: doc.completedDocs,
          totalDocs: doc.totalDocs
        }))
        setDocuments(formattedDocs)
      }
    } catch (err: any) {
      console.error('Error fetching documents:', err)
      setError(err.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDocuments = async (property: PropertyDocument) => {
    setSelectedProperty(property)
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

  const closeDocumentsModal = () => {
    setDocumentsModalOpen(false)
    setSelectedProperty(null)
    setPropertyDocuments([])
  }

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-destructive"
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="rounded-none">
            <CardContent className="p-4">
              <div className="mb-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
              <div className="flex items-end gap-6">
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                  <div className="h-2 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
                <div className="h-9 bg-gray-200 rounded w-[120px] animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
        <FileText className="h-10 w-10 mx-auto mb-3 opacity-50 text-red-500" />
        <p className="text-base font-medium mb-1.5 text-red-600">Error Loading Documents</p>
        <p className="text-sm mb-4">{error}</p>
        <button
          onClick={fetchDocuments}
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md text-sm"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
        <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p className="text-base font-medium mb-1.5">No Documents Found</p>
        <p className="text-sm">Landlord documents will appear here</p>
      </div>
    )
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by address, city, or postcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="incomplete">Incomplete</SelectItem>
            <SelectItem value="none">No Documents</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-base font-medium mb-1.5">No Matching Documents</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((property) => {
          const percentage = (property.completedDocs / property.totalDocs) * 100

          return (
            <Card
              key={property.propertyId}
              className="rounded-none hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="mb-4">
                  <p className="font-semibold text-[15px] mb-1 line-clamp-1">
                    {property.address}, {property.city}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {property.postcode}
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
              </CardContent>
            </Card>
          )
        })}
      </div>
      )}

      {/* Documents Modal */}
      <Dialog open={documentsModalOpen} onOpenChange={setDocumentsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Documents</DialogTitle>
            <DialogDescription>
              {selectedProperty && (
                <PropertyTitle
                  address={selectedProperty.address}
                  city={selectedProperty.city}
                  postcode={selectedProperty.postcode}
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
                            <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">Awaiting Approval</Badge>
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
                              onClick={() => window.open(docType.document!.file_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-1.5" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadDocument(docType.document!.file_url, docType.document!.file_name)}
                            >
                              <Download className="h-4 w-4 mr-1.5" />
                              Download
                            </Button>
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
                <p className="text-sm">No documents have been uploaded for this property yet</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={closeDocumentsModal}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
