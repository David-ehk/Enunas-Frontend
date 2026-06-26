'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { resolveProductWithMeta } from '@/lib/api'
import CartFooter from '@/app/(root)/cart/components/CartFooter'

const DISCOUNT_PCT = 10
const COUNTDOWN_SECONDS = 10 * 60

// ── Countdown ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'enunas-angebot-start'

function useCountdown(totalSeconds: number) {
  const [remaining, setRemaining] = useState<number>(() => {
    if (typeof window === 'undefined') return totalSeconds
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      const elapsed = Math.floor((Date.now() - parseInt(stored, 10)) / 1000)
      return Math.max(0, totalSeconds - elapsed)
    }
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()))
    return totalSeconds
  })

  useEffect(() => {
    if (remaining <= 0) return
    const id = setInterval(() => {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (!stored) return
      const elapsed = Math.floor((Date.now() - parseInt(stored, 10)) / 1000)
      setRemaining(Math.max(0, totalSeconds - elapsed))
    }, 1000)
    return () => clearInterval(id)
  }, [totalSeconds, remaining])

  const m = String(Math.floor(remaining / 60)).padStart(2, '0')
  const s = String(remaining % 60).padStart(2, '0')
  return { display: `${m}:${s}`, expired: remaining <= 0, remaining }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AngebotPage() {
  const params = useParams<{ brand: string; slug: string }>()
  const router = useRouter()
  const { display, expired, remaining } = useCountdown(COUNTDOWN_SECONDS)

  const [product, setProduct] = useState<Awaited<ReturnType<typeof resolveProductWithMeta>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)

  useEffect(() => {
    resolveProductWithMeta(params.slug)
      .then(p => { setProduct(p); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.slug])

  const originalPrice = product?.price ?? 0
  const discountedPrice = originalPrice * (1 - DISCOUNT_PCT / 100)
  const images = product?.images ?? []
  const sizes = product?.sizes ?? []

  const progressPct = ((COUNTDOWN_SECONDS - remaining) / COUNTDOWN_SECONDS) * 100

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-enunas-gray-light border-t-enunas-purple rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-league-spartan text-sm text-enunas-gray-medium">Angebot nicht gefunden.</p>
      </div>
    )
  }

  function handleCta() {
    if (!selectedSize) {
      setSizeError(true)
      setTimeout(() => setSizeError(false), 2000)
      return
    }
    setAdded(true)
    localStorage.setItem('enunas_upsell_code', 'UPSELL10')
    setTimeout(() => router.push('/checkout?upsell=true'), 800)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Urgency bar ───────────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-enunas-purple text-white" style={{ height: '44px' }}>
        <div className="relative overflow-hidden h-full">
          <div
            className="absolute inset-0 bg-enunas-purple-dark transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
          <div className="relative z-10 h-full flex items-center justify-center gap-3 px-4">
            {expired ? (
              <p className="font-league-spartan text-xs tracking-[0.2em] uppercase">
                Das Angebot ist abgelaufen.
              </p>
            ) : (
              <>
                <span className="font-league-spartan text-[10px] tracking-[0.25em] uppercase opacity-70 hidden sm:inline">
                  Exklusives Angebot · Nur noch
                </span>
                <span
                  className="font-cormorant text-xl tabular-nums font-light"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {display}
                </span>
                <span className="font-league-spartan text-[10px] tracking-[0.25em] uppercase opacity-70 hidden sm:inline">
                  verfügbar
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Checkout-style navbar ─────────────────────────────────────────────── */}
      <nav
        className="fixed left-0 right-0 z-40 bg-white border-b border-enunas-gray-light"
        style={{ top: '44px', height: '64px' }}
      >
        <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-8 lg:px-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-cormorant text-2xl font-light tracking-[0.04em] text-enunas-black hover:opacity-70 transition-opacity duration-300"
          >
            Enunas
          </Link>
          <div className="flex items-center gap-2 text-enunas-gray-medium">
            <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="font-league-spartan text-[11px] tracking-[0.15em] uppercase">
              Sicher einkaufen
            </span>
          </div>
        </div>
      </nav>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="flex-1" style={{ paddingTop: '108px' }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* ── Left: Images ────────────────────────────────────────────────── */}
            <div className="lg:sticky lg:top-[130px]">
              <div className="relative overflow-hidden aspect-[3/4] bg-enunas-off-white">
                {images[selectedImage] && (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div
                  className="absolute top-4 left-4 bg-enunas-error text-white font-league-spartan px-3 py-1.5"
                  style={{ fontSize: '10px', letterSpacing: '0.12em' }}
                >
                  −{DISCOUNT_PCT}% EXKLUSIV
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 mt-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className="relative overflow-hidden aspect-square flex-1 bg-enunas-off-white"
                      style={{
                        outline: i === selectedImage ? '1.5px solid #370E4D' : '1.5px solid transparent',
                        outlineOffset: '1px',
                      }}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Info + CTA ───────────────────────────────────────────── */}
            <div>
              {/* Brand */}
              <p className="font-league-spartan text-xs text-enunas-purple tracking-[0.2em] uppercase mb-1 pb-2"
                style={{ borderBottom: '1px solid #370E4D', display: 'inline-block' }}>
                {product.brandName}
              </p>

              {/* Name */}
              <h1
                className="font-cormorant text-4xl lg:text-5xl font-light text-enunas-black mt-4 mb-6"
                style={{ letterSpacing: '0.01em', lineHeight: 1.05 }}
              >
                {product.name}
              </h1>

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-baseline gap-4 mb-1">
                  <span
                    className="font-cormorant font-light"
                    style={{ fontSize: 'clamp(30px, 5vw, 46px)', color: '#8B1E3F' }}
                  >
                    {discountedPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </span>
                  <span className="font-league-spartan text-lg text-enunas-gray-medium line-through">
                    {originalPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </span>
                </div>
                <p className="font-league-spartan text-[10px] text-enunas-gray-medium tracking-[0.1em] uppercase">
                  inkl. MwSt. · Kostenloser Versand · Nur für dich
                </p>
              </div>

              {/* Urgency callout */}
              {!expired && (
                <div
                  className="mb-8 px-5 py-4"
                  style={{ background: 'rgba(139, 30, 63, 0.05)', borderLeft: '2px solid #8B1E3F' }}
                >
                  <p className="font-cormorant italic text-base text-enunas-black leading-relaxed">
                    Dieses Angebot wurde nicht an jeden verschickt — du wurdest ausgewählt.
                    Es läuft in{' '}
                    <span className="font-cormorant not-italic tabular-nums" style={{ color: '#8B1E3F' }}>
                      {display}
                    </span>{' '}
                    ab.
                  </p>
                </div>
              )}

              {expired && (
                <div
                  className="mb-8 px-5 py-4"
                  style={{ background: 'rgba(107,107,107,0.06)', borderLeft: '2px solid #6B6B6B' }}
                >
                  <p className="font-cormorant italic text-base text-enunas-gray-medium leading-relaxed">
                    Das exklusive Angebot ist leider abgelaufen.
                  </p>
                </div>
              )}

              {/* Size selector */}
              {sizes.length > 0 && (
                <div className="mb-6">
                  <p className="font-league-spartan text-[10px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-3">
                    Größe wählen
                    {sizeError && (
                      <span className="ml-3 text-enunas-error normal-case tracking-normal">
                        — Bitte wähle eine Größe
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => { setSelectedSize(size); setSizeError(false) }}
                        className="font-league-spartan text-xs tracking-[0.08em] transition-all duration-200"
                        style={{
                          padding: '10px 18px',
                          border: selectedSize === size
                            ? '1.5px solid #370E4D'
                            : sizeError
                            ? '1.5px solid #8B1E3F'
                            : '1px solid #E8E8E8',
                          background: selectedSize === size ? '#370E4D' : 'white',
                          color: selectedSize === size ? 'white' : '#0A0A0A',
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA button — two white lines + shimmer */}
              {!expired ? (
                <div className="w-full">
                  <button
                    onClick={handleCta}
                    disabled={added}
                    className="group relative w-full overflow-hidden"
                    style={{
                      padding: '18px 48px',
                      background: added ? '#1A5A3C' : '#370E4D',
                      fontFamily: 'var(--font-league-spartan)',
                      fontSize: '13px',
                      fontWeight: 600,
                      letterSpacing: '0.18em',
                      color: 'white',
                      textTransform: 'uppercase',
                      transition: 'background-color 300ms',
                    }}
                    onMouseEnter={e => { if (!added) (e.currentTarget as HTMLElement).style.backgroundColor = '#250838' }}
                    onMouseLeave={e => { if (!added) (e.currentTarget as HTMLElement).style.backgroundColor = '#370E4D' }}
                  >
                    <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
                    <span className="relative z-10">
                      {added ? '✓ Zum Warenkorb hinzugefügt' : `Jetzt zugreifen — ${DISCOUNT_PCT}% sparen`}
                    </span>
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
                  </button>
                </div>
              ) : (
                <Link
                  href={`/bekleidung/${params.brand}/${params.slug}`}
                  className="block w-full py-5 font-league-spartan text-sm tracking-[0.18em] uppercase text-center text-enunas-purple border border-enunas-purple hover:bg-enunas-purple hover:text-white transition-colors duration-300"
                >
                  Zum regulären Preis ansehen
                </Link>
              )}

              {/* Decline — directly below button */}
              <div className="mt-4 text-center">
                <Link
                  href="/bekleidung"
                  className="font-league-spartan text-[10px] text-enunas-gray-medium tracking-[0.12em] uppercase hover:text-enunas-black transition-colors duration-200"
                >
                  Nein danke, ich verzichte auf das Angebot
                </Link>
              </div>

              {/* Trust signals */}
              <div className="mt-8 pt-6 border-t border-enunas-gray-light space-y-2.5">
                {[
                  'Kostenloser Versand',
                  '14 Tage Rückgaberecht',
                  'SSL-verschlüsselte Zahlung',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-enunas-success flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4L3 5.5L6.5 2" stroke="#1A5A3C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="font-league-spartan text-[11px] text-enunas-gray-medium tracking-[0.08em]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Product description */}
              {product.description && (
                <div className="mt-8 pt-6 border-t border-enunas-gray-light">
                  <p className="font-league-spartan text-[10px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-3">
                    Über dieses Produkt
                  </p>
                  <p className="font-cormorant text-base text-enunas-gray-dark leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Checkout footer ───────────────────────────────────────────────────── */}
      <CartFooter />
    </div>
  )
}
