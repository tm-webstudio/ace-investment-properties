"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown, ChevronRight, ChevronLeft, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { UserDropdown } from "@/components/user-dropdown"
import { navigationLocations } from "@/lib/navigation-locations"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false)
  const [activeMobileRegion, setActiveMobileRegion] = useState<string | null>(null)

  const mobileRegions = [
    { key: 'london',               name: 'London',                 subtext: 'Central, East, South & West areas',     locations: navigationLocations.london },
    { key: 'midlands',             name: 'Midlands',               subtext: 'Birmingham, Leicester & more',           locations: navigationLocations.midlands },
    { key: 'northWest',            name: 'North West',             subtext: 'Manchester, Liverpool & beyond',         locations: navigationLocations.northWest },
    { key: 'northEastYorkshire',   name: 'North East & Yorkshire', subtext: 'Newcastle, Leeds & surrounding areas',   locations: navigationLocations.northEastYorkshire },
    { key: 'southEast',            name: 'South East',             subtext: 'Kent, Surrey & the Home Counties',       locations: navigationLocations.southEast },
    { key: 'southWest',            name: 'South West',             subtext: 'Bristol, Devon & Cornwall',              locations: navigationLocations.southWest },
  ]
  const { user, loading, signOut } = useAuth()
  const megaMenuTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const openMegaMenu = () => {
    clearTimeout(megaMenuTimer.current)
    setIsMegaMenuOpen(true)
  }
  const closeMegaMenu = () => {
    megaMenuTimer.current = setTimeout(() => setIsMegaMenuOpen(false), 80)
  }

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
    <nav className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg relative">
      {/* Main nav bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:max-w-8xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-sans font-black text-md sm:text-lg tracking-wide uppercase">ACE INVESTMENT PROPERTIES</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              className="flex items-center space-x-1 hover:text-accent transition-colors py-2"
              onMouseEnter={openMegaMenu}
              onMouseLeave={closeMegaMenu}
            >
              <span>Browse Properties</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <Link href="/investor" className="hover:text-accent transition-colors">
              For Investors
            </Link>
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <UserDropdown />
                    {user.user_metadata?.user_type !== 'investor' && (
                      <Link href="/investor/signup">
                        <Button className="bg-accent hover:bg-accent/80 border-accent border text-accent-foreground rounded-none transition-all duration-300 ease-in-out">
                          Join as Investor
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <Button
                        variant="ghost"
                        className="text-primary-foreground hover:bg-white hover:text-primary border-white border rounded-none transition-all duration-300 ease-in-out"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/investor/signup">
                      <Button className="bg-accent hover:bg-accent/80 border-accent border text-accent-foreground rounded-none transition-all duration-300 ease-in-out">
                        Join as Investor
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile hamburger */}
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

      {/* Desktop mega menu — full-width, anchored to nav bottom edge */}
      {isMegaMenuOpen && (
        <div
          className="hidden md:block absolute left-0 top-full w-full bg-slate-50 text-gray-900 shadow-xl border-t border-gray-200 z-[60]"
          onMouseEnter={openMegaMenu}
          onMouseLeave={closeMegaMenu}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:max-w-8xl py-8">
            <div className="grid grid-cols-4 gap-y-12">

              {/* London */}
              <div className="space-y-3 pr-6">
                <div>
                  <div className="font-semibold text-base text-primary">London</div>
                  <div className="text-xs text-gray-400 mt-0.5">Central, East, South &amp; West areas</div>
                </div>
                <div className="space-y-1 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {navigationLocations.london.map(loc => (
                    <Link
                      key={loc.slug}
                      href={`/properties?location=${loc.slug}`}
                      className="block text-xs hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                      onClick={() => setIsMegaMenuOpen(false)}
                    >
                      {loc.displayName}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Midlands */}
              <div className="space-y-3 px-6 border-l border-gray-200">
                <div>
                  <div className="font-semibold text-base text-primary">Midlands</div>
                  <div className="text-xs text-gray-400 mt-0.5">Birmingham, Leicester &amp; more</div>
                </div>
                <div className="space-y-1 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {navigationLocations.midlands.map(loc => (
                    <Link
                      key={loc.slug}
                      href={`/properties?location=${loc.slug}`}
                      className="block text-xs hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                      onClick={() => setIsMegaMenuOpen(false)}
                    >
                      {loc.displayName}
                    </Link>
                  ))}
                </div>
              </div>

              {/* North West */}
              <div className="space-y-3 px-6 border-l border-gray-200">
                <div>
                  <div className="font-semibold text-base text-primary">North West</div>
                  <div className="text-xs text-gray-400 mt-0.5">Manchester, Liverpool &amp; beyond</div>
                </div>
                <div className="space-y-1 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {navigationLocations.northWest.map(loc => (
                    <Link
                      key={loc.slug}
                      href={`/properties?location=${loc.slug}`}
                      className="block text-xs hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                      onClick={() => setIsMegaMenuOpen(false)}
                    >
                      {loc.displayName}
                    </Link>
                  ))}
                </div>
              </div>

              {/* North East & Yorkshire */}
              <div className="space-y-3 pl-6 border-l border-gray-200">
                <div>
                  <div className="font-semibold text-base text-primary">North East &amp; Yorkshire</div>
                  <div className="text-xs text-gray-400 mt-0.5">Newcastle, Leeds &amp; surrounding areas</div>
                </div>
                <div className="space-y-1 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {navigationLocations.northEastYorkshire.map(loc => (
                    <Link
                      key={loc.slug}
                      href={`/properties?location=${loc.slug}`}
                      className="block text-xs hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                      onClick={() => setIsMegaMenuOpen(false)}
                    >
                      {loc.displayName}
                    </Link>
                  ))}
                </div>
              </div>

              {/* South East */}
              <div className="space-y-3 pr-6">
                <div>
                  <div className="font-semibold text-base text-primary">South East</div>
                  <div className="text-xs text-gray-400 mt-0.5">Kent, Surrey &amp; the Home Counties</div>
                </div>
                <div className="space-y-1 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {navigationLocations.southEast.map(loc => (
                    <Link
                      key={loc.slug}
                      href={`/properties?location=${loc.slug}`}
                      className="block text-xs hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                      onClick={() => setIsMegaMenuOpen(false)}
                    >
                      {loc.displayName}
                    </Link>
                  ))}
                </div>
              </div>

              {/* South West */}
              <div className="space-y-3 px-6 border-l border-gray-200">
                <div>
                  <div className="font-semibold text-base text-primary">South West</div>
                  <div className="text-xs text-gray-400 mt-0.5">Bristol, Devon &amp; Cornwall</div>
                </div>
                <div className="space-y-1 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {navigationLocations.southWest.map(loc => (
                    <Link
                      key={loc.slug}
                      href={`/properties?location=${loc.slug}`}
                      className="block text-xs hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                      onClick={() => setIsMegaMenuOpen(false)}
                    >
                      {loc.displayName}
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Mobile full-page overlay — fixed, starts below the 64px navbar */}
      <div
        className={`fixed inset-x-0 top-16 bottom-0 z-40 md:hidden overflow-hidden
                    ${isOpen ? 'block' : 'hidden'}`}
      >
        {/* ── Main panel ── */}
        <div
          className={`absolute inset-0 bg-slate-50 overflow-y-auto
                      ${isMobileDropdownOpen ? 'hidden' : 'block'}`}
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
                <Link href={
                  user.user_metadata?.user_type === 'admin'
                    ? '/admin/dashboard'
                    : user.user_metadata?.user_type === 'landlord'
                    ? '/landlord/dashboard'
                    : '/investor/dashboard'
                }>
                  <Button
                    variant="outline"
                    className="w-full text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900 text-sm justify-center py-3 rounded-none transition-all duration-300 ease-in-out"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm justify-center py-3 rounded-none transition-all duration-300 ease-in-out"
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
                    className="w-full text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900 text-sm justify-center py-3 rounded-none transition-all duration-300 ease-in-out"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/investor/signup">
                  <Button
                    className="w-full bg-accent hover:bg-accent/80 border-accent border text-accent-foreground text-sm py-3 rounded-none transition-all duration-300 ease-in-out"
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
          className={`absolute inset-0 bg-slate-50 overflow-y-auto
                      ${isMobileDropdownOpen ? 'block' : 'hidden'}`}
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
