import Link from "next/link"

export function MinimalHeader() {
  return (
    <nav className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:max-w-8xl">
        <div className="flex justify-center items-center h-16">
          {/* Logo - centered */}
          <Link href="/" className="flex items-center">
            <span className="font-sans font-black text-lg md:text-xl tracking-wide uppercase">
              ACE INVESTMENT PROPERTIES
            </span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
