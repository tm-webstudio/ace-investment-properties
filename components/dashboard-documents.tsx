"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

  if (properties.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
        <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p className="text-base font-medium mb-1.5">No Properties Found</p>
        <p className="text-sm max-w-[200px] mx-auto">Add a property to start managing documents</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((property) => {
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
              </CardContent>
            </Card>
          )
        })}
      </div>

      {modalOpen && selectedProperty && (
        <PropertyDocumentsModal
          property={selectedProperty}
          open={modalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}
