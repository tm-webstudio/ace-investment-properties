"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, Users, Building, Settings, FileText, Eye, Clock, UserCheck, TrendingUp } from "lucide-react"

interface AdminDashboardNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  customButton?: React.ReactNode
}

export function AdminDashboardNavigation({ activeTab, onTabChange, customButton }: AdminDashboardNavigationProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "properties", label: "Properties", icon: Building },
    { id: "users", label: "Users", icon: Users },
    { id: "viewings", label: "Viewings", icon: Eye },
    { id: "documents", label: "Documents", icon: FileText },
  ]

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <nav className="flex flex-wrap gap-0 border-b border-gray-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                group flex items-center gap-2 relative px-4 py-2.5
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

        {customButton}
      </div>
    </div>
  )
}