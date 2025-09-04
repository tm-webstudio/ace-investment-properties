"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Plus, FileText, User, BarChart3 } from "lucide-react"

export function DashboardNavigation() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/landlord/dashboard" },
    { id: "properties", label: "My Properties", icon: Home, href: "/landlord/properties" },
    { id: "applications", label: "Applications", icon: FileText, href: "/landlord/applications" },
    { id: "profile", label: "Profile", icon: User, href: "/landlord/profile" },
  ]

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link key={item.id} href={item.href}>
              <Button
                variant={activeTab === item.id ? "default" : "ghost"}
                className="flex items-center gap-2"
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <Link href="/landlord/add-property">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Add New Property
          </Button>
        </Link>
      </div>
    </div>
  )
}
