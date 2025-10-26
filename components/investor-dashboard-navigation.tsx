"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, BarChart3, Settings } from "lucide-react"

interface InvestorDashboardNavigationProps {
  customButton?: React.ReactNode
}

export function InvestorDashboardNavigation({ customButton }: InvestorDashboardNavigationProps) {
  const pathname = usePathname()
  
  // Determine active tab based on current pathname
  const getActiveTab = () => {
    if (pathname.includes('/investor/profile')) return 'profile'
    return 'dashboard' // default for /investor/dashboard or /investor
  }
  
  const activeTab = getActiveTab()

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/investor/dashboard" },
    { id: "profile", label: "Profile", icon: User, href: "/investor/profile" },
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
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {customButton || (
          <Link href="/investor/preferences">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Settings className="mr-2 h-4 w-4" />
              Edit Preferences
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}