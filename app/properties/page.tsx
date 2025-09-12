"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PropertyFilters } from "@/components/property-filters"
import { PropertyCard } from "@/components/property-card"
import { sampleProperties } from "@/lib/sample-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Grid, List, Filter, ChevronDown } from "lucide-react"

export default function PropertiesPage() {
  const [filteredProperties, setFilteredProperties] = useState(sampleProperties)
  const [sortBy, setSortBy] = useState("date")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (filters: any) => {
    let filtered = sampleProperties

    // Apply price filter
    if (filters.priceRange) {
      filtered = filtered.filter(
        (property) => property.price >= filters.priceRange[0] && property.price <= filters.priceRange[1],
      )
    }

    // Apply property type filter
    if (filters.propertyType && filters.propertyType !== "all") {
      filtered = filtered.filter((property) => property.propertyType === filters.propertyType)
    }

    // Apply city filter
    if (filters.city && filters.city !== "all") {
      filtered = filtered.filter((property) => property.city === filters.city)
    }

    // Apply amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter((property) =>
        filters.amenities.some((amenity: string) => property.amenities.includes(amenity)),
      )
    }

    setFilteredProperties(filtered)
  }

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "bedrooms":
        return b.bedrooms - a.bedrooms
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Available Properties</h1>
            <p className="text-muted-foreground text-lg">
              Discover your perfect rental home from our curated selection
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="mb-6 md:hidden">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 w-full justify-center"
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filters Bar */}
          <div className={`mb-6 ${showFilters ? 'block' : 'hidden'} md:block`}>
            <PropertyFilters onFilterChange={handleFilterChange} />
          </div>

          {/* Main Content */}
          <div>
              {/* Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <p className="text-muted-foreground">
                  Showing {sortedProperties.length} of {sampleProperties.length} properties
                </p>

                <div className="flex items-center gap-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date Listed</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="bedrooms">Bedrooms</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Properties Grid */}
              <div
                className={`grid gap-3 ${
                  viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                }`}
              >
                {sortedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {sortedProperties.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No properties match your current filters. Try adjusting your search criteria.
                  </p>
                </div>
              )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
