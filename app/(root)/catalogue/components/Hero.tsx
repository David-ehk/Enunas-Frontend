import React from 'react'
import Link from 'next/link'

const CatalogueHero = () => {
  return (
    <div className="w-full pt-20">
      {/* Hero image */}
      <div className="w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <img
          src="https://i.imgur.com/VNHRUgU.jpeg"
          alt="Catalogue"
          className="w-full h-full object-cover"
          style={{ aspectRatio: '4/3' }}
        />
      </div>

      {/* Title + label row */}
      <div className="px-5 sm:px-8 lg:px-12 py-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-enunas-gray-light">
        <h1
          className="font-cormorant font-light text-enunas-black"
          style={{ fontSize: 'clamp(48px, 12vw, 96px)', lineHeight: 1, letterSpacing: '-0.01em' }}
        >
          Catalogue
        </h1>
        <div className="sm:text-right">
          <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-1">
            Finde deine Kategorie
          </p>
          <p className="font-league-spartan text-sm font-semibold tracking-[0.05em] text-enunas-black mb-2">
            5 Kategorien. Eine ist für dich.
          </p>
          <Link
            href="/bekleidung"
            className="font-cormorant italic text-base text-enunas-purple hover:opacity-70 transition-opacity duration-200"
          >
            Alle Kleidung entdecken →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CatalogueHero
