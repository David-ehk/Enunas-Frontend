import Link from 'next/link'
import { Lock } from 'lucide-react'

export default function CheckoutNavbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-enunas-gray-light py-2"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex items-baseline justify-between">
        <Link
          href="/"
          className="font-cormorant text-2xl leading-none font-light tracking-[0.04em] text-enunas-black hover:opacity-70 transition-opacity duration-300"
        >
          Enunas
        </Link>

        <div className="flex items-center gap-2 text-enunas-gray-medium">
          <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="font-league-spartan text-[11px] leading-none tracking-[0.15em] uppercase">
            Sicher einkaufen
          </span>
        </div>
      </div>
    </nav>
  )
}
