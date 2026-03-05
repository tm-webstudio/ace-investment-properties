import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { FeaturedProperties } from "@/components/featured-properties"
import { ScrollToTop } from "@/components/scroll-to-top"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <HeroSection />
        <section className="py-6 md:py-10 bg-background">
          <div className="flex flex-col gap-3 md:gap-6">
            <FeaturedProperties
              city="London"
              title="Newly Added London Properties"
              subtitle="Discover our handpicked selection of premium London rental properties available now"
            />
            <FeaturedProperties
              city="Midlands"
              title="Newly Added Midlands Properties"
              subtitle="Discover our handpicked selection of premium Midlands rental properties available now"
            />
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
