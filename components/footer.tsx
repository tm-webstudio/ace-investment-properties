import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div>
              <span className="font-serif font-bold text-lg">Ace Investment Properties</span>
            </div>
            <p className="text-primary-foreground/80">
              Your trusted partner in finding the perfect rental property or managing your investment portfolio.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/properties" className="block hover:text-accent transition-colors">
                Browse Properties
              </Link>
              <Link href="/landlord" className="block hover:text-accent transition-colors">
                List Your Property
              </Link>
              <Link href="/landlord/dashboard" className="block hover:text-accent transition-colors">
                Landlord Dashboard
              </Link>
              <Link href="/about" className="block hover:text-accent transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="block hover:text-accent transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Support</h3>
            <div className="space-y-2">
              <Link href="/help" className="block hover:text-accent transition-colors">
                Help Center
              </Link>
              <Link href="/terms" className="block hover:text-accent transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="block hover:text-accent transition-colors">
                Privacy Policy
              </Link>
              <Link href="/faq" className="block hover:text-accent transition-colors">
                FAQ
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Us</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="text-primary-foreground/80">+44 7831 542818</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="text-primary-foreground/80">abdul@aceinvestmentproperties.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="text-primary-foreground/80">24 Bridge House Quay, Canary Wharf, United Kingdom, E14 9QW</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/60">© 2025 Ace Investment Properties. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
