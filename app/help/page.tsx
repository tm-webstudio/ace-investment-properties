import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, BookOpen, Users, Home, CreditCard, FileText, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  const categories = [
    {
      icon: Home,
      title: "Property Listings",
      description: "Learn how to list and manage your properties effectively",
      articles: [
        "How to create a property listing",
        "Adding photos and descriptions",
        "Managing property availability",
        "Updating property details",
      ],
    },
    {
      icon: Users,
      title: "Account Management",
      description: "Manage your account settings and profile information",
      articles: [
        "Creating an account",
        "Updating your profile",
        "Password and security",
        "Email preferences",
      ],
    },
    {
      icon: CreditCard,
      title: "Payments & Billing",
      description: "Understand our payment processes and billing",
      articles: [
        "Payment methods",
        "Rent collection",
        "Invoice management",
        "Refund policies",
      ],
    },
    {
      icon: FileText,
      title: "Documents & Contracts",
      description: "Access templates and legal documentation",
      articles: [
        "Tenancy agreements",
        "Property certificates",
        "Document requirements",
        "Renewal processes",
      ],
    },
    {
      icon: Users,
      title: "Tenant Screening",
      description: "Learn about our verification and screening process",
      articles: [
        "Verification process",
        "Background checks",
        "Reference requirements",
        "Approval criteria",
      ],
    },
    {
      icon: MessageCircle,
      title: "Communication",
      description: "Stay connected with tenants and support team",
      articles: [
        "Messaging system",
        "Viewing requests",
        "Maintenance reports",
        "Support channels",
      ],
    },
  ]

  const popularArticles = [
    "How do I list my first property?",
    "What documents do I need to provide?",
    "How does the tenant screening process work?",
    "How do I receive rental payments?",
    "What happens if a tenant misses a payment?",
    "How can I update my property listing?",
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl ">
              How can we help you?
            </h1>
            <p className="text-base text-primary-foreground/90">
              Search our help center for answers to your questions
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for help articles..."
                className="pl-12 py-6 text-lg bg-background text-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-serif text-2xl md:text-3xl  text-foreground">
              Browse by Category
            </h2>
            <p className="text-lg text-muted-foreground">
              Find answers organized by topic
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <category.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-card-foreground mb-2">
                      {category.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                  </div>
                  <ul className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <Link
                          href="#"
                          className="text-sm text-foreground hover:text-accent transition-colors flex items-center"
                        >
                          <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                          {article}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-serif text-2xl md:text-3xl  text-foreground">
              Popular Articles
            </h2>
            <p className="text-lg text-muted-foreground">
              Quick answers to frequently asked questions
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              <ul className="space-y-4">
                {popularArticles.map((article, index) => (
                  <li key={index}>
                    <Link
                      href="#"
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/5 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-5 w-5 text-accent" />
                        <span className="text-foreground group-hover:text-accent transition-colors">
                          {article}
                        </span>
                      </div>
                      <span className="text-muted-foreground group-hover:text-accent transition-colors">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
