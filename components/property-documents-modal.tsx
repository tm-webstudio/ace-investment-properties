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
      return <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">Pending</Badge>
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
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">
                Documents - <PropertyTitle
                  address={property.address}
                  city={property.city}
                  postcode={property.postcode}
                />
              </DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              <PropertyTitle
                address={property.address}
                city={property.city}
                postcode={property.postcode}
                variant="full"
              />
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading documents...</p>
              </div>
            ) : (
              documents.map((docGroup) => (
                <Card key={docGroup.type}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold">{docGroup.label}</h3>
                          {docGroup.document && (
                            <p className="text-sm text-muted-foreground">{docGroup.document.file_name}</p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(docGroup.document)}
                    </div>

                    {docGroup.document ? (
                      <div className="space-y-3">
                        {docGroup.document.status === 'pending' && (
                          <p className="text-sm text-muted-foreground">Awaiting admin approval</p>
                        )}
                        {getExpiryText(docGroup.document)}

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(docGroup.document!.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(docGroup.document!.id, docGroup.document!.file_name)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpload(docGroup.type, docGroup.label)}
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Replace
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(docGroup.document!.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1 text-orange-500" />
                          Not uploaded
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleUpload(docGroup.type, docGroup.label)}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
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
