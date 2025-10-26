"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Search, Shield, Star, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function InvestorLandingPage() {

  const benefits = [
    {
      icon: Search,
      title: "Curated Property Selection",
      description:
        "Access premium R2R properties that match your investment criteria, pre-screened for quality and potential returns.",
    },
    {
      icon: TrendingUp,
      title: "Maximize ROI",
      description:
        "Our analytics and market insights help you identify high-yield opportunities and optimize your investment portfolio.",
    },
    {
      icon: Shield,
      title: "Secure Investments",
      description:
        "Comprehensive due diligence, legal protection, and transparent processes ensure your investments are protected.",
    },
  ]

  const features = [
    "Personalized property matching",
    "Market analysis & insights",
    "Investment performance tracking",
    "Direct landlord connections",
    "Legal document support",
    "Portfolio management tools",
  ]

  const testimonials = [
    {
      name: "Michael Roberts",
      location: "London",
      properties: 15,
      quote:
        "The platform helped me identify undervalued properties that have delivered 18% ROI consistently. The screening process saves me weeks of research.",
      rating: 5,
    },
    {
      name: "Emma Williams",
      location: "Manchester",
      properties: 6,
      quote:
        "As a new investor, the guidance and property insights were invaluable. I've built a profitable portfolio faster than I thought possible.",
      rating: 5,
    },
    {
      name: "Robert Singh",
      location: "Birmingham",
      properties: 23,
      quote:
        "The quality of properties and transparency of information is exceptional. My investment returns have improved by 25% since joining.",
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
                  Trusted by 5,000+ Investors
                </Badge>
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Build Your R2R Property
                  <span className="block text-accent">Investment Portfolio</span>
                </h1>
                <p className="text-xl text-primary-foreground/90 leading-relaxed max-w-2xl">
                  Join successful investors who use our platform to discover high-yield R2R properties, 
                  connect with quality landlords, and build profitable investment portfolios.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/investor/signup">
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 text-lg font-semibold"
                  >
                    Start Investing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-4 text-lg bg-transparent"
                >
                  View Properties
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">18%</div>
                  <div className="text-sm text-primary-foreground/70">Avg. ROI</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">£850K</div>
                  <div className="text-sm text-primary-foreground/70">Avg. Portfolio Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">4.8★</div>
                  <div className="text-sm text-primary-foreground/70">Investor Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src="/spacious-family-home.png"
                  alt="Premium investment property"
                  width={600}
                  height={450}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card text-card-foreground p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <span className="font-semibold">Property Match Found</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">18% projected ROI • Birmingham</p>
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
              We connect you with high-quality R2R properties and provide the insights you need to build a successful investment portfolio.
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
                  Everything You Need to Build Your Portfolio
                </h2>
                <p className="text-lg text-muted-foreground">
                  Our comprehensive platform provides all the tools and insights you need to be a successful property investor.
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

              <Link href="/investor/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Join Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/modern-downtown-loft.png"
                  alt="Investment portfolio dashboard"
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
              Trusted by Investors Across the UK
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our successful investors have to say about their experience.
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
            Ready to Start Building Your Investment Portfolio?
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of successful investors who have built profitable R2R property portfolios with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/investor/signup">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 text-lg font-semibold"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-4 text-lg bg-transparent"
            >
              Browse Properties
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/70">
            No setup fees • Cancel anytime • Free property matching
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}