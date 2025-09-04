"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Filter, Eye, MessageSquare, Check, X, Clock } from "lucide-react"

interface Application {
  id: string
  applicantName: string
  email: string
  phone: string
  propertyTitle: string
  propertyId: string
  status: "pending" | "approved" | "rejected" | "under-review"
  submittedDate: string
  monthlyIncome: number
  moveInDate: string
  employmentStatus: string
  currentAddress: string
}

export function ApplicationsTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  // Mock applications data
  const applications: Application[] = [
    {
      id: "1",
      applicantName: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "(555) 123-4567",
      propertyTitle: "Modern Downtown Loft",
      propertyId: "1",
      status: "pending",
      submittedDate: "2024-01-15",
      monthlyIncome: 8500,
      moveInDate: "2024-02-01",
      employmentStatus: "Employed Full-time",
      currentAddress: "456 Current St, San Francisco, CA",
    },
    {
      id: "2",
      applicantName: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "(555) 234-5678",
      propertyTitle: "Spacious Family Home",
      propertyId: "3",
      status: "approved",
      submittedDate: "2024-01-14",
      monthlyIncome: 12000,
      moveInDate: "2024-02-15",
      employmentStatus: "Self-employed",
      currentAddress: "789 Another St, Oakland, CA",
    },
    {
      id: "3",
      applicantName: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "(555) 345-6789",
      propertyTitle: "Modern Downtown Loft",
      propertyId: "1",
      status: "under-review",
      submittedDate: "2024-01-13",
      monthlyIncome: 7200,
      moveInDate: "2024-02-10",
      employmentStatus: "Employed Part-time",
      currentAddress: "321 Third St, Berkeley, CA",
    },
    {
      id: "4",
      applicantName: "David Wilson",
      email: "david.wilson@email.com",
      phone: "(555) 456-7890",
      propertyTitle: "Spacious Family Home",
      propertyId: "3",
      status: "rejected",
      submittedDate: "2024-01-12",
      monthlyIncome: 4500,
      moveInDate: "2024-03-01",
      employmentStatus: "Student",
      currentAddress: "654 Fourth St, San Francisco, CA",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <Check className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "under-review":
        return <Eye className="h-4 w-4" />
      case "rejected":
        return <X className="h-4 w-4" />
      default:
        return null
    }
  }

  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || application.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    // In a real app, this would update the database
    console.log(`Updating application ${applicationId} to ${newStatus}`)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>Move-in Date</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{application.applicantName}</div>
                      <div className="text-sm text-muted-foreground">{application.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{application.propertyTitle}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(application.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(application.status)}
                        {application.status.replace("-", " ")}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>£{application.monthlyIncome.toLocaleString()}</TableCell>
                  <TableCell>{new Date(application.moveInDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(application.submittedDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(application)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Application Details</DialogTitle>
                          </DialogHeader>
                          {selectedApplication && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Applicant Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <strong>Name:</strong> {selectedApplication.applicantName}
                                    </div>
                                    <div>
                                      <strong>Email:</strong> {selectedApplication.email}
                                    </div>
                                    <div>
                                      <strong>Phone:</strong> {selectedApplication.phone}
                                    </div>
                                    <div>
                                      <strong>Current Address:</strong> {selectedApplication.currentAddress}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Employment & Income</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <strong>Employment:</strong> {selectedApplication.employmentStatus}
                                    </div>
                                    <div>
                                      <strong>Monthly Income:</strong> £
                                      {selectedApplication.monthlyIncome.toLocaleString()}
                                    </div>
                                    <div>
                                      <strong>Move-in Date:</strong>{" "}
                                      {new Date(selectedApplication.moveInDate).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleStatusChange(selectedApplication.id, "approved")}
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleStatusChange(selectedApplication.id, "rejected")}
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject
                                </Button>
                                <Button variant="outline" className="bg-transparent">
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Message
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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
    </div>
  )
}
