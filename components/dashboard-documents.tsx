"use client"

import { useState, useEffect } from "react"
import { PropertyDocumentsCard } from "@/components/property-documents-card"
import { PropertyDocumentsModal } from "@/components/property-documents-modal"
import { supabase } from "@/lib/supabase"
import { FileText } from "lucide-react"

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

export function DashboardDocuments() {
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<PropertySummary[]>([])
  const [selectedProperty, setSelectedProperty] = useState<PropertySummary | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchPropertiesSummary()
  }, [])

  const fetchPropertiesSummary = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        return
      }

      const response = await fetch('/api/landlord/properties-documents-summary', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setProperties(data.properties)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDocuments = (property: PropertySummary) => {
    setSelectedProperty(property)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedProperty(null)
    // Refresh the summary to get updated counts
    fetchPropertiesSummary()
  }

  if (loading) {
    return (
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              {/* Image skeleton */}
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              {/* Content skeleton */}
              <div className="p-6 space-y-3">
                <div className="space-y-2 mb-4">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                </div>
                <div className="flex items-end gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="h-2 bg-gray-200 rounded animate-pulse w-full"></div>
                  </div>
                  <div className="h-9 bg-gray-200 rounded animate-pulse w-[120px]"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      {properties.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-base font-medium mb-1.5">No Properties Found</p>
          <p className="text-sm">Add a property to start managing documents</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {properties.map((property) => (
            <PropertyDocumentsCard
              key={property.propertyId}
              property={property}
              onViewDocuments={handleViewDocuments}
            />
          ))}
        </div>
      )}

      {modalOpen && selectedProperty && (
        <PropertyDocumentsModal
          property={selectedProperty}
          open={modalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
