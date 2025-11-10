"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { UserDropdown } from "@/components/user-dropdown"

export function DashboardNavigationHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading, signOut } = useAuth()

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <nav className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:max-w-8xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-sans font-black text-md sm:text-lg tracking-wide uppercase">ACE INVESTMENT PROPERTIES</span>
          </Link>

          {/* Desktop User Menu - centered */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            {!loading && user && <UserDropdown />}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary-foreground hover:bg-primary/20 border border-primary-foreground/30 rounded-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile slide-out menu */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 bg-primary transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu header */}
          <div className="flex items-center justify-between pl-6 pr-4 py-6 border-b border-primary-foreground/20">
            <span className="font-serif font-bold text-lg text-primary-foreground">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Menu content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-8 space-y-6">
            <div className="text-primary-foreground/60 text-sm">
              {user ? `Logged in as ${user.user_metadata?.first_name || user.email?.split("@")[0] || "User"}` : 'Dashboard'}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex-shrink-0 px-6 pb-8 space-y-4 border-t border-primary-foreground/20 pt-6 gap-0">
            {user ? (
              <>
                <div className="text-primary-foreground text-sm mb-3">
                  Welcome, {user.user_metadata?.first_name || user.email?.split("@")[0] || "User"}
                </div>
                <Link href={user.user_metadata?.user_type === 'admin' ? '/admin/dashboard' : user.user_metadata?.user_type === 'landlord' ? '/landlord/dashboard' : '/investor/dashboard'}>
                  <Button
                    variant="ghost"
                    className="w-full text-primary-foreground hover:bg-white hover:text-primary text-sm justify-center border-white border rounded-none py-3 transition-all duration-300 ease-in-out mb-3"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full text-primary-foreground hover:bg-red-50 hover:text-red-600 text-sm justify-center border-red-300 border rounded-none py-3 transition-all duration-300 ease-in-out"
                  onClick={() => {
                    signOut()
                    setIsOpen(false)
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/auth/signin">
                <Button
                  variant="ghost"
                  className="w-full text-primary-foreground hover:bg-white hover:text-primary text-sm justify-center border-white border rounded-none py-3 transition-all duration-300 ease-in-out"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}
    </nav>
  )
}
