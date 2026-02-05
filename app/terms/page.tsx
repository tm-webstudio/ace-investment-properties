import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl ">
              Terms of Service
            </h1>
            <p className="text-base text-primary-foreground/90 leading-relaxed">
              Last updated: January 2026
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8 md:p-12 prose prose-slate max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing and using Ace Investment Properties ("the Platform"), you accept and agree to be bound
                    by the terms and provisions of this agreement. If you do not agree to these terms, please do not
                    use our services.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    2. Use of Service
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Our Platform provides a marketplace connecting landlords with potential tenants. You agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Provide accurate and complete information when creating your account</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Not use the service for any illegal or unauthorized purpose</li>
                    <li>Comply with all applicable laws and regulations</li>
                    <li>Not interfere with or disrupt the service or servers</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    3. Account Registration
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To access certain features of the Platform, you must register for an account. You are responsible
                    for maintaining the confidentiality of your account information and for all activities that occur
                    under your account. You must immediately notify us of any unauthorized use of your account.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    4. Property Listings
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    For landlords listing properties:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>You must have legal authority to list and rent the property</li>
                    <li>All information provided must be accurate and up-to-date</li>
                    <li>You must comply with all relevant housing and safety regulations</li>
                    <li>You are responsible for maintaining all required certificates and documentation</li>
                    <li>We reserve the right to remove listings that violate our policies</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    5. Tenant Applications
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    For investors applying to rent properties:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>All information provided in applications must be truthful and accurate</li>
                    <li>You consent to background and credit checks as part of the application process</li>
                    <li>You understand that application approval is at the landlord's discretion</li>
                    <li>Submitting an application does not guarantee approval or tenancy</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    6. Payments and Fees
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    All payments processed through the Platform are subject to the following:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Landlords pay a commission fee upon successful rental agreements</li>
                    <li>Tenants are responsible for deposit and rent payments as agreed</li>
                    <li>All fees are non-refundable unless otherwise stated</li>
                    <li>Late payment fees may apply as specified in tenancy agreements</li>
                    <li>We reserve the right to modify our fee structure with 30 days notice</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    7. Intellectual Property
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All content on the Platform, including text, graphics, logos, images, and software, is the property
                    of Ace Investment Properties or its content suppliers and is protected by copyright and
                    intellectual property laws. You may not reproduce, distribute, or create derivative works without
                    our express written permission.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    8. Limitation of Liability
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Ace Investment Properties acts as a platform connecting landlords and tenants. We are not party to
                    any rental agreements and are not responsible for the actions of users. We provide the Platform "as
                    is" and make no warranties regarding its availability, accuracy, or fitness for a particular
                    purpose. To the maximum extent permitted by law, we shall not be liable for any indirect,
                    incidental, or consequential damages arising from your use of the service.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    9. Dispute Resolution
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Any disputes arising from use of the Platform shall first be attempted to be resolved through good
                    faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration in
                    accordance with UK law. The arbitration shall take place in London, United Kingdom.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    10. Termination
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to terminate or suspend your account and access to the Platform at our sole
                    discretion, without notice, for conduct that we believe violates these Terms of Service or is
                    harmful to other users, us, or third parties, or for any other reason.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    11. Changes to Terms
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify these terms at any time. We will notify users of any material
                    changes via email or through the Platform. Your continued use of the service after such
                    modifications constitutes your acceptance of the updated terms.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    12. Contact Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="mt-4 text-muted-foreground">
                    <p>Email: q@aceinvestmentproperties.com</p>
                    <p>Phone: +44 7480 485 707</p>
                    <p>Address: 24 Bridge House Quay, Canary Wharf, London, E14 9QW, United Kingdom</p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
