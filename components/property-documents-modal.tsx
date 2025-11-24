"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PropertyTitle } from "@/components/property-title"
import { FileText, Upload, Download, Eye, Trash2, X, AlertTriangle, CheckCircle } from "lucide-react"
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
  isAdmin?: boolean
}

export function PropertyDocumentsModal({ property, open, onClose, isAdmin = false }: PropertyDocumentsModalProps) {
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

  const handleApprove = async (documentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
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
        fetchDocuments()
      } else {
        alert('Failed to approve document')
      }
    } catch (error) {
      console.error('Error approving document:', error)
      alert('Error approving document')
    }
  }

  const getStatusBadge = (doc: Document | null) => {
    if (!doc) {
      return <Badge variant="secondary" className="bg-gray-200 text-gray-700">Not Uploaded</Badge>
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
                variant={isAdmin ? "title" : "full"}
              />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} className="rounded-none">
                    <CardContent className="py-2 px-3">
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
                        <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              documents.map((docGroup) => (
                <Card key={docGroup.type} className="rounded-none">
                  <CardContent className="py-2 px-3">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[15px]">{docGroup.label}</h3>
                      </div>
                      <div className="flex-shrink-0 ml-3">
                        {getStatusBadge(docGroup.document)}
                      </div>
                    </div>

                    {docGroup.document ? (
                      <div className="space-y-2">
                        {/* Filename with background */}
                        <div className="space-y-1.5">
                          <div className="bg-gray-50 rounded px-2 py-1.5 inline-block">
                            <p className="text-sm text-gray-700">
                              {docGroup.document.file_name}
                            </p>
                          </div>
                          {getExpiryText(docGroup.document)}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(docGroup.document!.id)}
                          >
                            <Eye className="h-4 w-4 mr-1.5" />
                            View
                          </Button>
                          {isAdmin && docGroup.document.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(docGroup.document!.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                            >
                              <CheckCircle className="h-4 w-4 mr-1.5" />
                              Approve
                            </Button>
                          )}
                          {!isAdmin && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpload(docGroup.type, docGroup.label)}
                              >
                                <Upload className="h-4 w-4 mr-1.5" />
                                Replace
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(docGroup.document!.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              >
                                <Trash2 className="h-4 w-4 mr-1.5" />
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-all">
                          <p className="text-sm text-gray-600 mb-3">
                            Drag and drop or choose file
                          </p>
                          <Button
                            size="sm"
                            onClick={() => handleUpload(docGroup.type, docGroup.label)}
                          >
                            <Upload className="h-4 w-4 mr-1.5" />
                            Choose File
                          </Button>
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
