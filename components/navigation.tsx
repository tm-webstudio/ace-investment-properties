"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown } from "lucide-react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-28">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-serif font-bold text-xl">Ace Investment Properties</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <div
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button className="flex items-center space-x-1 hover:text-accent transition-colors py-2">
                <span>Browse Properties</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {isMegaMenuOpen && (
                <>
                  {/* Invisible bridge to prevent hover gap */}
                  <div className="absolute top-full left-0 right-0 h-[0.75rem] z-[59]" />
                  <div 
                    className="absolute top-[calc(100%+0.75rem)] left-1/2 transform -translate-x-1/2 w-screen max-w-4xl bg-white text-gray-900 shadow-2xl border border-gray-200 z-[60]"
                    onMouseEnter={() => setIsMegaMenuOpen(true)}
                    onMouseLeave={() => setIsMegaMenuOpen(false)}
                  >
                    <div className="p-8">
                      <div className="grid grid-cols-4 gap-8">
                        {/* London Column */}
                        <div className="space-y-4">
                          <h3 className="font-serif font-bold text-lg text-primary border-b border-gray-300 pb-2">
                            London
                          </h3>
                          <div className="space-y-2">
                            <Link
                              href="/properties?location=north-london"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              North London
                            </Link>
                            <Link
                              href="/properties?location=east-london"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              East London
                            </Link>
                            <Link
                              href="/properties?location=south-london"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              South London
                            </Link>
                            <Link
                              href="/properties?location=west-london"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              West London
                            </Link>
                            <Link
                              href="/properties?location=central-london"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              Central London
                            </Link>
                          </div>
                        </div>

                        {/* Midlands Column */}
                        <div className="space-y-4">
                          <h3 className="font-serif font-bold text-lg text-primary border-b border-gray-300 pb-2">
                            Midlands
                          </h3>
                          <div className="space-y-2">
                            <Link
                              href="/properties?location=birmingham"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              Birmingham
                            </Link>
                            <Link
                              href="/properties?location=coventry"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              Coventry
                            </Link>
                            <Link
                              href="/properties?location=leicester"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              Leicester
                            </Link>
                            <Link
                              href="/properties?location=nottingham"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              Nottingham
                            </Link>
                          </div>
                        </div>

                        {/* North England Column */}
                        <div className="space-y-4">
                          <h3 className="font-serif font-bold text-lg text-primary border-b border-gray-300 pb-2">
                            North England
                          </h3>
                          <div className="space-y-2">
                            <Link
                              href="/properties?location=manchester"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              Manchester
                            </Link>
                            <Link
                              href="/properties?location=liverpool"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              Liverpool
                            </Link>
                            <Link
                              href="/properties?location=leeds"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              Leeds
                            </Link>
                            <Link
                              href="/properties?location=newcastle"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              Newcastle
                            </Link>
                          </div>
                        </div>

                        {/* South England Column */}
                        <div className="space-y-4">
                          <h3 className="font-serif font-bold text-lg text-primary border-b border-gray-300 pb-2">
                            South England
                          </h3>
                          <div className="space-y-2">
                            <Link
                              href="/properties?location=brighton"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              Brighton
                            </Link>
                            <Link
                              href="/properties?location=bristol"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              Bristol
                            </Link>
                            <Link
                              href="/properties?location=oxford"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              Oxford
                            </Link>
                            <Link
                              href="/properties?location=cambridge"
                              className="block text-sm hover:text-primary hover:bg-primary/10 transition-colors py-1 px-2 rounded"
                            >
                              Cambridge
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-border">
                        <Link
                          href="/properties"
                          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                        >
                          View All Properties
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link href="/landlord" className="hover:text-accent transition-colors">
              For Landlords
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button
                variant="ghost"
                className="text-primary-foreground hover:bg-white hover:text-primary border-white border rounded-none transition-all duration-300 ease-in-out"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/landlord/add-property">
              <Button className="bg-accent hover:bg-accent/80 border-accent border text-accent-foreground rounded-none transition-all duration-300 ease-in-out">
                List Your Property
              </Button>
            </Link>
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
          <div className="flex items-center justify-between p-6 border-b border-primary-foreground/20">
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
            <div className="space-y-4">
              <button
                onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                className="flex items-center justify-between w-full text-lg font-medium text-primary-foreground hover:text-accent transition-colors py-2"
              >
                <span>Browse Properties</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isMobileDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isMobileDropdownOpen && (
                <div className="space-y-3 pl-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="text-sm font-medium text-primary-foreground/80">London</div>
                  <div className="space-y-2 pl-2">
                    <Link
                      href="/properties?location=north-london"
                      className="block text-sm text-primary-foreground hover:text-accent transition-colors py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      North London
                    </Link>
                    <Link
                      href="/properties?location=east-london"
                      className="block text-sm text-primary-foreground hover:text-accent transition-colors py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      East London
                    </Link>
                    <Link
                      href="/properties?location=south-london"
                      className="block text-sm text-primary-foreground hover:text-accent transition-colors py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      South London
                    </Link>
                    <Link
                      href="/properties?location=west-london"
                      className="block text-sm text-primary-foreground hover:text-accent transition-colors py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      West London
                    </Link>
                    <Link
                      href="/properties?location=central-london"
                      className="block text-sm text-primary-foreground hover:text-accent transition-colors py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      Central London
                    </Link>
                  </div>

                  <div className="text-sm font-medium text-primary-foreground/80 pt-2">Midlands</div>
                  <div className="space-y-2 pl-2">
                    <Link
                      href="/properties?location=birmingham"
                      className="block text-sm text-primary-foreground hover:text-accent transition-colors py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      Birmingham
                    </Link>
                    <Link
                      href="/properties?location=coventry"
                      className="block text-sm text-primary-foreground hover:text-accent transition-colors py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      Coventry
                    </Link>
                    <Link
                      href="/properties?location=leicester"
                      className="block text-sm text-primary-foreground hover:text-accent transition-colors py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      Leicester
                    </Link>
                  </div>

                  <div className="text-sm font-medium text-primary-foreground/80 pt-2">North England</div>
                  <div className="space-y-2 pl-2">
                    <Link
                      href="/properties?location=manchester"
                      className="block text-sm text-primary-foreground hover:text-accent transition-colors py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      Manchester
                    </Link>
                    <Link
                      href="/properties?location=liverpool"
                      className="block text-sm text-primary-foreground hover:text-accent transition-colors py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      Liverpool
                    </Link>
                    <Link
                      href="/properties?location=leeds"
                      className="block text-sm text-primary-foreground hover:text-accent transition-colors py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      Leeds
                    </Link>
                  </div>

                  <Link
                    href="/properties"
                    className="block text-sm font-medium text-accent py-2 border-t border-primary-foreground/20 mt-4 pt-4"
                    onClick={() => setIsOpen(false)}
                  >
                    View All Properties
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/landlord"
              className="block text-lg text-primary-foreground hover:text-accent transition-colors py-3"
              onClick={() => setIsOpen(false)}
            >
              For Landlords
            </Link>
          </div>

          <div className="flex-shrink-0 px-6 pb-8 space-y-4 border-t border-primary-foreground/20 pt-6 gap-0">
            <Link href="/auth/signin">
              <Button
                variant="ghost"
                className="w-full text-primary-foreground hover:bg-white hover:text-primary text-base justify-center border-white border rounded-none py-5 transition-all duration-300 ease-in-out"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Button>
            </Link>
            <Link href="/landlord/add-property">
              <Button
                className="w-full bg-accent hover:bg-accent/80 border-accent border text-accent-foreground py-6 rounded-none text-base transition-all duration-300 ease-in-out"
                onClick={() => setIsOpen(false)}
              >
                List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}
    </nav>
  )
}