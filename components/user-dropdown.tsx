"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronDown, User, LogOut, BarChart3 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function UserDropdown() {
  const { user, signOut } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const getUserName = () => {
    if (user.user_metadata?.first_name) {
      return user.user_metadata.first_name
    }
    return user.email?.split("@")[0] || "User"
  }

  const getDashboardPath = () => {
    const userType = user.user_metadata?.user_type || 'investor'
    switch (userType) {
      case 'admin':
        return '/admin/dashboard'
      case 'landlord':
        return '/landlord/dashboard'
      case 'investor':
      default:
        return '/investor/dashboard'
    }
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsDropdownOpen(true)}
      onMouseLeave={() => setIsDropdownOpen(false)}
    >
      <Button
        variant="ghost"
        className="text-primary-foreground hover:bg-white hover:text-primary border-white border rounded-none transition-all duration-300 ease-in-out flex items-center gap-2"
      >
        <User className="h-4 w-4" />
        <span>{getUserName()}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isDropdownOpen && (
        <>
          {/* Invisible bridge to prevent hover gap */}
          <div className="absolute top-full left-0 right-0 h-[0.85rem] z-[59]" />
          <div 
            className="absolute top-[calc(100%+0.85rem)] left-1/2 transform -translate-x-1/2 w-48 bg-white text-gray-900 shadow-2xl border border-gray-200 z-[60]"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <div className="p-2">
              <Link
                href={getDashboardPath()}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors rounded"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-red-50 hover:text-red-600 transition-colors rounded"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}