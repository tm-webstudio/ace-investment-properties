"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative bg-primary text-primary-foreground py-20 lg:py-32">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Hero Content */}
          <div className="space-y-6">
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Find Your Perfect
              <br />
              Investment Property
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
              Connect landlords with quality tenants through our modern, trusted platform.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-0">
            <Link href="/properties">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all rounded-none py-6"
              >
                Find Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
