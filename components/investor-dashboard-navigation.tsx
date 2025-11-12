"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, BarChart3, Settings, Heart, Calendar } from "lucide-react"

interface InvestorDashboardNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  customButton?: React.ReactNode
}

export function InvestorDashboardNavigation({ activeTab, onTabChange, customButton }: InvestorDashboardNavigationProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "saved-properties", label: "Saved Properties", icon: Heart },
    { id: "viewings", label: "Viewings", icon: Calendar },
    { id: "profile", label: "Profile", icon: User },
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
                group flex items-center gap-2 relative px-3 py-2.5
                transition-all duration-200 ease-out
                border-b-2 -mb-px
                ${activeTab === item.id
                  ? 'border-primary text-primary bg-primary/5'
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