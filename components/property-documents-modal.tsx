"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PropertyTitle } from "@/components/property-title"
import { FileText, Upload, Download, Eye, Trash2, X, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { supabase } from "@/lib/supabase"
import { UploadDocumentDialog } from "@/components/upload-document-dialog"

interface PropertySummary {
  propertyId: string
  name: string
  address: string
  city?: string
  postcode?: string
  image: string
  completedDocs: number
  totalDocs: number
}

interface Document {
  id: string
  document_type: string
  file_name: string
  status: string
  expiry_date: string | null
  uploaded_at: string
}

interface DocumentGroup {
  type: string
  label: string
  document: Document | null
}

interface PropertyDocumentsModalProps {
  property: PropertySummary
  open: boolean
  onClose: () => void
}

export function PropertyDocumentsModal({ property, open, onClose }: PropertyDocumentsModalProps) {
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<DocumentGroup[]>([])
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<string>("")
  const [selectedDocLabel, setSelectedDocLabel] = useState<string>("")

  useEffect(() => {
    if (open) {
      fetchDocuments()
    }
  }, [open, property.propertyId])

  const fetchDocuments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        return
      }

      const response = await fetch(`/api/properties/${property.propertyId}/documents`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = (docType: string, docLabel: string) => {
    setSelectedDocType(docType)
    setSelectedDocLabel(docLabel)
    setUploadDialogOpen(true)
  }

  const handleUploadComplete = () => {
    setUploadDialogOpen(false)
    fetchDocuments()
  }

  const handleView = async (documentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        return
      }

      const response = await fetch(`/api/documents/${documentId}/view`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        window.open(data.url, '_blank')
      }
    } catch (error) {
      console.error('Error viewing document:', error)
    }
  }

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        return
      }

      const response = await fetch(`/api/documents/${documentId}/view`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        const link = document.createElement('a')
        link.href = data.url
        link.download = fileName
        link.click()
      }
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        return
      }

      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        fetchDocuments()
      } else {
        alert('Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Error deleting document')
    }
  }

  const getStatusBadge = (doc: Document | null) => {
    if (!doc) {
      return <Badge variant="secondary" className="bg-gray-200 text-gray-700">Missing</Badge>
    }

    if (doc.status === 'pending') {
      return <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">Awaiting Approval</Badge>
    }

    if (doc.expiry_date) {
      const expiryDate = new Date(doc.expiry_date)
      const today = new Date()
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry < 0) {
        return <Badge variant="destructive">Expired</Badge>
      }

      if (daysUntilExpiry <= 30) {
        return <Badge variant="secondary" className="bg-orange-200 text-orange-800">Expiring</Badge>
      }
    }

    if (doc.status === 'approved') {
      return <Badge variant="secondary" className="bg-green-200 text-green-800">Valid</Badge>
    }

    return <Badge variant="secondary" className="bg-gray-200 text-gray-700">{doc.status}</Badge>
  }

  const getExpiryText = (doc: Document | null) => {
    if (!doc || !doc.expiry_date) return null

    const expiryDate = new Date(doc.expiry_date)
    const today = new Date()
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) {
      return (
        <span className="text-red-600 text-sm flex items-center">
          <AlertTriangle className="h-4 w-4 mr-1" />
          Expired {format(expiryDate, 'dd/MM/yyyy')}
        </span>
      )
    }

    if (daysUntilExpiry <= 30) {
      return (
        <span className="text-orange-600 text-sm flex items-center">
          <AlertTriangle className="h-4 w-4 mr-1" />
          Expires: {format(expiryDate, 'dd/MM/yyyy')} ({daysUntilExpiry} days)
        </span>
      )
    }

    return (
      <span className="text-muted-foreground text-sm">
        Expires: {format(expiryDate, 'dd/MM/yyyy')}
      </span>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-1.5 pr-10">
            <p className="text-sm font-medium text-muted-foreground">
              Property Documents
            </p>
            <DialogTitle className="text-xl leading-tight tracking-tight">
              <PropertyTitle
                address={property.address}
                city={property.city}
                postcode={property.postcode}
              />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} className="rounded-none">
                    <CardContent className="p-5">
                      {/* Header skeleton */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Document preview skeleton */}
                          <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-gray-200 animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-5 bg-gray-200 rounded w-2/5 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/5 animate-pulse"></div>
                          </div>
                        </div>
                        {/* Badge skeleton */}
                        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      {/* Status message skeleton */}
                      <div className="space-y-2 mb-3">
                        <div className="h-4 bg-gray-200 rounded w-2/5 animate-pulse"></div>
                      </div>
                      {/* Buttons skeleton */}
                      <div className="flex gap-2 flex-wrap pt-2 border-t">
                        <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              documents.map((docGroup) => (
                <Card key={docGroup.type} className="rounded-none border-l-4 border-l-transparent">
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Document preview/icon */}
                        {docGroup.document ? (
                          <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                            {/* PDF/Document icon overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            {/* Small document lines decoration */}
                            <div className="absolute bottom-2 left-2 right-2 space-y-0.5">
                              <div className="h-0.5 bg-blue-400/30 rounded"></div>
                              <div className="h-0.5 bg-blue-400/30 rounded w-3/4"></div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[15px]">{docGroup.label}</h3>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-3">
                        {getStatusBadge(docGroup.document)}
                      </div>
                    </div>

                    {docGroup.document ? (
                      <div className="space-y-3">
                        {/* Filename and expiry */}
                        <div className="space-y-1.5">
                          <p className="text-sm text-muted-foreground truncate">
                            {docGroup.document.file_name}
                          </p>
                          {getExpiryText(docGroup.document)}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 flex-wrap pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(docGroup.document!.id)}
                            className="flex-1 sm:flex-none"
                          >
                            <Eye className="h-4 w-4 mr-1.5" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(docGroup.document!.id, docGroup.document!.file_name)}
                            className="flex-1 sm:flex-none"
                          >
                            <Download className="h-4 w-4 mr-1.5" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpload(docGroup.type, docGroup.label)}
                            className="flex-1 sm:flex-none"
                          >
                            <Upload className="h-4 w-4 mr-1.5" />
                            Replace
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(docGroup.document!.id)}
                            className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-4 w-4 mr-1.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          Not uploaded
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-all">
                          <div className="flex flex-col items-center gap-3">
                            <Upload className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Drag and drop your file here
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                PDF, JPG or PNG (Max 10MB)
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleUpload(docGroup.type, docGroup.label)}
                              className="mt-1"
                            >
                              <Upload className="h-4 w-4 mr-1.5" />
                              Choose File
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {uploadDialogOpen && (
        <UploadDocumentDialog
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          propertyId={property.propertyId}
          documentType={selectedDocType}
          documentLabel={selectedDocLabel}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </>
  )
}
