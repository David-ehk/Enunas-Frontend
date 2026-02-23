'use client'

import Link from 'next/link'

export default function CheckoutNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-enunas-gray-light">
      <nav className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" aria-label="Zur Startseite">
          <h1 className="text-3xl tracking-wide text-enunas-black">Enunas</h1>
        </Link>

        {/* Secure badge */}
        <div className="flex items-center gap-2 text-enunas-gray-medium">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 12L11 14L15 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-league-spartan text-[11px] uppercase tracking-[0.15em]">
            Sichere Zahlung
          </span>
        </div>
      </nav>
    </header>
  )
}
