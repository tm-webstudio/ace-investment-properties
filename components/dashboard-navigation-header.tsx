"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronRight, ChevronLeft, ChevronDown, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { UserDropdown } from "@/components/user-dropdown"
import { navigationLocations } from "@/lib/navigation-locations"

export function DashboardNavigationHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false)
  const [activeMobileRegion, setActiveMobileRegion] = useState<string | null>(null)
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()

  const mobileRegions = [
    { key: 'london',             name: 'London',                 subtext: 'Central, East, South & West areas',   locations: navigationLocations.london },
    { key: 'midlands',           name: 'Midlands',               subtext: 'Birmingham, Leicester & more',         locations: navigationLocations.midlands },
    { key: 'northWest',          name: 'North West',             subtext: 'Manchester, Liverpool & beyond',       locations: navigationLocations.northWest },
    { key: 'northEastYorkshire', name: 'North East & Yorkshire', subtext: 'Newcastle, Leeds & surrounding areas', locations: navigationLocations.northEastYorkshire },
    { key: 'southEast',          name: 'South East',             subtext: 'Kent, Surrey & the Home Counties',     locations: navigationLocations.southEast },
    { key: 'southWest',          name: 'South West',             subtext: 'Bristol, Devon & Cornwall',            locations: navigationLocations.southWest },
  ]

  // Prevent body scroll when mobile menu is open; reset sub-panels on close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      setIsMobileDropdownOpen(false)
      setActiveMobileRegion(null)
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

      {/* Mobile full-page overlay — fixed, starts below the 64px navbar */}
      <div
        className={`fixed inset-x-0 top-16 bottom-0 z-40 md:hidden overflow-hidden ${isOpen ? 'block' : 'hidden'}`}
      >
        {/* ── Main panel ── */}
        <div
          className={`absolute inset-0 bg-slate-50 overflow-y-auto ${isMobileDropdownOpen ? 'hidden' : 'block'}`}
        >
          {/* Browse Properties */}
          <button
            onClick={() => setIsMobileDropdownOpen(true)}
            className="flex items-center justify-between w-full px-6 py-5"
          >
            <span className="text-base font-medium text-gray-900">Browse Properties</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
          <div className="mx-6 border-b border-gray-200" />

          {/* For Investors */}
          <Link
            href="/investor"
            className="flex items-center justify-between px-6 py-5"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-base font-medium text-gray-900">For Investors</span>
          </Link>
          <div className="mx-6 border-b border-gray-200" />

          {/* Auth section */}
          <div className="px-6 py-6 flex flex-col gap-2">
            {user ? (
              <>
                <p className="text-sm text-gray-500 pb-1">
                  Welcome, {user.user_metadata?.first_name || user.email?.split("@")[0] || "User"}
                </p>
                {(() => {
                  const dashboardPath = user.user_metadata?.user_type === 'admin' ? '/admin/dashboard' : user.user_metadata?.user_type === 'landlord' ? '/landlord/dashboard' : '/investor/dashboard'
                  const isOnDashboard = pathname === dashboardPath

                  if (isOnDashboard) {
                    return (
                      <Button
                        variant="outline"
                        className="w-full text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900 text-sm justify-center py-3 rounded-none"
                        onClick={() => setIsOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    )
                  }

                  return (
                    <Link href={dashboardPath} onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900 text-sm justify-center py-3 rounded-none"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                  )
                })()}
                <Button
                  className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm justify-center py-3 rounded-none"
                  onClick={() => { signOut(); setIsOpen(false) }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button
                    variant="outline"
                    className="w-full text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900 text-sm justify-center py-3 rounded-none"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/investor/signup">
                  <Button
                    className="w-full bg-accent hover:bg-accent/80 border-accent border text-accent-foreground text-sm py-3 rounded-none"
                    onClick={() => setIsOpen(false)}
                  >
                    Join as Investor
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── Panel 2: Regions list ── */}
        <div
          className={`absolute inset-0 bg-slate-50 overflow-y-auto ${isMobileDropdownOpen ? 'block' : 'hidden'}`}
        >
          <button
            onClick={() => setIsMobileDropdownOpen(false)}
            className="flex items-center gap-2 w-full px-6 py-5"
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
            <span className="text-base font-medium text-primary">Browse Properties</span>
          </button>
          <div className="mx-6 border-b border-gray-200" />

          {mobileRegions.map(region => (
            <div key={region.key}>
              <button
                onClick={() => setActiveMobileRegion(activeMobileRegion === region.key ? null : region.key)}
                className="flex items-center justify-between w-full px-6 py-4"
              >
                <div className="text-left">
                  <div className="text-base font-medium text-gray-900">{region.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{region.subtext}</div>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${activeMobileRegion === region.key ? 'rotate-180' : ''}`} />
              </button>

              {/* Accordion locations */}
              <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${activeMobileRegion === region.key ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  {region.locations.map(loc => (
                    <Link
                      key={loc.slug}
                      href={`/properties?location=${loc.slug}`}
                      className="block px-8 py-2.5 text-sm text-gray-600 hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {loc.displayName}
                    </Link>
                  ))}
                  <div className="pb-2" />
                </div>
              </div>

              <div className="mx-6 border-b border-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
