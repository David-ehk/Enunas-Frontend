'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'

// The mobile rail renders this many back-to-back copies of the category
// list and silently re-centres onto the middle copy once the user stops
// scrolling — so swiping or arrow-tapping in either direction never hits
// a visible end, it just loops.
const RAIL_COPIES = 3
const HOME_COPY = 1

export default function KategorieAuswahl() {
  // Desktop state
  const [activeKategorie, setActiveKategorie] = useState('kategorie1')
  const [isImageLoading, setIsImageLoading] = useState(false)

  const kategorie = [
    { id: 'kategorie1', name: 'Streetwear',   image: '/assets/images/Test6.WebP',  color: 'bg-[#0011A5]', colorHex: '#0011A5', link: '/bekleidung/streetwear'   },
    { id: 'kategorie2', name: 'Experimental', image: '/assets/images/Test2.WebP', color: 'bg-[#6C169C]', colorHex: '#6C169C', link: '/bekleidung/experimental' },
    { id: 'kategorie3', name: 'Athleisure',   image: '/assets/images/Test3.WebP',  color: 'bg-[#C01B1B]', colorHex: '#C01B1B', link: '/bekleidung/athleisure'  },
    { id: 'kategorie4', name: 'Cultural',     image: '/assets/images/Test4.WebP',  color: 'bg-[#EA9575]', colorHex: '#EA9575', link: '/bekleidung/cultural'    },
    { id: 'kategorie5', name: 'Star',         image: '/assets/images/Test5.WebP',  color: 'bg-black',     colorHex: '#000000', link: '/bekleidung/star'        },
  ]

  // Mobile carousel state
  const [idx, setIdx] = useState(0)       // default: Streetwear
  const [centeredSlot, setCenteredSlot] = useState(HOME_COPY * kategorie.length)
  const railRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const homeSlot = (trueIndex: number) => HOME_COPY * kategorie.length + trueIndex

  // Rail render list: RAIL_COPIES back-to-back copies of every category.
  const railItems = Array.from({ length: RAIL_COPIES }, (_, copy) =>
    kategorie.map((cat, i) => ({ ...cat, id: `${cat.id}-c${copy}`, trueIndex: i }))
  ).flat()

  const currentKategorie = kategorie.find(a => a.id === activeKategorie)

  function handleCategoryChange(id: string) {
    if (id !== activeKategorie) {
      setIsImageLoading(true)
      setActiveKategorie(id)
    }
  }

  // Ref callback that assigns without returning a value
  const setItemRef = useCallback((index: number) => (el: HTMLButtonElement | null) => {
    itemRefs.current[index] = el
  }, [])

  // Centre the initially active thumbnail without an animated jump on mount.
  // Deliberately NOT scrollIntoView: on first load this section sits below the
  // full-viewport Hero, so the browser treats the thumbnail as "out of view"
  // and scrolls the whole page down to it — hijacking the homepage away from
  // the Hero video. Setting the rail's own scrollLeft only ever moves the
  // horizontal carousel, never the page.
  useEffect(() => {
    const el = itemRefs.current[centeredSlot]
    const rail = railRef.current
    if (!el || !rail) return
    const elRect = el.getBoundingClientRect()
    const railRect = rail.getBoundingClientRect()
    rail.scrollLeft += (elRect.left + elRect.width / 2) - (railRect.left + railRect.width / 2)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the active thumbnail — and therefore the hero image, name and
  // progress bar — in sync while the user swipes the rail manually. Picks
  // whichever thumbnail's centre sits closest to the rail's centre, rather
  // than relying on visibility thresholds (multiple thumbnails can be
  // simultaneously "visible" at once, which isn't the same as "centred").
  //
  // Once scrolling settles outside the middle copy, silently (no animation)
  // re-centre on the same category in the middle copy — this is what makes
  // the rail feel endless: there's always at least one full copy of
  // buffer left to scroll into on either side.
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    let frame: number | null = null
    let settleTimer: ReturnType<typeof setTimeout> | null = null

    const updateFromScroll = () => {
      frame = null
      const railRect = rail.getBoundingClientRect()
      const center = railRect.left + railRect.width / 2
      let closest = 0
      let closestDistance = Infinity
      itemRefs.current.forEach((el, i) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const distance = Math.abs(rect.left + rect.width / 2 - center)
        if (distance < closestDistance) {
          closestDistance = distance
          closest = i
        }
      })
      const trueIndex = railItems[closest]?.trueIndex ?? 0
      setCenteredSlot(closest)
      setIdx(trueIndex)

      if (settleTimer) clearTimeout(settleTimer)
      settleTimer = setTimeout(() => {
        const copy = Math.floor(closest / kategorie.length)
        if (copy !== HOME_COPY) {
          const target = homeSlot(trueIndex)
          itemRefs.current[target]?.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' })
          setCenteredSlot(target)
        }
      }, 150)
    }

    const handleScroll = () => {
      if (frame !== null) return
      frame = requestAnimationFrame(updateFromScroll)
    }

    rail.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      rail.removeEventListener('scroll', handleScroll)
      if (frame !== null) cancelAnimationFrame(frame)
      if (settleTimer) clearTimeout(settleTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function scrollToSlot(slot: number) {
    itemRefs.current[slot]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  function step(delta: number) {
    scrollToSlot(centeredSlot + delta)
  }

  // Jumps to whichever copy of the target category sits closest to where
  // we currently are, so a dot click never scrolls further than it has to.
  function goTo(trueIndex: number) {
    if (trueIndex < 0 || trueIndex >= kategorie.length) return
    let nearest = trueIndex
    for (let copy = 0; copy < RAIL_COPIES; copy++) {
      const candidate = copy * kategorie.length + trueIndex
      if (Math.abs(candidate - centeredSlot) < Math.abs(nearest - centeredSlot)) nearest = candidate
    }
    scrollToSlot(nearest)
  }

  const current = kategorie[idx]

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
          MOBILE + TABLET — Moncler-inspired carousel
          ═══════════════════════════════════════════════════════════ */}
      <div className="block lg:hidden" style={{ background: '#FFFFFF' }}>

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

        {/* Category name — neumorphic pill (soft dual shadow, no border), signals it's a link to the category page */}
        <Link href={current.link} style={{ display: 'flex', justifyContent: 'center', padding: '14px 20px 18px', textDecoration: 'none' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '12px 28px',
              borderRadius: '999px',
              background: `color-mix(in srgb, ${current.colorHex} 8%, #F5F5F0)`,
              boxShadow: `-6px -6px 14px rgba(255,255,255,0.9), 6px 6px 14px color-mix(in srgb, ${current.colorHex} 35%, #AEAEC0)`,
              transition: 'background 300ms ease, box-shadow 300ms ease',
            }}
          >
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 300, fontStyle: 'normal', color: '#0A0A0A', letterSpacing: '0.01em' }}>
              {current.name}
            </span>
          </span>
        </Link>

        {/* Thumbnail rail — swipeable on the x-axis, arrows scroll it too */}
        <div style={{ position: 'relative', padding: '14px 0 0' }}>

          {/* Left arrow — always active, the rail loops endlessly */}
          <button
            onClick={() => step(-1)}
            aria-label="Vorherige Kategorie"
            style={{
              position: 'absolute', left: '-5px', top: '50%', transform: 'translateY(-50%)', zIndex: 2,
              background: 'none', border: 0, padding: '15px', cursor: 'pointer',
              color: '#0A0A0A', transition: 'color 200ms ease',
            }}
          >
            <ArrowLeft />
          </button>

          <div
            ref={railRef}
            className="scrollbar-hide"
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '6px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              padding: '0 calc(50% - 59px)',
            }}
          >
            {railItems.map((cat, slot) => {
              const isCenter = slot === centeredSlot
              return (
                <button
                  key={`${cat.id}-${slot}`}
                  ref={setItemRef(slot)}
                  onClick={() => scrollToSlot(slot)}
                  style={{
                    position: 'relative',
                    flexBasis: isCenter ? '118px' : '88px',
                    flexShrink: 0,
                    height: isCenter ? '150px' : '118px',
                    overflow: 'hidden',
                    display: 'block',
                    cursor: 'pointer',
                    border: 'none',
                    padding: 0,
                    background: '#EDECEA',
                    scrollSnapAlign: 'center',
                    transition: 'flex-basis 360ms cubic-bezier(0.16,1,0.3,1), height 360ms cubic-bezier(0.16,1,0.3,1)',
                  }}
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
              )
            })}
          </div>

          {/* Right arrow — always active, the rail loops endlessly */}
          <button
            onClick={() => step(1)}
            aria-label="Nächste Kategorie"
            style={{
              position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', zIndex: 2,
              background: 'none', border: 0, padding: '15px', cursor: 'pointer',
              color: '#0A0A0A', transition: 'color 200ms ease',
            }}
          >
            <ArrowRight />
          </button>
        </div>

        {/* Progress pills — glassmorphism/neumorphism look */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px 0 20px' }}>
          {kategorie.map((kat, i) => {
            const isActive = i === idx
            return (
              <button
                key={kat.id}
                onClick={() => goTo(i)}
                aria-label={`Zu ${kat.name}`}
                style={{
                  // Padding + matching negative margin: 44px tall tap target,
                  // while the visible pill keeps its own compact footprint.
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 4px',
                  margin: '-12px 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: isActive ? '30px' : '18px',
                    height: '18px',
                    borderRadius: '999px',
                    background: isActive ? 'rgba(255,255,255,0.65)' : 'rgba(245,245,240,0.55)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    border: `1px solid ${isActive ? kat.colorHex : 'rgba(10,10,10,0.12)'}`,
                    boxShadow: isActive
                      ? '3px 3px 6px rgba(0,0,0,0.08), -2px -2px 5px rgba(255,255,255,0.85)'
                      : '2px 2px 4px rgba(0,0,0,0.05), -1px -1px 3px rgba(255,255,255,0.65)',
                    transition: 'width 360ms cubic-bezier(0.16,1,0.3,1), background 300ms ease, border-color 300ms ease, box-shadow 300ms ease',
                  }}
                >
                  {isActive && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '999px', background: kat.colorHex }} />
                  )}
                </span>
              </button>
            )
          })}
        </div>

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

      </div>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP — original layout
          ═══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block px-8 sm:px-16 sm:py-8">
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
