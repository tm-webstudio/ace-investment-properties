"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Upload, X, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface UploadDocumentDialogProps {
  open: boolean
  onClose: () => void
  propertyId: string
  documentType: string
  documentLabel: string
  onUploadComplete: () => void
}

export function UploadDocumentDialog({
  open,
  onClose,
  propertyId,
  documentType,
  documentLabel,
  onUploadComplete
}: UploadDocumentDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [expiryDate, setExpiryDate] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (selectedFile: File) => {
    setError(null)

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Only PDF, JPG, and PNG are allowed.')
      return
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.')
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Authentication required')
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)
      if (expiryDate) {
        formData.append('expiryDate', expiryDate)
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch(`/api/properties/${propertyId}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      })

      clearInterval(progressInterval)

      const data = await response.json()

      if (data.success) {
        setUploadProgress(100)
        setTimeout(() => {
          onUploadComplete()
          onClose()
        }, 500)
      } else {
        setError(data.error || 'Failed to upload document')
        setUploadProgress(0)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('An error occurred while uploading the document')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload {documentLabel}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-2">
                <FileText className="h-12 w-12 mx-auto text-primary" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag file here or{' '}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, JPG, PNG (Max 10MB)
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date (optional)</Label>
            <Input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
