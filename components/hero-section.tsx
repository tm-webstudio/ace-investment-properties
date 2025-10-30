"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative bg-primary text-primary-foreground py-28 lg:py-40 2xl:py-52">
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          {/* Hero Content */}
          <div className="space-y-4">
            <h1 className="font-serif text-3xl md:text-5xl lg:text-5xl font-bold leading-tight mb-3">
              Find The Best Property Deals On The Market
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/90 max-w-md mx-auto leading-relaxed">
              Discover high-yield investment properties handpicked for serious investors
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-0">
            <Link href="/investor/signup">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all rounded-none py-6"
              >
                Find Your Next Property
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
