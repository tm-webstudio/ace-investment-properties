"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, Building, Settings, FileText, Eye } from "lucide-react"

interface AdminDashboardNavigationProps {
  customButton?: React.ReactNode
}

export function AdminDashboardNavigation({ customButton }: AdminDashboardNavigationProps) {
  const pathname = usePathname()
  
  // Determine active tab based on current pathname
  const getActiveTab = () => {
    if (pathname.includes('/admin/properties')) return 'properties'
    if (pathname.includes('/admin/users')) return 'users'
    if (pathname.includes('/admin/viewings')) return 'viewings'
    if (pathname.includes('/admin/reports')) return 'reports'
    if (pathname.includes('/admin/settings')) return 'settings'
    return 'dashboard' // default for /admin/dashboard or /admin
  }
  
  const activeTab = getActiveTab()

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/admin/dashboard" },
    { id: "properties", label: "Properties", icon: Building, href: "/admin/properties" },
    { id: "users", label: "Users", icon: Users, href: "/admin/users" },
    { id: "viewings", label: "Viewings", icon: Eye, href: "/admin/viewings" },
    { id: "reports", label: "Reports", icon: FileText, href: "/admin/reports" },
    { id: "settings", label: "Settings", icon: Settings, href: "/admin/settings" },
  ]

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <nav className="flex flex-wrap gap-0 border-b border-gray-200">
          {navItems.map((item) => (
            <Link key={item.id} href={item.href}>
              <div
                className={`
                  group flex items-center gap-2 relative px-4 py-3
                  transition-all duration-200 ease-out
                  border-b-2 -mb-px
                  ${activeTab === item.id 
                    ? 'border-primary text-primary bg-primary/5' 
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }
                `}
              >
                <item.icon className={`
                  h-4 w-4 transition-all duration-200 ease-out
                `} />
                <span className="font-medium">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </nav>

        {customButton}
      </div>
    </div>
  )
}