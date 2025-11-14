"use client"

import { useState, useEffect } from "react"
import { FileText, Download, ExternalLink, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((property) => {
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
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                      </div>
                      <div className="h-9 bg-gray-200 rounded animate-pulse w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : propertyDocuments.length > 0 ? (
              <div className="space-y-3">
                {propertyDocuments.map((docType) => (
                  <div
                    key={docType.type}
                    className={`p-4 border rounded-lg ${
                      docType.document ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{docType.label}</h4>
                          {docType.document ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Uploaded
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              Missing
                            </Badge>
                          )}
                        </div>
                        {docType.document && (
                          <div className="text-sm text-gray-600">
                            <p>File: {docType.document.file_name}</p>
                            <p>Uploaded: {new Date(docType.document.uploaded_at).toLocaleDateString('en-GB')}</p>
                            {docType.document.expiry_date && (
                              <p className={
                                new Date(docType.document.expiry_date) < new Date()
                                  ? 'text-red-600 font-medium'
                                  : new Date(docType.document.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                  ? 'text-orange-600 font-medium'
                                  : ''
                              }>
                                Expires: {new Date(docType.document.expiry_date).toLocaleDateString('en-GB')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      {docType.document && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(docType.document!.file_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadDocument(docType.document!.file_url, docType.document!.file_name)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
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
