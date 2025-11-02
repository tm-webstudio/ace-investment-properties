"use client"

import { useState, useEffect } from "react"
import { PropertyDocumentsCard } from "@/components/property-documents-card"
import { PropertyDocumentsModal } from "@/components/property-documents-modal"
import { supabase } from "@/lib/supabase"

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
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No properties found. Add a property to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
