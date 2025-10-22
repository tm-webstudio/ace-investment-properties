import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PropertyCard } from "@/components/property-card"
import { TrendingUp, Heart, Calendar, Bell, Search, BarChart3, Home, Eye, Clock } from "lucide-react"
import Link from "next/link"
import type { Investor } from "@/lib/sample-data"
import { sampleSavedProperties, sampleViewings, sampleNotifications, sampleProperties, kentProperties, midlandsProperties } from "@/lib/sample-data"

interface InvestorDashboardOverviewProps {
  investor: Investor
}

export function InvestorDashboardOverview({ investor }: InvestorDashboardOverviewProps) {
  // Get all properties for reference
  const allProperties = [...sampleProperties, ...kentProperties, ...midlandsProperties]
  
  // Get investor's saved properties with property details
  const savedPropertiesWithDetails = sampleSavedProperties
    .filter(saved => saved.investorId === investor.id)
    .map(saved => {
      const property = allProperties.find(p => p.id === saved.propertyId)
      return { ...saved, property }
    })
    .filter(item => item.property)
    .slice(0, 5) // Show latest 5

  // Get investor's upcoming viewings
  const upcomingViewings = sampleViewings
    .filter(viewing => viewing.investorId === investor.id && viewing.status === "scheduled")
    .slice(0, 4) // Show next 4

  // Get investor's recent notifications
  const recentNotifications = sampleNotifications
    .filter(notif => notif.investorId === investor.id)
    .slice(0, 5) // Show latest 5

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_property":
        return <Home className="h-4 w-4" />
      case "price_change":
        return <TrendingUp className="h-4 w-4" />
      case "viewing_reminder":
        return <Calendar className="h-4 w-4" />
      case "market_update":
        return <BarChart3 className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "new_property":
        return "text-green-600"
      case "price_change":
        return "text-blue-600"
      case "viewing_reminder":
        return "text-orange-600"
      case "market_update":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-8">

      {/* Saved Properties */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Saved Properties</CardTitle>
          <Link href="/investor/saved-properties">
            <Button variant="outline" size="sm" className="bg-transparent">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {savedPropertiesWithDetails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {savedPropertiesWithDetails.map((item) => (
                <PropertyCard 
                  key={item.id} 
                  property={item.property!} 
                  variant="default" 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No saved properties yet</p>
              <p className="mb-4">Start exploring and save properties you're interested in</p>
              <Link href="/properties">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Browse Properties
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Viewings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Viewings</CardTitle>
            <Link href="/investor/viewings">
              <Button variant="outline" size="sm" className="bg-transparent">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingViewings.map((viewing) => (
                <div key={viewing.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{viewing.propertyTitle}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(viewing.viewingDate).toLocaleDateString('en-GB')}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {viewing.viewingTime}
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {viewing.status}
                  </Badge>
                </div>
              ))}
              {upcomingViewings.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No upcoming viewings scheduled</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Notifications</CardTitle>
            <Link href="/investor/notifications">
              <Button variant="outline" size="sm" className="bg-transparent">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentNotifications.map((notification) => (
                <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg ${!notification.isRead ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}