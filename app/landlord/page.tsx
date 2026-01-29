"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Shield, Star, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

export default function LandlordLandingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // User is authenticated, redirect to dashboard
          router.push('/landlord/dashboard')
          return
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }
  const benefits = [
    {
      icon: Users,
      title: "Find Quality Tenants",
      description:
        "Our rigorous screening process ensures you connect with reliable, verified tenants who will care for your property.",
    },
    {
      icon: TrendingUp,
      title: "Maximize Rental Income",
      description:
        "Competitive market analysis and dynamic pricing tools help you achieve optimal rental rates for your properties.",
    },
    {
      icon: Shield,
      title: "Secure & Protected",
      description:
        "Comprehensive tenant verification, secure payment processing, and legal protection for your peace of mind.",
    },
  ]

  const features = [
    "Professional property photography",
    "24/7 tenant support",
    "Automated rent collection",
    "Maintenance request management",
    "Legal document templates",
    "Market analytics dashboard",
  ]

  const testimonials = [
    {
      name: "James Mitchell",
      location: "London",
      properties: 8,
      quote:
        "Since joining Ace Investment Properties, my occupancy rate has increased to 98% and I've reduced void periods by 60%. The quality of tenants is exceptional.",
      rating: 5,
    },
    {
      name: "Sarah Thompson",
      location: "Manchester",
      properties: 3,
      quote:
        "The platform makes property management effortless. I can handle everything from my phone - rent collection, maintenance requests, and tenant communication.",
      rating: 5,
    },
    {
      name: "David Chen",
      location: "Birmingham",
      properties: 12,
      quote:
        "The tenant screening process is thorough and reliable. I haven't had a single payment issue since switching to this platform two years ago.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-accent text-accent-foreground px-4 py-2 text-sm font-medium">
                  Trusted by 10,000+ Landlords
                </Badge>
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Maximize Your Rental Income with
                  <span className="block text-accent">Quality Tenants</span>
                </h1>
                <p className="text-xl text-primary-foreground/90 leading-relaxed max-w-2xl">
                  Join thousands of successful landlords who trust our platform to find reliable tenants, streamline
                  property management, and maximize their rental returns.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/landlord/submit-property">
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 text-lg font-semibold"
                  >
                    List Your Property
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-4 text-lg bg-transparent"
                >
                  Learn More
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-sm text-primary-foreground/70">Occupancy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">£2.8M</div>
                  <div className="text-sm text-primary-foreground/70">Monthly Rent Collected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">4.9★</div>
                  <div className="text-sm text-primary-foreground/70">Landlord Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src="/spacious-family-home.png"
                  alt="Premium rental property"
                  width={600}
                  height={450}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card text-card-foreground p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <span className="font-semibold">Property Listed Successfully</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">3 applications received in 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Why Choose Ace Investment Properties?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We provide everything you need to succeed as a landlord, from finding quality tenants to maximizing your
              returns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-6">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                    <benefit.icon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-card-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                  Everything You Need to Manage Your Properties
                </h2>
                <p className="text-lg text-muted-foreground">
                  Our comprehensive platform provides all the tools and services you need to be a successful landlord.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/landlord/submit-property">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/modern-downtown-loft.png"
                  alt="Property management dashboard"
                  width={600}
                  height={450}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Trusted by Landlords Across the UK
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our successful landlords have to say about their experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <blockquote className="text-card-foreground italic leading-relaxed">"{testimonial.quote}"</blockquote>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-card-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.location} • {testimonial.properties} Properties
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold">
            Ready to Start Earning More from Your Properties?
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of successful landlords who have transformed their rental business with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/landlord/submit-property">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 text-lg font-semibold"
              >
                List Your First Property
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-4 text-lg bg-transparent"
            >
              Schedule a Demo
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/70">
            No setup fees • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
