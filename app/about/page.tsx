import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, Award, TrendingUp } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  const values = [
    {
      icon: Users,
      title: "Client-Focused",
      description:
        "We put our clients first, ensuring that both landlords and investors receive exceptional service and support.",
    },
    {
      icon: Target,
      title: "Transparent",
      description:
        "We believe in honest, clear communication and transparent processes in all our dealings.",
    },
    {
      icon: Award,
      title: "Quality Assured",
      description:
        "We maintain the highest standards in property listings, tenant screening, and service delivery.",
    },
    {
      icon: TrendingUp,
      title: "Results-Driven",
      description:
        "We're committed to delivering measurable results and maximizing value for all our stakeholders.",
    },
  ]

  const stats = [
    { value: "10,000+", label: "Properties Listed" },
    { value: "98%", label: "Occupancy Rate" },
    { value: "£2.8M", label: "Monthly Rent Collected" },
    { value: "4.9★", label: "Client Rating" },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl ">
              About Ace Investment Properties
            </h1>
            <p className="text-base text-primary-foreground/90 leading-relaxed">
              Your trusted partner in connecting quality landlords with discerning investors across the UK.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-serif text-2xl md:text-3xl  text-foreground">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded with a vision to revolutionize the rental property market, Ace Investment Properties has grown
                  to become one of the UK's most trusted platforms for property listings and management.
                </p>
                <p>
                  We understand that finding the right property or the right tenant can be challenging. That's why we've
                  built a platform that simplifies the process, providing comprehensive tools and support for both
                  landlords and investors.
                </p>
                <p>
                  Our team of experienced professionals is dedicated to ensuring that every transaction is smooth,
                  secure, and beneficial for all parties involved. We leverage cutting-edge technology combined with
                  personalized service to deliver exceptional results.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/modern-downtown-loft.png"
                  alt="Ace Investment Properties office"
                  width={600}
                  height={450}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl  text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-serif text-2xl md:text-3xl  text-foreground">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                    <value.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-card-foreground">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-serif text-2xl md:text-3xl ">
            Our Mission
          </h2>
          <p className="text-lg text-primary-foreground/90 leading-relaxed">
            To create a seamless, transparent, and secure marketplace that empowers landlords to maximize their rental
            income while helping investors find their perfect property. We're committed to building lasting
            relationships based on trust, integrity, and exceptional service.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
