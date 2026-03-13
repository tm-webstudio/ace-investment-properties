import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  CheckCircle,
  ArrowRight,
  ClipboardList,
  Users,
  PoundSterling,
  ShieldCheck,
  Eye,
  Wallet,
  Phone,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const steps = [
  {
    icon: ClipboardList,
    title: "Submit your property",
    description:
      "Tell us about your property — location, size, condition. It takes about five minutes.",
  },
  {
    icon: Users,
    title: "We find the right tenant",
    description:
      "We match your property to vetted tenants, arrange viewings, and handle referencing.",
  },
  {
    icon: PoundSterling,
    title: "Start earning",
    description:
      "Your tenant moves in and rent starts flowing. We handle the paperwork.",
  },
  {
    icon: ShieldCheck,
    title: "Ongoing support",
    description:
      "We manage maintenance, inspections, and tenant queries so you don't have to.",
  },
]

const valueProps = [
  {
    icon: ShieldCheck,
    title: "Peace of mind",
    description:
      "Every tenant is thoroughly referenced and screened before they move in.",
  },
  {
    icon: Eye,
    title: "Routine property visits",
    description:
      "Regular inspections keep your property in great condition and tenants accountable.",
  },
  {
    icon: Wallet,
    title: "Money protected",
    description:
      "Client funds are held in fully compliant, ring-fenced accounts.",
  },
  {
    icon: Phone,
    title: "Count on us",
    description:
      "A dedicated contact who knows your property and is available when you need them.",
  },
]

const services = [
  {
    title: "Tenant Find",
    description:
      "We find a quality tenant for your property, then hand management back to you.",
    features: [
      "Professional property listing",
      "Tenant matching & viewings",
      "Full referencing & right-to-rent checks",
      "Tenancy agreement preparation",
    ],
    highlighted: false,
  },
  {
    title: "Rent Collection",
    description:
      "Everything in Tenant Find, plus we collect rent and chase arrears on your behalf.",
    features: [
      "Everything in Tenant Find",
      "Monthly rent collection",
      "Arrears management",
      "Deposit registration",
    ],
    highlighted: false,
  },
  {
    title: "Fully Managed",
    description:
      "A complete, hands-off service. We take care of your property as if it were our own.",
    features: [
      "Everything in Rent Collection",
      "Routine property inspections",
      "Maintenance coordination",
      "24/7 emergency contact for tenants",
      "End-of-tenancy management",
    ],
    highlighted: true,
  },
]

const faqs = [
  {
    question: "What does a managing agent actually do?",
    answer:
      "A managing agent handles the day-to-day running of your rental property. Depending on your service level, that can range from finding a tenant through to full property management — collecting rent, arranging maintenance, conducting inspections, and dealing with any issues so you don't have to.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Our fees depend on the level of service you choose. Tenant Find is a one-off fee, while Rent Collection and Fully Managed are a percentage of the monthly rent. We're always transparent about costs — get in touch for a personalised quote with no obligation.",
  },
  {
    question: "Do I have to pay tax on rental income?",
    answer:
      "Yes, rental income is taxable. You'll need to declare it on your Self Assessment tax return. You can deduct allowable expenses such as letting agent fees, maintenance costs, and insurance. We recommend speaking to an accountant for advice specific to your situation.",
  },
  {
    question: "How do you find and vet tenants?",
    answer:
      "We advertise your property across major portals, conduct accompanied viewings, and carry out comprehensive referencing on prospective tenants — including credit checks, employment verification, previous landlord references, and right-to-rent checks.",
  },
  {
    question: "What happens if a tenant stops paying rent?",
    answer:
      "We act quickly. Our process includes formal arrears letters, direct contact with the tenant, and if necessary, guidance through the legal process. For Fully Managed landlords, we handle the entire process on your behalf.",
  },
  {
    question: "Can I upgrade my service level later?",
    answer:
      "Absolutely. Many landlords start with Tenant Find and move to Fully Managed once they see the value. You can upgrade at any point during the tenancy — just get in touch and we'll arrange the switch.",
  },
]

export default function LandlordLandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="bg-background py-12 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-32 items-center">
            <div className="space-y-2 flex flex-col justify-center text-center lg:text-center items-center">
              <div>
                <p className="text-sm font-semibold text-accent uppercase tracking-wide">For Landlords</p>
                <h1 className="font-serif text-4xl md:text-5xl lg:text-5xl font-medium text-foreground leading-tight mb-2">
                  Let your property with confidence
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Whether you&apos;re a first-time landlord or manage a portfolio,
                we make letting simple and stress-free.
              </p>
              </div>
              <div className="pt-2 space-y-3">
                <Link href="/landlord/submit-property">
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all rounded-none py-6"
                  >
                    List Your Property
                  </Button>
                </Link>
              </div>
              <div className="flex gap-8 pt-4">
                <div className="text-center">
                  <p className="text-xl font-semibold text-foreground">500+</p>
                  <p className="text-xs text-muted-foreground">Properties Let</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-foreground">98%</p>
                  <p className="text-xs text-muted-foreground">Occupancy Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-foreground">4.8★</p>
                  <p className="text-xs text-muted-foreground">Landlord Rating</p>
                </div>
              </div>
            </div>
            <div className="relative mx-auto">
              <div className="aspect-square overflow-hidden">
                <Image
                  src="/spacious-family-home.png"
                  alt="A well-maintained rental property"
                  width={700}
                  height={525}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-background pt-10 pb-20 lg:pt-14 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground text-center mb-16">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-8 text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-background py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
                Trusted local insight, national reach
              </h2>
              <div className="space-y-6">
                {valueProps.map((prop, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <prop.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {prop.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {prop.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/spacious-family-home.png"
                  alt="A well-maintained rental property"
                  width={600}
                  height={450}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="bg-muted/30 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
              Our services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the level of support that suits you — from a simple tenant
              find to a fully managed service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className={`p-6 flex flex-col ${
                  service.highlighted
                    ? "border-accent border-2 relative"
                    : ""
                }`}
              >
                {service.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-3 py-1">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <h3 className="font-serif text-xl font-semibold text-card-foreground">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-2 flex-1">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/landlord/submit-property"
                    className="inline-flex items-center text-sm font-medium text-accent hover:underline mt-4"
                  >
                    Get started
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-background py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground text-center mb-12">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-primary-foreground">
            Ready to let your property?
          </h2>
          <Link href="/landlord/submit-property">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 text-lg font-semibold mt-4"
            >
              List Your Property
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-primary-foreground/70">
            No upfront fees. No obligation.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
