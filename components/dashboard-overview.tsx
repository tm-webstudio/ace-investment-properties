import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { KeyRound as Pound, Home, FileText, TrendingUp, Eye, MessageSquare, Plus } from "lucide-react"
import Link from "next/link"
import type { Landlord } from "@/lib/sample-data"

interface DashboardOverviewProps {
  landlord: Landlord
}

export function DashboardOverview({ landlord }: DashboardOverviewProps) {
  // Mock recent applications data
  const recentApplications = [
    {
      id: "1",
      applicantName: "Sarah Johnson",
      propertyTitle: "Modern Downtown Loft",
      status: "pending",
      submittedDate: "2024-01-15",
      monthlyIncome: 8500,
    },
    {
      id: "2",
      applicantName: "Michael Chen",
      propertyTitle: "Spacious Family Home",
      status: "approved",
      submittedDate: "2024-01-14",
      monthlyIncome: 12000,
    },
    {
      id: "3",
      applicantName: "Emily Davis",
      propertyTitle: "Modern Downtown Loft",
      status: "under-review",
      submittedDate: "2024-01-13",
      monthlyIncome: 7200,
    },
    {
      id: "4",
      applicantName: "David Wilson",
      propertyTitle: "Spacious Family Home",
      status: "rejected",
      submittedDate: "2024-01-12",
      monthlyIncome: 4500,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "under-review":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{landlord.properties.length}</div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{landlord.activeListings}</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{landlord.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Pound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{landlord.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Applications</CardTitle>
          <Link href="/landlord/applications">
            <Button variant="outline" size="sm" className="bg-transparent">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">{application.applicantName}</TableCell>
                  <TableCell>{application.propertyTitle}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(application.status)}>{application.status.replace("-", " ")}</Badge>
                  </TableCell>
                  <TableCell>£{application.monthlyIncome.toLocaleString()}</TableCell>
                  <TableCell>{new Date(application.submittedDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/landlord/add-property">
              <Button className="w-full h-20 flex flex-col items-center justify-center bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="h-6 w-6 mb-2" />
                Add New Property
              </Button>
            </Link>
            <Link href="/landlord/applications">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center bg-transparent"
              >
                <FileText className="h-6 w-6 mb-2" />
                Review Applications
              </Button>
            </Link>
            <Link href="/landlord/messages">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center bg-transparent"
              >
                <MessageSquare className="h-6 w-6 mb-2" />
                View Messages
              </Button>
            </Link>
            <Link href="/investor/dashboard">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center bg-transparent"
              >
                <TrendingUp className="h-6 w-6 mb-2" />
                Investor Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
