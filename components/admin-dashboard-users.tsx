"use client"

import { useState, useEffect } from "react"
import { Users, Mail, Phone, Building, Calendar, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  full_name: string
  email: string
  phone: string
  user_type: string
  created_at: string
  property_count: number
}

export function AdminDashboardUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'landlord' | 'investor'>('all')

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const fetchUsers = async () => {
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
        params.append('userType', filter)
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users')
      }

      if (data.success) {
        setUsers(data.users)
      }
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="rounded-none">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-300 animate-pulse"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  </div>
                </div>
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
        <Users className="h-10 w-10 mx-auto mb-3 opacity-50 text-red-500" />
        <p className="text-base font-medium mb-1.5 text-red-600">Error Loading Users</p>
        <p className="text-sm mb-4 max-w-[200px] mx-auto">{error}</p>
        <button
          onClick={fetchUsers}
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md text-sm"
        >
          Try Again
        </button>
      </div>
    )
  }

  const getEmptyStateMessage = () => {
    switch (filter) {
      case 'landlord':
        return {
          title: "No Landlords",
          description: "No landlord accounts found"
        }
      case 'investor':
        return {
          title: "No Investors",
          description: "No investor accounts found"
        }
      default:
        return {
          title: "No Users",
          description: "No users found"
        }
    }
  }

  const emptyState = getEmptyStateMessage()

  return (
    <>
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filter === 'all' ? "default" : "outline"}
          onClick={() => setFilter('all')}
          className="h-9"
        >
          <Filter className="h-4 w-4 mr-2" />
          All Users
        </Button>
        <Button
          variant={filter === 'landlord' ? "default" : "outline"}
          onClick={() => setFilter('landlord')}
          className="h-9"
        >
          <Filter className="h-4 w-4 mr-2" />
          Landlords
        </Button>
        <Button
          variant={filter === 'investor' ? "default" : "outline"}
          onClick={() => setFilter('investor')}
          className="h-9"
        >
          <Filter className="h-4 w-4 mr-2" />
          Investors
        </Button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground min-h-[320px] flex flex-col items-center justify-center">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-base font-medium mb-1.5">{emptyState.title}</p>
          <p className="text-sm max-w-[200px] mx-auto">{emptyState.description}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user.id} className="rounded-none hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-accent" />
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-base truncate">
                        {user.full_name || 'Unknown User'}
                      </h3>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {user.user_type === 'landlord' ? 'Landlord' : 'Investor'}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      {user.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}

                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{user.phone}</span>
                        </div>
                      )}

                      {user.user_type === 'landlord' && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 flex-shrink-0" />
                          <span>{user.property_count} {user.property_count === 1 ? 'property' : 'properties'}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span>Joined {new Date(user.created_at).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
