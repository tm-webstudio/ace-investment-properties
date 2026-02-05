import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl ">
              Privacy Policy
            </h1>
            <p className="text-base text-primary-foreground/90 leading-relaxed">
              Last updated: January 2026
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8 md:p-12 prose prose-slate max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    1. Introduction
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    At Ace Investment Properties, we are committed to protecting your privacy and ensuring the security
                    of your personal information. This Privacy Policy explains how we collect, use, disclose, and
                    safeguard your information when you use our Platform. Please read this policy carefully to
                    understand our practices regarding your personal data.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    2. Information We Collect
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We collect several types of information from and about users of our Platform:
                  </p>

                  <h3 className="font-semibold text-lg text-foreground mt-4 mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Name, email address, phone number, and postal address</li>
                    <li>Date of birth and government-issued identification</li>
                    <li>Employment information and income details</li>
                    <li>Banking and payment information</li>
                    <li>Property ownership documentation (for landlords)</li>
                  </ul>

                  <h3 className="font-semibold text-lg text-foreground mt-4 mb-2">Usage Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>IP address, browser type, and device information</li>
                    <li>Pages visited and time spent on the Platform</li>
                    <li>Search queries and property preferences</li>
                    <li>Communication records with other users and support team</li>
                  </ul>

                  <h3 className="font-semibold text-lg text-foreground mt-4 mb-2">Verification Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Credit reports and background check results</li>
                    <li>References from previous landlords or employers</li>
                    <li>Property certificates and legal documents</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    3. How We Use Your Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We use the collected information for the following purposes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>To provide and maintain our Platform services</li>
                    <li>To process transactions and send related information</li>
                    <li>To verify user identities and conduct background checks</li>
                    <li>To match landlords with suitable tenants</li>
                    <li>To communicate with you about your account and services</li>
                    <li>To send marketing communications (with your consent)</li>
                    <li>To improve our Platform and develop new features</li>
                    <li>To detect, prevent, and address technical issues and fraud</li>
                    <li>To comply with legal obligations and enforce our terms</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    4. Information Sharing and Disclosure
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We may share your information in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>With landlords when you submit a property application</li>
                    <li>With prospective tenants when they inquire about your property</li>
                    <li>With third-party service providers who assist our operations</li>
                    <li>With credit reference agencies and background check services</li>
                    <li>With law enforcement or regulators when legally required</li>
                    <li>In connection with a business transaction, merger, or acquisition</li>
                    <li>With your consent or at your direction</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    We do not sell your personal information to third parties for their marketing purposes.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    5. Data Security
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement appropriate technical and organizational measures to protect your personal information
                    against unauthorized access, alteration, disclosure, or destruction. These measures include
                    encryption of data in transit and at rest, regular security assessments, access controls, and
                    employee training. However, no method of transmission over the internet or electronic storage is
                    100% secure, and we cannot guarantee absolute security.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    6. Data Retention
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We retain your personal information for as long as necessary to fulfill the purposes outlined in
                    this Privacy Policy, unless a longer retention period is required or permitted by law. When we no
                    longer need your information, we will securely delete or anonymize it. For financial and legal
                    compliance, some data may be retained for up to 7 years.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    7. Your Rights and Choices
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Under UK data protection laws, you have the following rights:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Right to access your personal data</li>
                    <li>Right to correct inaccurate or incomplete data</li>
                    <li>Right to delete your data (subject to legal obligations)</li>
                    <li>Right to restrict or object to data processing</li>
                    <li>Right to data portability</li>
                    <li>Right to withdraw consent where processing is based on consent</li>
                    <li>Right to lodge a complaint with the Information Commissioner's Office (ICO)</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    To exercise these rights, please contact us using the details provided at the end of this policy.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    8. Cookies and Tracking Technologies
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use cookies and similar tracking technologies to collect information about your browsing
                    activities. Cookies help us improve user experience, analyze Platform performance, and provide
                    personalized content. You can control cookie preferences through your browser settings, but
                    disabling cookies may limit certain Platform features.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    9. Third-Party Links
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our Platform may contain links to third-party websites or services that are not operated by us. We
                    are not responsible for the privacy practices of these third parties. We encourage you to review
                    the privacy policies of any third-party sites you visit.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    10. Children's Privacy
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our Platform is not intended for individuals under the age of 18. We do not knowingly collect
                    personal information from children. If you are a parent or guardian and believe your child has
                    provided us with personal information, please contact us, and we will take steps to delete such
                    information.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    11. International Data Transfers
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your information may be transferred to and processed in countries other than the UK. When we
                    transfer data internationally, we ensure appropriate safeguards are in place to protect your
                    information in accordance with UK data protection standards.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    12. Changes to This Privacy Policy
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update this Privacy Policy from time to time to reflect changes in our practices or legal
                    requirements. We will notify you of any material changes by posting the new policy on this page and
                    updating the "Last updated" date. We encourage you to review this policy periodically.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl  text-foreground mb-4">
                    13. Contact Us
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data
                    practices, please contact us at:
                  </p>
                  <div className="mt-4 text-muted-foreground">
                    <p className="font-semibold text-foreground mb-2">Data Protection Officer</p>
                    <p>Ace Investment Properties</p>
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
