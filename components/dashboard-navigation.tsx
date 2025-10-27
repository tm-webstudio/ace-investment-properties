"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Plus, FileText, User, BarChart3, Edit3 } from "lucide-react"

interface DashboardNavigationProps {
  customButton?: React.ReactNode
}

export function DashboardNavigation({ customButton }: DashboardNavigationProps) {
  const pathname = usePathname()
  
  // Determine active tab based on current pathname
  const getActiveTab = () => {
    if (pathname.includes('/landlord/properties')) return 'properties'
    if (pathname.includes('/landlord/profile')) return 'profile'
    return 'dashboard' // default for /landlord/dashboard or /landlord
  }
  
  const activeTab = getActiveTab()

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/landlord/dashboard" },
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
                className={`
                  group flex items-center gap-2 relative overflow-hidden
                  transition-all duration-200 ease-out
                  hover:scale-[1.02] hover:-translate-y-px
                  hover:shadow-md hover:shadow-primary/10
                  active:scale-[0.98] active:transition-none
                  ${activeTab === item.id 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-primary/8 hover:text-primary hover:border-primary/15'
                  }
                `}
              >
                <item.icon className={`
                  h-4 w-4 transition-all duration-200 ease-out
                  ${activeTab === item.id ? '' : 'group-hover:scale-105'}
                `} />
                <span className="relative z-10 font-medium">
                  {item.label}
                </span>
              </Button>
            </Link>
          ))}
        </nav>

        {customButton || (
          <Link href="/landlord/add-property">
            <Button className="
              group bg-accent hover:bg-accent/90 text-accent-foreground 
              transition-all duration-200 ease-out
              hover:scale-[1.02] hover:-translate-y-px
              hover:shadow-md hover:shadow-accent/15
              active:scale-[0.98] active:transition-none
            ">
              <Plus className="mr-2 h-4 w-4 transition-all duration-200 ease-out group-hover:scale-105" />
              <span className="relative z-10 font-medium">Add New Property</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
