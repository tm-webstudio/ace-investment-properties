"use client"

import { useState, useEffect, useRef } from "react"
import { Building, Filter, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { PropertyCard } from "./property-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Users, Mail, Phone } from "lucide-react"
import { PendingMetaStrip } from "./pending-meta-strip"
import { supabase } from "@/lib/supabase"

interface Property {
  id: string
  property_type: string
  bedrooms: string
  bathrooms: string
  monthly_rent: number
  available_date: string
  description: string
  amenities: string[]
  address: string
  city: string
  localAuthority: string
  postcode: string
  photos: string[]
  status: string
  published_at: string
  created_at: string
  updated_at: string
  availability: string
  landlord_id: string
  landlordName: string
  landlordEmail: string
  landlordPhone: string
  property_licence?: string
  property_condition?: string
  latitude?: number
  longitude?: number
}

interface AdminDashboardPropertiesProps {
  currentTab?: string
}

export function AdminDashboardProperties({ currentTab = 'properties' }: AdminDashboardPropertiesProps = {}) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [landlordModalOpen, setLandlordModalOpen] = useState(false)
  const [selectedLandlord, setSelectedLandlord] = useState<any>(null)
  const [matchedInvestors, setMatchedInvestors] = useState<any[]>([])
  const [matchedInvestorsLoading, setMatchedInvestorsLoading] = useState(false)
  const investorScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeftInvestors, setCanScrollLeftInvestors] = useState(false)
  const [canScrollRightInvestors, setCanScrollRightInvestors] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [filter])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Authentication required')
        setLoading(false)
        return
      }

      // Build query parameters
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter)
      }

      const response = await fetch(`/api/admin/properties?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch properties')
      }

      if (data.success) {
        console.log('Admin Dashboard - First property data:', data.properties[0])
        console.log('Admin Dashboard - Property licence:', data.properties[0]?.property_licence)
        console.log('Admin Dashboard - Property condition:', data.properties[0]?.property_condition)
        setProperties(data.properties)
      }
    } catch (err: any) {
      console.error('Error fetching properties:', err)
      setError(err.message || 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const getEmptyStateMessage = () => {
    switch (filter) {
      case 'draft':
        return {
          title: "No Pending Properties",
          description: "There are no properties awaiting approval"
        }
      case 'active':
        return {
          title: "No Active Properties",
          description: "No active properties found"
        }
      case 'rejected':
        return {
          title: "No Rejected Properties",
          description: "No rejected properties found"
        }
      default:
        return {
          title: "No Properties",
          description: "No properties found"
        }
    }
  }

  const emptyState = getEmptyStateMessage()

  const openLandlordModal = async (property: Property) => {
    setSelectedLandlord({
      name: property.landlordName || 'Unknown landlord',
      email: property.landlordEmail || '',
      phone: property.landlordPhone || '',
      submittedDate: property.created_at,
      property
    })
    setLandlordModalOpen(true)

    // Fetch matching investors
    await fetchMatchingInvestors(property.id)
  }

  const fetchMatchingInvestors = async (propertyId: string) => {
    try {
      setMatchedInvestorsLoading(true)
      setMatchedInvestors([])

      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        return
      }

      const response = await fetch(`/api/admin/properties/${propertyId}/matched-investors`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      console.log('Matched investors API response:', data)
      console.log('Investors count:', data.investors?.length)

      if (data.success && data.investors) {
        setMatchedInvestors(data.investors)
        setTimeout(updateScrollButtonsInvestors, 100)
      }
    } catch (err) {
      console.error('Error fetching matching investors:', err)
    } finally {
      setMatchedInvestorsLoading(false)
    }
  }

  const updateScrollButtonsInvestors = () => {
    if (investorScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = investorScrollRef.current
      setCanScrollLeftInvestors(scrollLeft > 0)
      setCanScrollRightInvestors(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollLeftInvestors = () => {
    if (investorScrollRef.current) {
      investorScrollRef.current.scrollBy({ left: -280, behavior: 'smooth' })
    }
  }

  const scrollRightInvestors = () => {
    if (investorScrollRef.current) {
      investorScrollRef.current.scrollBy({ left: 280, behavior: 'smooth' })
    }
  }

  // Filter properties based on search query
  const filteredProperties = properties.filter(property => {
    const searchLower = searchQuery.toLowerCase()
    return (
      (property.address || '').toLowerCase().includes(searchLower) ||
      (property.city || '').toLowerCase().includes(searchLower) ||
      (property.postcode || '').toLowerCase().includes(searchLower) ||
      (property.localAuthority || '').toLowerCase().includes(searchLower)
    )
  })

  return (
    <>
      {/* Search and Filter Bar */}
      <Card className="mb-6 bg-white shadow-sm">
        <CardContent className="px-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by address, city, or postcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 h-9 sm:h-10 bg-gray-50/30 border-gray-200 focus:bg-white focus:border-primary focus:ring-primary"
              />
            </div>
            <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
              <SelectTrigger className="w-full sm:w-[220px] h-9 sm:h-10 sm:min-h-10 bg-gray-50/30 border-gray-200 focus:bg-white focus:border-primary focus:ring-primary py-2 px-3">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-y-10">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-3">
              <div className="border border-border/50 rounded-none overflow-hidden bg-white">
                <div className="relative h-48 bg-gray-200/70 animate-pulse">
                  <div className="absolute top-4 left-4 h-6 w-16 bg-gray-300/80 rounded"></div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className="h-8 w-8 bg-gray-300/80 rounded"></div>
                    <div className="h-8 w-8 bg-gray-300/80 rounded"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="h-12 w-12 bg-gray-300/60 rounded-full"></div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[12px] border border-border/50 bg-white px-3 py-2 rounded-none">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 bg-gray-300 rounded-full"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 bg-gray-300 rounded-full"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
          <Building className="h-10 w-10 mx-auto mb-3 opacity-50 text-red-500" />
          <p className="text-base font-medium mb-1.5 text-red-600">Error Loading Properties</p>
          <p className="text-sm mb-4 max-w-[200px] mx-auto">{error}</p>
          <button
            onClick={fetchProperties}
            className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md text-sm"
          >
            Try Again
          </button>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
          <Building className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-base font-medium mb-1.5">{properties.length === 0 ? emptyState.title : "No Matching Properties"}</p>
          <p className="text-sm max-w-[200px] mx-auto">{properties.length === 0 ? emptyState.description : "Try adjusting your search or filters"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-y-12">
          {filteredProperties.map((property) => {
            return (
              <div key={property.id} className="space-y-2">
                <PropertyCard
                  property={property as any}
                  variant="admin"
                  onApprove={fetchProperties}
                  onReject={fetchProperties}
                  onPropertyDeleted={fetchProperties}
                  showGovernmentActions={property.status === 'draft'}
                  currentTab={currentTab}
                />

                <PendingMetaStrip
                  landlordName={property.landlordName}
                  submittedDate={property.created_at}
                  onClick={() => openLandlordModal(property)}
                />
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={landlordModalOpen} onOpenChange={setLandlordModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="items-start text-left">
            <DialogTitle>Landlord Details</DialogTitle>
            <DialogDescription>
              {selectedLandlord?.submittedDate
                ? `Submitted ${new Date(selectedLandlord.submittedDate).toLocaleDateString('en-GB')}`
                : 'Submission details'}
            </DialogDescription>
          </DialogHeader>

          {selectedLandlord && (
            <div className="space-y-4 overflow-hidden">
              <div className="flex items-start gap-3 p-4 bg-white border border-border/60 rounded-lg shadow-sm">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-base">{selectedLandlord.name}</h3>
                    <Badge variant="secondary" className="text-xs">Landlord</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Submitted {selectedLandlord.submittedDate
                      ? new Date(selectedLandlord.submittedDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
                      : 'Unknown submission'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 border rounded-lg bg-white/80 flex items-start gap-2">
                  <Mail className="h-4 w-4 text-accent mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                    <p className="font-medium break-words">{selectedLandlord.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="p-3 border rounded-lg bg-white/80 flex items-start gap-2">
                  <Phone className="h-4 w-4 text-accent mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedLandlord.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Matching Investors */}
              <div className="pt-3 mt-3 border-t">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium mb-3">
                  Matching Investors {matchedInvestors.length > 0 && `(${matchedInvestors.length})`}
                </p>

                {matchedInvestorsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  </div>
                ) : matchedInvestors.length > 0 ? (
                  <div className="relative overflow-hidden">
                    <div
                      ref={investorScrollRef}
                      className="flex gap-3 pb-2 overflow-x-auto scroll-smooth"
                      onScroll={updateScrollButtonsInvestors}
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch'
                      }}
                    >
                      {matchedInvestors.map((investor) => (
                        <div
                          key={investor.id}
                          className="flex-none w-[200px] border rounded-none overflow-hidden hover:shadow-md transition-shadow bg-white group"
                          style={{ scrollSnapAlign: 'start' }}
                        >
                          <div className="relative h-[120px] bg-gradient-to-br from-accent/10 to-accent/5 flex flex-col items-center justify-center border-b pt-3 pb-2">
                            <div className="h-10 w-10 rounded-full bg-white border-2 border-accent/20 flex items-center justify-center text-accent mb-2">
                              <Users className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900 text-center px-2 truncate w-full mb-1">
                              {investor.company_name || investor.full_name || 'Investor'}
                            </p>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 capitalize">
                              {investor.investor_type?.replace('_', ' ') || 'Investor'}
                            </Badge>
                            {investor.match_score !== undefined && (
                              <Badge
                                className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 bg-green-600 text-white rounded-none font-bold"
                              >
                                {investor.match_score}%
                              </Badge>
                            )}
                          </div>
                          <div className="p-3">
                            {investor.preference_data?.budget && (
                              <p className="text-xs font-semibold text-gray-900 mb-1.5">
                                £{investor.preference_data.budget.min?.toLocaleString()} - £{investor.preference_data.budget.max?.toLocaleString()}
                              </p>
                            )}
                            {investor.preference_data?.bedrooms && (
                              <p className="text-[10px] text-gray-600 mb-1.5">
                                {investor.preference_data.bedrooms.min}-{investor.preference_data.bedrooms.max} bedrooms
                              </p>
                            )}
                            {investor.match_breakdown && (
                              <div className="space-y-1 pt-1 border-t border-gray-100">
                                {[
                                  { label: 'Location', value: investor.match_breakdown.location },
                                  { label: 'Price', value: investor.match_breakdown.price },
                                  { label: 'Beds', value: investor.match_breakdown.bedrooms },
                                  { label: 'Type', value: investor.match_breakdown.type },
                                ].map(item => (
                                  <div key={item.label} className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-gray-500 w-12">{item.label}</span>
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${item.value >= 80 ? 'bg-green-500' : item.value >= 60 ? 'bg-amber-500' : 'bg-gray-400'}`}
                                        style={{ width: `${item.value}%` }}
                                      />
                                    </div>
                                    <span className="text-[9px] text-gray-500 w-6 text-right">{item.value}%</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <style jsx>{`
                      div::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>

                    {canScrollLeftInvestors && (
                      <button
                        onClick={scrollLeftInvestors}
                        className="absolute left-0 top-12 -translate-y-1/2 -translate-x-1 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 transition-colors z-10 border"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                    )}

                    {canScrollRightInvestors && (
                      <button
                        onClick={scrollRightInvestors}
                        className="absolute right-0 top-12 -translate-y-1/2 translate-x-1 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 transition-colors z-10 border"
                        aria-label="Scroll right"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 py-2">No matching investors found</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
