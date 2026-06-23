'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function KategorieAuswahl() {
  // Desktop state
  const [activeKategorie, setActiveKategorie] = useState('kategorie1')
  const [isImageLoading, setIsImageLoading] = useState(false)

  // Mobile carousel state
  const [idx, setIdx] = useState(1)       // default: Experimental
  const [sliding, setSliding] = useState(false)

  const kategorie = [
    { id: 'kategorie1', name: 'Streetwear',   image: '/assets/images/Test1.WebP',  color: 'bg-[#0011A5]', colorHex: '#0011A5', link: '/bekleidung/streetwear'   },
    { id: 'kategorie2', name: 'Experimental', image: 'https://cdn.rickowens.eu/products/205600/large/RL02E1719_CTW_09_01.jpg?1757411991', color: 'bg-[#6C169C]', colorHex: '#6C169C', link: '/bekleidung/experimental' },
    { id: 'kategorie3', name: 'Athleisure',   image: '/assets/images/Test3.WebP',  color: 'bg-[#C01B1B]', colorHex: '#C01B1B', link: '/bekleidung/athleisure'  },
    { id: 'kategorie4', name: 'Culture',      image: '/assets/images/Test4.WebP',  color: 'bg-[#EA9575]', colorHex: '#EA9575', link: '/bekleidung/cultural'    },
    { id: 'kategorie5', name: 'Star',         image: '/assets/images/Test1.WebP',  color: 'bg-black',     colorHex: '#000000', link: '/bekleidung/star'        },
  ]

  const currentKategorie = kategorie.find(a => a.id === activeKategorie)

  function handleCategoryChange(id: string) {
    if (id !== activeKategorie) {
      setIsImageLoading(true)
      setActiveKategorie(id)
    }
  }

  function goTo(next: number) {
    if (next < 0 || next >= kategorie.length || sliding) return
    setSliding(true)
    setIdx(next)
    setTimeout(() => setSliding(false), 420)
  }

  const current = kategorie[idx]
  const thumbSlots = [idx - 1, idx, idx + 1]

  const ArrowLeft = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  )
  const ArrowRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
  const ArrowRightSm = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )

  return (
    <section className="w-full">

      {/* ═══════════════════════════════════════════════════════════
          MOBILE — Moncler-inspired carousel
          ═══════════════════════════════════════════════════════════ */}
      <div className="block sm:hidden" style={{ background: '#FFFFFF' }}>

        {/* Top bar */}
        <div style={{ padding: '12px 20px 10px', borderBottom: '1px solid #ECECEA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'League Spartan', sans-serif", fontSize: '9px', letterSpacing: '0.26em', textTransform: 'uppercase', color: '#9B9B9B' }}>
            Catalogue
          </span>
          <Link
            href="/catalogue"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'League Spartan', sans-serif", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#0A0A0A', textDecoration: 'none' }}
          >
            Alle ansehen <ArrowRightSm />
          </Link>
        </div>

        {/* Hero Image — crossfade stack */}
        <Link href={current.link} style={{ position: 'relative', width: '100%', height: '300px', display: 'block', overflow: 'hidden', background: '#F8F7F5' }}>
          {kategorie.map((kat, i) => (
            <img
              key={kat.id}
              src={kat.image}
              alt={kat.name}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 18%',
                opacity: i === idx ? 1 : 0,
                transition: 'opacity 420ms ease',
              }}
            />
          ))}
          {/* Bottom fade to white */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to top, #fff 0%, transparent 100%)', pointerEvents: 'none' }} />
        </Link>

        {/* Category name */}
        <Link href={current.link} style={{ display: 'block', padding: '12px 20px 14px', textAlign: 'center', textDecoration: 'none' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, fontStyle: 'normal', color: '#0A0A0A', letterSpacing: '0.01em' }}>
            {current.name}
          </span>
        </Link>

        {/* 3-Thumbnail Carousel */}
        <div style={{ position: 'relative', padding: '14px 0 0', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '6px' }}>

          {/* Left arrow */}
          <button
            onClick={() => goTo(idx - 1)}
            aria-label="Vorherige Kategorie"
            style={{
              position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 0, padding: '4px', cursor: idx === 0 ? 'default' : 'pointer',
              color: idx === 0 ? '#D8D8D8' : '#0A0A0A', transition: 'color 200ms ease',
            }}
          >
            <ArrowLeft />
          </button>

          {thumbSlots.map((ti, slot) => {
            const isCenter = slot === 1
            const cat = ti >= 0 && ti < kategorie.length ? kategorie[ti] : null
            return (
              <div
                key={slot}
                style={{
                  flexBasis: isCenter ? '118px' : '88px',
                  flexShrink: 0,
                  height: isCenter ? '150px' : '118px',
                  transition: 'flex-basis 360ms cubic-bezier(0.16,1,0.3,1), height 360ms cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                {cat ? (
                  <button
                    onClick={() => goTo(ti)}
                    style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'block', cursor: 'pointer', border: 'none', padding: 0, background: '#EDECEA' }}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 18%',
                        filter: isCenter ? 'brightness(1)' : 'brightness(0.7)',
                        transition: 'filter 300ms ease',
                      }}
                    />
                    {/* Active: color bar */}
                    {isCenter && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: cat.colorHex }} />
                    )}
                    {/* Inactive: name label */}
                    {!isCenter && (
                      <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, textAlign: 'center' }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '11px', fontWeight: 300, fontStyle: 'italic', color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                          {cat.name}
                        </span>
                      </div>
                    )}
                  </button>
                ) : (
                  <div />
                )}
              </div>
            )
          })}

          {/* Right arrow */}
          <button
            onClick={() => goTo(idx + 1)}
            aria-label="Nächste Kategorie"
            style={{
              position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 0, padding: '4px', cursor: idx === kategorie.length - 1 ? 'default' : 'pointer',
              color: idx === kategorie.length - 1 ? '#D8D8D8' : '#0A0A0A', transition: 'color 200ms ease',
            }}
          >
            <ArrowRight />
          </button>
        </div>

        {/* Progress lines */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', padding: '12px 0 20px' }}>
          {kategorie.map((kat, i) => (
            <button
              key={kat.id}
              onClick={() => goTo(i)}
              aria-label={`Zu ${kat.name}`}
              style={{
                width: i === idx ? '22px' : '8px',
                height: '2px',
                borderRadius: '1px',
                background: i === idx ? kat.colorHex : '#D8D8D4',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 360ms cubic-bezier(0.16,1,0.3,1), background 300ms ease',
              }}
            />
          ))}
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP — original layout
          ═══════════════════════════════════════════════════════════ */}
      <div className="hidden sm:block px-8 sm:px-16 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-12 items-center">

            {/* Left — list */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="font-league-spartan text-sm tracking-[0.2em] uppercase text-enunas-gray-medium">
                  Catalogue
                </p>
                <Link
                  href="/catalogue"
                  className="font-league-spartan text-[11px] tracking-[0.18em] uppercase text-enunas-black hover:text-enunas-purple transition-colors duration-200 flex items-center gap-1.5"
                >
                  Alle ansehen
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>

              <ul className="space-y-4">
                {kategorie.map((Kategorie) => (
                  <li key={Kategorie.id}>
                    <Link
                      href={Kategorie.link}
                      onMouseEnter={() => handleCategoryChange(Kategorie.id)}
                      className={`
                        relative group inline-block font-cormorant
                        text-4xl sm:text-5xl lg:text-6xl
                        font-light leading-tight
                        transition-all duration-300
                        ${activeKategorie === Kategorie.id ? 'opacity-100' : 'opacity-50 hover:opacity-70'}
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
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — image */}
            <div className="relative h-[700px] overflow-hidden">
              <img
                src={currentKategorie?.image}
                alt={currentKategorie?.name}
                className={`w-full h-full object-cover transition-all duration-700 ease-out ${isImageLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
                onLoad={() => setIsImageLoading(false)}
              />
              <div
                className="absolute inset-0 opacity-10 mix-blend-overlay transition-colors duration-500"
                style={{ backgroundColor: currentKategorie?.colorHex }}
              />
            </div>

          </div>
        </div>
      </div>

    </section>
  )
}
