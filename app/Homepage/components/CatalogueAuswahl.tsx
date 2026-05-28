'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function KategorieAuswahl() {
  const [activeKategorie, setActiveKategorie] = useState('kategorie1')
  const [isImageLoading, setIsImageLoading] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const kategorie = [
    {
      id: 'kategorie1',
      name: 'Streetwear',
      image: "/assets/images/Test1.WebP",
      color: 'bg-[#0011A5]',
      colorHex: '#0011A5',
      link: "/bekleidung/streetwear"
    },
    {
      id: 'kategorie2',
      name: 'Experimental',
      image: "https://cdn.rickowens.eu/products/205600/large/RL02E1719_CTW_09_01.jpg?1757411991",
      color: 'bg-[#6C169C]',
      colorHex: '#6C169C',
      link: "/bekleidung/experimental"
    },
    {
      id: 'kategorie3',
      name: 'Athleisure',
      image: '/assets/images/Test3.WebP',
      color: 'bg-[#C01B1B]',
      colorHex: '#C01B1B',
      link: "/bekleidung/athleisure"
    },
    {
      id: 'kategorie4',
      name: 'Culture',
      image: '/assets/images/Test4.WebP',
      color: 'bg-[#EA9575]',
      colorHex: '#EA9575',
      link: "/bekleidung/cultural"
    },
    {
      id: 'kategorie5',
      name: 'Star',
      image: '/assets/images/Test1.WebP',
      color: 'bg-black',
      colorHex: '#000000',
      link: "/bekleidung/star"
    }
  ]

  const currentKategorie = kategorie.find(a => a.id === activeKategorie)
  const currentImage = currentKategorie?.image

  const handleCategoryChange = (id: string) => {
    if (id !== activeKategorie) {
      setIsImageLoading(true)
      setActiveKategorie(id)
    }
  }

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(`[data-category="${activeKategorie}"]`)
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
    }
  }, [activeKategorie])

  return (
    <section className="w-full">
      {/* ═══════════════════════════════════════════════════════════
          MOBILE VERSION - Moncler-inspired hero + thumbnail strip
          Only visible below sm breakpoint
          ═══════════════════════════════════════════════════════════ */}
      <div className="block sm:hidden" style={{ background: '#FFFFFF' }}>
        {/* Section label */}
        <div className="px-6 pt-8 pb-4">
          <p className="font-league-spartan text-[9px] tracking-[0.35em] uppercase" style={{ color: '#9B9B9B' }}>
            Catalogue
          </p>
        </div>

        {/* Hero Image — full-bleed, no side padding */}
        <div className="relative w-full aspect-[3/4] overflow-hidden">
          <img
            src={currentImage}
            alt={currentKategorie?.name}
            className={`
              w-full h-full object-cover
              transition-all duration-700 ease-out-expo
              ${isImageLoading ? 'opacity-0 scale-[1.04]' : 'opacity-100 scale-100'}
            `}
            onLoad={() => setIsImageLoading(false)}
          />
        </div>

        {/* Category name + color accent + CTA */}
        <div className="px-6 pt-6 pb-5">
          {/* Category name — centered */}
          <h2
            className="font-cormorant flex justify-center font-light leading-[0.95] tracking-wide transition-all duration-500 ease-out-expo"
            style={{ fontSize: 'clamp(2.75rem, 9vw, 3.5rem)', color: '#0A0A0A' }}
          >
            {currentKategorie?.name}
          </h2>

          {/* Accent line — full width of the text block, no overflow */}
          <div
            className="h-[1.5px] mt-3 transition-all duration-500 ease-out-expo"
            style={{ width: '100%', backgroundColor: currentKategorie?.colorHex }}
          />
        </div>

        {/* Thumbnail strip — swipe/scroll, snap, no arrows */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2.5 px-6 pb-6 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {kategorie.map((kat) => (
            <button
              key={kat.id}
              data-category={kat.id}
              onClick={() => handleCategoryChange(kat.id)}
              className="relative flex-shrink-0 snap-start text-left focus:outline-none"
              style={{ width: '28vw' }}
            >
              {/* Thumbnail image */}
              <div
                className={`
                  relative overflow-hidden aspect-[2/3] transition-all duration-500 ease-out-expo
                  ${activeKategorie === kat.id ? 'opacity-100' : 'opacity-35 hover:opacity-60'}
                `}
              >
                <img
                  src={kat.image}
                  alt={kat.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Category color accent — appears only on active thumbnail */}
              <div
                className="transition-all duration-500 ease-out-expo"
                style={{
                  height: '1.5px',
                  marginTop: '6px',
                  backgroundColor: kat.colorHex,
                  width: activeKategorie === kat.id ? '100%' : '0%',
                }}
              />

              {/* Thumbnail label — fixed margin to prevent layout jitter on selection */}
              <p
                className={`
                  font-league-spartan text-[10px] tracking-[0.18em] uppercase text-center mt-[6px]
                  transition-opacity duration-300
                  ${activeKategorie === kat.id ? 'opacity-100 text-enunas-black' : 'opacity-40 text-enunas-gray-medium'}
                `}
              >
                {kat.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP VERSION - Original layout (hidden on mobile)
          ═══════════════════════════════════════════════════════════ */}
      <div className="hidden sm:block px-8 sm:px-16 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-12 items-center">

            {/* Left Side - List */}
            <div className="space-y-6">
              <p className="font-league-spartan text-sm tracking-[0.2em] uppercase text-enunas-gray-medium">
                Catalogue
              </p>

              <ul className="space-y-4">
                {kategorie.map((Kategorie) => (
                  <li key={Kategorie.id}>
                    <button
                      onMouseEnter={() => handleCategoryChange(Kategorie.id)}
                      onClick={() => handleCategoryChange(Kategorie.id)}
                      className={`
                        relative group text-left font-cormorant
                        text-4xl sm:text-5xl lg:text-6xl
                        font-light leading-tight
                        transition-all duration-300
                        ${activeKategorie === Kategorie.id
                          ? 'opacity-100'
                          : 'opacity-50 hover:opacity-70'
                        }
                      `}
                    >
                      {Kategorie.name}
                      <span
                        className={`
                          absolute bottom-0 left-0 h-1
                          ${Kategorie.color}
                          transition-all duration-500 ease-out
                          ${activeKategorie === Kategorie.id ? 'w-full' : 'w-0 group-hover:w-full'}
                        `}
                      />
                    </button>
                  </li>
                ))}
              </ul>

              {/* Explore Link */}
              <Link
                href={currentKategorie?.link || '#'}
                className="
                  inline-block mt-8
                  px-8 py-3
                  bg-enunas-purple text-white
                  font-league-spartan text-sm tracking-[0.15em] uppercase
                  transition-all duration-300 ease-out
                  hover:bg-enunas-purple-light
                "
              >
                {currentKategorie?.name} entdecken
              </Link>
            </div>

            {/* Right Side - Image */}
            <div className="relative h-[700px] overflow-hidden">
              <img
                src={currentImage}
                alt={currentKategorie?.name}
                className={`
                  w-full h-full object-cover
                  transition-all duration-700 ease-out
                  ${isImageLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}
                `}
                onLoad={() => setIsImageLoading(false)}
              />

              {/* Subtle Overlay Effect */}
              <div
                className="absolute inset-0 opacity-10 mix-blend-overlay transition-colors duration-500"
                style={{ backgroundColor: currentKategorie?.colorHex }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hide scrollbar globally for this component */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
