"use client"

import { useState, useEffect, useRef } from "react"
import { Users, Mail, Phone, Calendar, Search, MapPin, Home, PoundSterling, BedDouble, Loader2, ChevronLeft, ChevronRight, Building } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  full_name: string
  company_name?: string
  email: string
  phone: string
  user_type: string
  created_at: string
  property_count: number
  locations?: string[] // Preferred locations from preferences
}

interface InvestorPreferences {
  investor_id: string
  operator_type: string
  operator_type_other?: string
  properties_managing: number
  preference_data: {
    budget?: { min: number; max: number }
    bedrooms?: { min: number; max: number }
    property_types?: string[]
    locations?: Array<{ city: string; localAuthorities?: string[] }>
  }
  notification_enabled: boolean
  is_active: boolean
  updated_at: string
}

interface MatchedProperty {
  id: string
  title: string
  address: string
  city: string
  postcode?: string
  property_type: string
  bedrooms: string | number
  bathrooms: string | number
  monthly_rent: number
  price: number
  photos: string[]
  images?: string[]
  available_date?: string
  property_licence?: string
  property_condition?: string
  availability?: string
  status?: string
  matchScore: number
  matchReasons: string[]
}

export function AdminDashboardInvestors() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInvestor, setSelectedInvestor] = useState<User | null>(null)
  const [investorPreferences, setInvestorPreferences] = useState<InvestorPreferences | null>(null)
  const [preferencesLoading, setPreferencesLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [matchedProperties, setMatchedProperties] = useState<MatchedProperty[]>([])
  const [matchedPropertiesLoading, setMatchedPropertiesLoading] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchInvestors()
  }, [])

  const fetchInvestors = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Authentication required')
        setLoading(false)
        return
      }

      const response = await fetch(`/api/admin/users?userType=investor`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch investors')
      }

      if (data.success) {
        setUsers(data.users)
      }
    } catch (err: any) {
      console.error('Error fetching investors:', err)
      setError(err.message || 'Failed to load investors')
    } finally {
      setLoading(false)
    }
  }

  const fetchInvestorPreferences = async (investor: User) => {
    setSelectedInvestor(investor)
    setDialogOpen(true)
    setPreferencesLoading(true)
    setInvestorPreferences(null)
    setMatchedProperties([])
    setMatchedPropertiesLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        return
      }

      // Fetch preferences
      const response = await fetch(`/api/admin/investors/${investor.id}/preferences`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.success && data.preferences) {
        setInvestorPreferences(data.preferences)
      }

      // Fetch matched properties
      const matchedResponse = await fetch(`/api/admin/investors/${investor.id}/matched-properties?limit=10&minScore=60`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const matchedData = await matchedResponse.json()

      if (matchedData.success && matchedData.properties) {
        setMatchedProperties(matchedData.properties)
        setTimeout(updateScrollButtons, 100)
      }
    } catch (err) {
      console.error('Error fetching investor preferences:', err)
    } finally {
      setPreferencesLoading(false)
      setMatchedPropertiesLoading(false)
    }
  }

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scrollLeftHandler = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: 'smooth' })
      setTimeout(updateScrollButtons, 300)
    }
  }

  const scrollRightHandler = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: 'smooth' })
      setTimeout(updateScrollButtons, 300)
    }
  }

  const formatOperatorType = (type: string, other?: string) => {
    const types: Record<string, string> = {
      'sa_operator': 'SA Operator',
      'supported_living': 'Supported Living',
      'social_housing': 'Social Housing',
      'other': other || 'Other'
    }
    return types[type] || type
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPropertiesManaging = (count: number) => {
    if (count === 0) return '0 - Just starting'
    if (count === 1) return '1 property'
    if (count === 2) return '2-5 properties'
    if (count === 6) return '6-10 properties'
    if (count === 11) return '11-20 properties'
    if (count === 21) return '21-50 properties'
    if (count === 51) return '50+ properties'
    // Fallback for any other value
    return `${count} ${count === 1 ? 'property' : 'properties'}`
  }

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase()
    return (
      user.full_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.phone && user.phone.toLowerCase().includes(searchLower))
    )
  })

  return (
    <>
      {/* Search Bar */}
      <Card className="mb-6 bg-white shadow-sm">
        <CardContent className="px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 h-9 sm:h-10 bg-gray-50/30 border-gray-200 focus:bg-white focus:border-primary focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="rounded-none">
              <CardContent className="px-4 py-1">
                <div className="space-y-3">
                  {/* Header with name and badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-5 bg-gray-200 rounded w-3/5 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>

                  {/* Email, Phone, Joined */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>

                  {/* Location boxes separator and boxes */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="flex gap-1.5">
                      <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-50 text-red-500" />
          <p className="text-base font-medium mb-1.5 text-red-600">Error Loading Investors</p>
          <p className="text-sm mb-4 max-w-[200px] mx-auto">{error}</p>
          <button
            onClick={fetchInvestors}
            className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md text-sm"
          >
            Try Again
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-base font-medium mb-1.5">{users.length === 0 ? "No Investors" : "No Matching Investors"}</p>
          <p className="text-sm max-w-[200px] mx-auto">{users.length === 0 ? "No investor accounts found" : "Try adjusting your search"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="rounded-none hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => fetchInvestorPreferences(user)}
            >
              <CardContent className="px-4 py-1">
                <div className="flex items-start gap-4">
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-base truncate">
                        {user.company_name || user.full_name || 'Unknown User'}
                      </h3>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        Investor
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      {user.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{user.phone || 'Not provided'}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span>Joined {new Date(user.created_at).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>

                    {/* Location Box */}
                    {user.locations && user.locations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-1.5">
                          <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                          <span className="text-xs font-medium text-gray-600">Preferred Locations</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {user.locations.slice(0, 3).map((location, index) => (
                            <div
                              key={index}
                              className="inline-flex items-center px-2 py-1 bg-accent/10 border border-accent/20 rounded text-xs font-medium text-accent"
                            >
                              {location}
                            </div>
                          ))}
                          {user.locations.length > 3 && (
                            <div className="inline-flex items-center px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-medium text-gray-600">
                              +{user.locations.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Investor Preferences Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left">
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              {selectedInvestor?.company_name || selectedInvestor?.full_name || 'Investor'} Preferences
            </DialogTitle>
            <DialogDescription className="text-left">
              Investment preferences and criteria
            </DialogDescription>
          </DialogHeader>

          {preferencesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : investorPreferences ? (
            <div className="space-y-4 overflow-hidden">
              {/* Two column grid for preferences */}
              <div className="grid grid-cols-2 gap-4">
                {/* Operator Type */}
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium mb-1">Operator Type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatOperatorType(investorPreferences.operator_type, investorPreferences.operator_type_other)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Managing {formatPropertiesManaging(investorPreferences.properties_managing || 0)}
                  </p>
                </div>

                {/* Budget */}
                {investorPreferences.preference_data?.budget && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium mb-1">Budget Range</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(investorPreferences.preference_data.budget.min)} - {formatCurrency(investorPreferences.preference_data.budget.max)}
                    </p>
                  </div>
                )}

                {/* Bedrooms */}
                {investorPreferences.preference_data?.bedrooms && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium mb-1">Bedrooms</p>
                    <p className="text-sm font-medium text-gray-900">
                      {investorPreferences.preference_data.bedrooms.min} - {investorPreferences.preference_data.bedrooms.max} beds
                    </p>
                  </div>
                )}

                {/* Property Types */}
                {investorPreferences.preference_data?.property_types && investorPreferences.preference_data.property_types.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium mb-1.5">Property Types</p>
                    <div className="flex flex-wrap gap-1">
                      {investorPreferences.preference_data.property_types.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs font-normal capitalize">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locations */}
                {investorPreferences.preference_data?.locations && investorPreferences.preference_data.locations.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium mb-1.5">Preferred Locations</p>
                    <div className="flex flex-wrap gap-1">
                      {investorPreferences.preference_data.locations.map((loc, index) => {
                        const hasLocalAuthorities = loc.localAuthorities && loc.localAuthorities.length > 0
                        return (
                          <div key={index} className="flex flex-wrap items-center gap-1">
                            {/* City badge */}
                            <Badge variant="outline" className="text-xs font-normal bg-primary/5">
                              {loc.city}
                            </Badge>
                            {/* Local authorities badges */}
                            {hasLocalAuthorities && loc.localAuthorities!.map((auth, authIndex) => (
                              <Badge key={authIndex} variant="secondary" className="text-xs font-normal">
                                {auth}
                              </Badge>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Matched Properties */}
              <div className="pt-3 border-t overflow-hidden">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium mb-2">
                  Matched Properties {matchedProperties.length > 0 && `(${matchedProperties.length})`}
                </p>

                {matchedPropertiesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  </div>
                ) : matchedProperties.length > 0 ? (
                  <div className="relative overflow-hidden">
                    <div
                      ref={scrollRef}
                      className="flex overflow-x-auto gap-3 pb-1 scroll-smooth"
                      onScroll={updateScrollButtons}
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        scrollSnapType: 'x mandatory'
                      }}
                    >
                      {matchedProperties.map((property) => (
                        <a
                          key={property.id}
                          href={`/properties/${property.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-none w-[200px] border rounded-none overflow-hidden hover:shadow-md transition-shadow bg-white group"
                          style={{ scrollSnapAlign: 'start' }}
                        >
                          <div className="relative h-[120px] overflow-hidden">
                            {(property.photos?.[0] || property.images?.[0]) ? (
                              <img
                                src={property.photos?.[0] || property.images?.[0]}
                                alt={property.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <Building className="h-8 w-8 text-gray-300" />
                              </div>
                            )}
                            <Badge
                              className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-accent text-white rounded-none"
                            >
                              {property.availability === 'vacant' ? 'Vacant' : property.availability === 'tenanted' ? 'Tenanted' : 'Available'}
                            </Badge>
                            {property.matchScore !== undefined && (
                              <Badge
                                className="absolute bottom-2 right-2 text-[10px] px-1.5 py-0.5 bg-green-600 text-white rounded-none font-bold"
                              >
                                {property.matchScore}% Match
                              </Badge>
                            )}
                          </div>
                          <div className="p-2.5">
                            <p className="text-xs font-medium text-gray-900 truncate mb-0.5">
                              {property.address}, {property.city}
                            </p>
                            <p className="text-sm font-semibold text-accent mb-1">
                              £{(property.price || property.monthly_rent || 0).toLocaleString()} pcm
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {property.property_type} · {property.bedrooms} bed · {property.bathrooms} bath
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>

                    <style jsx>{`
                      div::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>

                    {canScrollLeft && (
                      <button
                        onClick={scrollLeftHandler}
                        className="absolute left-0 top-12 -translate-y-1/2 -translate-x-1 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 transition-colors z-10 border"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                    )}

                    {canScrollRight && (
                      <button
                        onClick={scrollRightHandler}
                        className="absolute right-0 top-12 -translate-y-1/2 translate-x-1 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 transition-colors z-10 border"
                        aria-label="Scroll right"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 py-2">No matching properties found</p>
                )}
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t">
                <span>Updated {new Date(investorPreferences.updated_at).toLocaleDateString('en-GB')}</span>
                <span>Notifications {investorPreferences.notification_enabled ? 'on' : 'off'}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No preferences set</p>
              <p className="text-xs mt-1">This investor hasn't configured their preferences yet</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
