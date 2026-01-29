"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, FileText, User, BarChart3, Home, Calendar } from "lucide-react"

interface DashboardNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  customButton?: React.ReactNode
}

export function DashboardNavigation({ activeTab, onTabChange, customButton }: DashboardNavigationProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "properties", label: "Properties", icon: Home },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "viewings", label: "Viewings", icon: Calendar },
    { id: "profile", label: "Profile", icon: User },
  ]

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <nav className="flex gap-0 border-b border-gray-200 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-horizontal-only -mx-4 px-4 sm:mx-0 sm:px-0">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                group flex items-center gap-2 relative px-4 py-2.5 whitespace-nowrap flex-shrink-0
                transition-all duration-200 ease-out
                border-b-2 -mb-px
                ${activeTab === item.id
                  ? 'border-primary text-primary bg-gray-100'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }
              `}
            >
              <item.icon className="h-3.5 w-3.5 transition-all duration-200 ease-out" />
              <span className="text-sm font-medium">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {customButton || (
          <Link href="/landlord/submit-property" className="hidden md:inline-flex">
            <Button className="
              group bg-accent hover:bg-accent/90 text-accent-foreground
              transition-all duration-200 ease-out
              hover:scale-[1.02] hover:-translate-y-px
              hover:shadow-md hover:shadow-accent/15
              active:scale-[0.98] active:transition-none
            ">
              <Plus className="mr-2 h-4 w-4 transition-all duration-200 ease-out group-hover:scale-105" />
              <span className="relative z-10 font-medium">Submit New Property</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
