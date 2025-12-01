import Link from "next/link"

export function DashboardFooter() {
  return (
    <footer className="bg-gradient-to-r from-primary/[0.015] via-primary/[0.03] to-primary/[0.015] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-foreground/60">
            © 2026 Ace Investment Properties. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/help"
              className="text-foreground/70 hover:text-accent transition-colors"
            >
              Help Center
            </Link>
            <Link
              href="/privacy"
              className="text-foreground/70 hover:text-accent transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-foreground/70 hover:text-accent transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
