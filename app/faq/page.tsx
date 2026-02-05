import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link"

export default function FAQPage() {
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I create an account?",
          answer:
            "You can create an account by clicking the 'Sign Up' button in the top right corner of our website. Choose whether you're a landlord or investor, fill in your details, and verify your email address to get started.",
        },
        {
          question: "Is there a fee to join?",
          answer:
            "Creating an account is completely free for both landlords and investors. Landlords only pay a small commission when a property is successfully rented, and there are no fees for investors to search and apply for properties.",
        },
        {
          question: "What documents do I need to list a property?",
          answer:
            "To list a property, you'll need proof of ownership or authorization to let the property, an Energy Performance Certificate (EPC), Gas Safety Certificate (if applicable), and Electrical Installation Condition Report. You can upload these documents directly through your dashboard.",
        },
      ],
    },
    {
      category: "For Landlords",
      questions: [
        {
          question: "How long does it take to list my property?",
          answer:
            "Once you submit your property listing with all required documents, our team typically reviews and approves it within 24-48 hours. You can start receiving applications as soon as your listing goes live.",
        },
        {
          question: "How do you screen tenants?",
          answer:
            "We conduct comprehensive tenant screening including credit checks, employment verification, previous landlord references, and identity verification. All applicants must meet our minimum criteria before they can submit an application.",
        },
        {
          question: "When do I receive rental payments?",
          answer:
            "Rental payments are collected automatically on the agreed date each month and transferred to your designated bank account within 1-3 business days. You can track all payments through your dashboard.",
        },
        {
          question: "Can I manage multiple properties?",
          answer:
            "Yes, our platform is designed to handle multiple properties efficiently. You can manage all your properties from a single dashboard, track applications, view financial reports, and handle maintenance requests for each property.",
        },
      ],
    },
    {
      category: "For Investors",
      questions: [
        {
          question: "How do I search for properties?",
          answer:
            "You can search for properties using our advanced search filters including location, price range, property type, number of bedrooms, and amenities. Save your preferences to receive notifications when new matching properties become available.",
        },
        {
          question: "What is the application process?",
          answer:
            "Once you find a property you're interested in, click 'Apply Now' and complete the application form. You'll need to provide employment details, references, and proof of income. The landlord will review your application and schedule a viewing if interested.",
        },
        {
          question: "How do viewings work?",
          answer:
            "After your application is reviewed, the landlord can approve a viewing. You'll receive a notification to schedule a convenient time. Viewings can be in-person or virtual, depending on the property and your preference.",
        },
        {
          question: "What happens after my application is approved?",
          answer:
            "Once approved, you'll receive a tenancy agreement to review and sign digitally. You'll then need to pay the deposit and first month's rent. After these steps are completed, you'll receive your move-in details and keys.",
        },
      ],
    },
    {
      category: "Payments & Billing",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major debit and credit cards, as well as direct bank transfers. All payments are processed securely through our encrypted payment system.",
        },
        {
          question: "Is my payment information secure?",
          answer:
            "Yes, we use bank-level encryption and comply with PCI DSS standards to ensure all payment information is completely secure. We never store your full card details on our servers.",
        },
        {
          question: "What is your refund policy?",
          answer:
            "Deposits are held securely and returned within 10 business days after the tenancy ends, minus any agreed deductions for damages or unpaid rent. Monthly rent payments are non-refundable once paid.",
        },
      ],
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "I forgot my password. How do I reset it?",
          answer:
            "Click on 'Forgot Password' on the login page and enter your email address. You'll receive a password reset link within a few minutes. If you don't see the email, check your spam folder.",
        },
        {
          question: "Why can't I upload my documents?",
          answer:
            "Ensure your documents are in PDF, JPG, or PNG format and under 10MB in size. If you're still having issues, try using a different browser or contact our support team for assistance.",
        },
        {
          question: "How do I delete my account?",
          answer:
            "To delete your account, go to Settings > Account > Delete Account. Please note that this action is permanent and all your data will be removed. If you have active listings or tenancies, you'll need to resolve those first.",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl ">
              Frequently Asked Questions
            </h1>
            <p className="text-base text-primary-foreground/90 leading-relaxed">
              Find answers to common questions about our platform and services
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {faqs.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h2 className="font-serif text-xl md:text-2xl text-foreground mb-6">
                  {section.category}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {section.questions.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`item-${sectionIndex}-${faqIndex}`}>
                      <AccordionTrigger className="text-left text-base text-foreground">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
