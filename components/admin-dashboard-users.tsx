"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export function AdminDashboardUsers() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
        <Users className="w-8 h-8 text-muted-foreground/60" />
      </div>
      <h3 className="text-lg font-medium text-muted-foreground mb-2">User Management</h3>
      <p className="text-sm text-muted-foreground/70">
        User management interface coming soon
      </p>
    </div>
  )
}
