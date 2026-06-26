'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/app/Homepage/components/navbar'
import CartFooter from '@/app/(root)/cart/components/CartFooter'
import { orderApi, fetcher } from '@/lib/api'
import { useCart } from '@/app/context/CartContext'
import type { ApiOrder, ApiListing } from '@/types/api'

const UPSELL_CONFIG = {
  brandName: 'Vivienne Westwood',
  productName: 'Worlds End Denim Boxer Jacket',
  imageUrl:
    'https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Sites-viviennewestwood-master-catalog/default/dw69896e20/images/2G01000A-J001M-_GREY-MELANGE_001_large.jpeg?q=80',
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  listingId: 1, // TODO: update after running seed-test-data.sql
  fallbackOriginalPrice: 420,
} as const

const DISCOUNT_CODE = 'UPSELL10'
const DISCOUNT_PCT = 10
const COUNTDOWN_SECONDS = 10 * 60

// ── Animated checkmark ─────────────────────────────────────────────────────────

function LargeCheckmark() {
  return (
    <>
      <style>{`
        @keyframes drawCheck { to { stroke-dashoffset: 0; } }
        @keyframes popCircle { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
      <div
        className="w-20 h-20 rounded-full border-2 mx-auto flex items-center justify-center"
        style={{ borderColor: '#1A5A3C', animation: 'popCircle 0.45s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <path
            d="M6 17L13.5 24.5L28 10"
            stroke="#1A5A3C"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="38"
            strokeDashoffset="38"
            style={{ animation: 'drawCheck 0.5s ease-out 0.3s both' }}
          />
        </svg>
      </div>
    </>
  )
}

function SmallCheckmark() {
  return (
    <div className="w-6 h-6 rounded-full border border-enunas-purple flex items-center justify-center flex-shrink-0">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6L5 9L10 3" stroke="#370E4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ── 10-minute countdown ────────────────────────────────────────────────────────

function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds)
  useEffect(() => {
    if (remaining <= 0) return
    const id = setInterval(() => setRemaining(r => r - 1), 1000)
    return () => clearInterval(id)
  }, [remaining])
  const m = String(Math.floor(remaining / 60)).padStart(2, '0')
  const s = String(remaining % 60).padStart(2, '0')
  return { display: `${m}:${s}`, expired: remaining <= 0 }
}

function CountdownBanner({ discountPct }: { discountPct: number }) {
  const { display, expired } = useCountdown(COUNTDOWN_SECONDS)
  return (
    <div className="text-center mb-14">
      <p className="font-league-spartan text-[10px] tracking-[0.32em] uppercase text-enunas-gray-medium mb-4">
        Exklusiv für dich
      </p>
      {expired ? (
        <h2
          className="font-cormorant text-2xl sm:text-4xl lg:text-5xl font-light text-enunas-gray-medium mb-4"
          style={{ letterSpacing: '0.02em', lineHeight: 1.1 }}
        >
          Das Angebot ist abgelaufen.
        </h2>
      ) : (
        <>
          <h2
            className="font-cormorant font-light text-enunas-black mb-3"
            style={{ fontSize: 'clamp(22px, 6vw, 52px)', letterSpacing: '0.02em', lineHeight: 1.1 }}
          >
            Nur noch{' '}
            <span
              className="font-cormorant tabular-nums"
              style={{ color: '#8B1E3F', fontVariantNumeric: 'tabular-nums' }}
            >
              {display}
            </span>
            {' '}— {discountPct}% Rabatt
          </h2>
          <p className="font-league-spartan text-xs sm:text-sm text-enunas-gray-medium max-w-xs sm:max-w-sm mx-auto leading-relaxed px-4 sm:px-0">
            Diese Auswahl wird nicht jedem gemacht — sei schnell, das Angebot läuft ab.
          </p>
        </>
      )}
    </div>
  )
}

// ── Order details ──────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch {
    return iso
  }
}

function OrderDetails({ order }: { order: ApiOrder }) {
  const fmt = (n: number) => `€${n.toFixed(2).replace('.', ',')}`
  return (
    <div className="border-t border-enunas-gray-light mt-4">
      <div className="flex justify-between items-start py-6 border-b border-enunas-gray-light">
        <div>
          <p className="font-league-spartan text-[10px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-1.5">
            Bestellnummer
          </p>
          <p className="font-league-spartan text-sm text-enunas-black font-medium tracking-[0.05em]">
            {order.orderNumber ?? order.id}
          </p>
        </div>
        {order.createdAt && (
          <div className="text-right">
            <p className="font-league-spartan text-[10px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-1.5">
              Datum
            </p>
            <p className="font-league-spartan text-sm text-enunas-black">
              {formatDate(order.createdAt)}
            </p>
          </div>
        )}
      </div>

      {order.items && order.items.length > 0 && (
        <div className="py-6 border-b border-enunas-gray-light space-y-4">
          <p className="font-league-spartan text-[10px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-4">
            Artikel
          </p>
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <p className="font-league-spartan text-sm text-enunas-black leading-snug">
                  {item.productName ?? 'Artikel'}
                </p>
                {(item.variantSize || item.variantColor) && (
                  <p className="font-league-spartan text-[11px] text-enunas-gray-medium mt-0.5">
                    {[item.variantSize, item.variantColor].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <p className="font-league-spartan text-sm text-enunas-black flex-shrink-0">
                {item.discountPriceAtPurchase != null
                  ? fmt(item.discountPriceAtPurchase)
                  : item.priceAtPurchase != null
                    ? fmt(item.priceAtPurchase)
                    : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      {order.total != null && order.total > 0 && (
        <div className="py-5 border-b border-enunas-gray-light">
          <div className="flex justify-between">
            <p className="font-league-spartan text-sm text-enunas-black font-medium">Gesamt</p>
            <p className="font-league-spartan text-sm text-enunas-black font-medium">{fmt(order.total)}</p>
          </div>
          <p className="font-league-spartan text-[10px] text-enunas-gray-medium mt-1">inkl. MwSt.</p>
        </div>
      )}

      {order.shippingAddress && (
        <div className="py-6">
          <p className="font-league-spartan text-[10px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-3">
            Lieferadresse
          </p>
          <div className="font-league-spartan text-sm text-enunas-black space-y-0.5 leading-relaxed">
            {order.shippingAddress.fullName && <p>{order.shippingAddress.fullName}</p>}
            {order.shippingAddress.street && <p>{order.shippingAddress.street}</p>}
            {(order.shippingAddress.postalCode || order.shippingAddress.city) && (
              <p>{[order.shippingAddress.postalCode, order.shippingAddress.city].filter(Boolean).join(' ')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Shared primary CTA ─────────────────────────────────────────────────────────

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative inline-block overflow-hidden bg-enunas-purple text-white px-12 py-5 hover:bg-enunas-purple-dark transition-colors duration-300 ease-out-expo"
    >
      <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
      <span className="relative z-10 font-cormorant text-[18px] tracking-[0.06em]">{children}</span>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
    </Link>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

interface Props {
  orderNumber: string
  isUpsell: boolean
}

export default function ConfirmationClient({ orderNumber, isUpsell }: Props) {
  const router = useRouter()
  const { addToCart } = useCart()

  const [mainOrder, setMainOrder] = useState<ApiOrder | null>(null)
  const [mainOrderLoading, setMainOrderLoading] = useState(true)
  const [listing, setListing] = useState<ApiListing | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>(UPSELL_CONFIG.sizes[2])
  const [showUpsell, setShowUpsell] = useState(isUpsell)

  const hasTriggered = useRef(false)
  useEffect(() => {
    if (hasTriggered.current || isUpsell) return
    hasTriggered.current = true
    if (Math.random() < 0.2) setShowUpsell(true)
  }, [isUpsell])

  useEffect(() => {
    orderApi
      .getById(orderNumber)
      .then(setMainOrder)
      .catch(() => {})
      .finally(() => setMainOrderLoading(false))
  }, [orderNumber])

  useEffect(() => {
    if (!showUpsell) return
    fetcher<ApiListing>(`/listings/${UPSELL_CONFIG.listingId}`)
      .then(setListing)
      .catch(() => {})
  }, [showUpsell])

  const originalPrice = listing?.price ?? UPSELL_CONFIG.fallbackOriginalPrice
  const discountedPreviewPrice = Math.round(originalPrice * 0.9 * 100) / 100
  const fmt = (n: number) => `€${n.toFixed(2).replace('.', ',')}`

  function handleUpsellCheckout() {
    addToCart({
      productId: `upsell-${UPSELL_CONFIG.listingId}`,
      name: UPSELL_CONFIG.productName,
      brand: UPSELL_CONFIG.brandName,
      price: originalPrice,
      currency: 'EUR',
      size: selectedSize,
      image: UPSELL_CONFIG.imageUrl,
      defaultListingId: String(UPSELL_CONFIG.listingId),
    })
    localStorage.setItem('enunas_upsell_code', DISCOUNT_CODE)
    router.push('/checkout')
  }

  // ── CASE 3: ?upsell=true — full product detail + compact thank-you below ────
  if (isUpsell) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white pb-24" style={{ paddingTop: '60px' }}>

          {/* Product detail */}
          <section className="bg-enunas-off-white border-b border-enunas-gray-light">
            <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-20 lg:py-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">

                <div className="relative aspect-[3/4] overflow-hidden group">
                  <Image
                    src={UPSELL_CONFIG.imageUrl}
                    alt={UPSELL_CONFIG.productName}
                    fill
                    className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>

                <div className="flex flex-col gap-6 lg:pt-8">
                  <p className="font-league-spartan text-[10px] tracking-[0.25em] uppercase text-enunas-purple">
                    Exklusives Angebot
                  </p>
                  <div>
                    <p className="font-league-spartan text-xs tracking-[0.12em] uppercase text-enunas-gray-medium mb-1">
                      {UPSELL_CONFIG.brandName}
                    </p>
                    <h2 className="font-cormorant text-3xl lg:text-5xl font-light text-enunas-black leading-tight">
                      {UPSELL_CONFIG.productName}
                    </h2>
                  </div>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-league-spartan text-2xl font-semibold text-enunas-black">
                      {fmt(discountedPreviewPrice)}
                    </span>
                    <span className="font-league-spartan text-sm text-enunas-gray-medium line-through">
                      {fmt(originalPrice)}
                    </span>
                    <span
                      className="font-league-spartan text-[10px] uppercase tracking-[0.08em] text-enunas-purple px-2 py-1 flex-shrink-0"
                      style={{ backgroundColor: 'rgba(55,14,77,0.08)' }}
                    >
                      Enunas-Vorteil &minus;{DISCOUNT_PCT}&nbsp;%
                    </span>
                  </div>

                  <div>
                    <p className="font-league-spartan text-[10px] uppercase tracking-[0.15em] text-enunas-gray-medium mb-2">
                      Größe
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {UPSELL_CONFIG.sizes.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className="px-4 py-2 font-league-spartan text-xs tracking-[0.08em] border transition-colors duration-200"
                          style={{
                            borderColor: selectedSize === size ? '#370E4D' : '#E8E8E8',
                            color: selectedSize === size ? '#370E4D' : '#2D2D2D',
                            backgroundColor: selectedSize === size ? 'rgba(55,14,77,0.04)' : '#ffffff',
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleUpsellCheckout}
                      className="group relative overflow-hidden bg-enunas-purple text-white py-5 hover:bg-enunas-purple-dark transition-colors duration-300 ease-out-expo"
                    >
                      <span
                        className="absolute top-0 h-full w-[40%] -skew-x-12 left-[-60%] group-hover:left-[120%] transition-[left] duration-700 ease-out-expo pointer-events-none"
                        style={{ background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.2), transparent)' }}
                        aria-hidden
                      />
                      <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
                      <span className="relative z-10 font-cormorant text-[20px] tracking-[0.06em]">
                        Jetzt kaufen — {fmt(discountedPreviewPrice)}
                      </span>
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/orders/${orderNumber}/confirmation`)}
                      className="font-league-spartan text-[11px] tracking-[0.1em] text-enunas-gray-medium hover:text-enunas-black transition-colors duration-200"
                    >
                      Nein danke
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Compact thank-you below the product */}
          <div className="max-w-[580px] mx-auto px-6 py-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <SmallCheckmark />
              <p className="font-league-spartan text-[11px] tracking-[0.28em] uppercase text-enunas-gray-medium">
                Bestellung bestätigt
              </p>
            </div>
            <p className="font-cormorant text-xl text-enunas-black font-light">
              Vielen Dank für deine Bestellung.
            </p>
            {mainOrder?.orderNumber && (
              <p className="font-league-spartan text-xs text-enunas-gray-medium mt-2 tracking-[0.12em]">
                #{mainOrder.orderNumber}
              </p>
            )}
          </div>
        </div>
        <CartFooter />
      </>
    )
  }

  // ── CASE 2: 20% trigger — compact header + countdown + product card ──────────
  if (showUpsell) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white pb-24 px-4 sm:px-8 lg:px-16" style={{ paddingTop: '60px' }}>
          <div className="max-w-[1440px] mx-auto">

            {/* Compact confirmation header */}
            <div className="text-center pt-10 pb-10 border-b border-enunas-gray-light mb-10">
              <div className="flex items-center justify-center gap-3 mb-5">
                <SmallCheckmark />
                <p className="font-league-spartan text-[11px] tracking-[0.28em] uppercase text-enunas-gray-medium">
                  Bestellung bestätigt
                </p>
              </div>
              <h1
                className="font-cormorant text-2xl sm:text-3xl lg:text-4xl font-light text-enunas-black"
                style={{ letterSpacing: '0.02em' }}
              >
                Vielen Dank für deine Bestellung.
              </h1>
              {mainOrder?.orderNumber && (
                <p className="font-league-spartan text-xs text-enunas-gray-medium mt-3 tracking-[0.12em]">
                  Bestellnummer:{' '}
                  <span className="text-enunas-black font-medium">{mainOrder.orderNumber}</span>
                </p>
              )}
              <p className="font-league-spartan text-xs text-enunas-gray-medium mt-2">
                Du erhältst in Kürze eine Bestätigung per E-Mail.
              </p>
              <p className="font-cormorant italic text-base text-enunas-gray-medium mt-5 max-w-md mx-auto leading-relaxed">
                Als besonderen Dank für deine Bestellung haben wir dich für ein exklusives Angebot
                ausgewählt — eine Gelegenheit, die nicht jeder erhält.
              </p>
            </div>

            {/* Countdown + FOMO + upsell product */}
            <div className="py-8 lg:py-12">
              <CountdownBanner discountPct={DISCOUNT_PCT} />

              {/* Product card — click to see full offer */}
              <div className="flex justify-center mb-16">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/orders/${orderNumber}/confirmation?upsell=true`)}
                  onKeyDown={e => {
                    if (e.key === 'Enter')
                      router.push(`/orders/${orderNumber}/confirmation?upsell=true`)
                  }}
                  className="group cursor-pointer max-w-xs w-full"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-enunas-off-white mb-3">
                    <Image
                      src={UPSELL_CONFIG.imageUrl}
                      alt={UPSELL_CONFIG.productName}
                      fill
                      className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                      sizes="320px"
                    />
                    <div
                      className="absolute top-3 left-3 bg-enunas-purple text-white font-league-spartan px-2 py-1"
                      style={{ fontSize: '10px', letterSpacing: '0.08em' }}
                    >
                      −{DISCOUNT_PCT}%
                    </div>
                  </div>
                  <p className="font-league-spartan text-[10px] text-enunas-gray-medium uppercase tracking-[0.1em] mb-1">
                    {UPSELL_CONFIG.brandName}
                  </p>
                  <p className="font-cormorant text-base text-enunas-black leading-snug mb-2 group-hover:text-enunas-purple transition-colors duration-200">
                    {UPSELL_CONFIG.productName}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-league-spartan text-sm text-enunas-purple font-medium">
                      {fmt(discountedPreviewPrice)}
                    </span>
                    <span className="font-league-spartan text-xs text-enunas-gray-medium line-through">
                      {fmt(originalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="h-px bg-enunas-gray-light mb-12 max-w-[1280px] mx-auto" />
              <div className="flex flex-col items-center gap-5">
                <PrimaryLink href="/bekleidung">Weiter einkaufen</PrimaryLink>
                <Link
                  href="/account"
                  className="font-league-spartan text-xs text-enunas-gray-medium tracking-[0.12em] uppercase hover:text-enunas-black transition-colors duration-200"
                >
                  Meine Bestellungen ansehen
                </Link>
              </div>
            </div>
          </div>
        </div>
        <CartFooter />
      </>
    )
  }

  // ── CASE 1: 80% — elegant centered thank-you with animated checkmark ─────────
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pb-24 px-4 sm:px-8 lg:px-16" style={{ paddingTop: '60px' }}>
        <div className="max-w-[580px] mx-auto">

          <div className="text-center pt-20 pb-12">
            <LargeCheckmark />
            <p className="font-league-spartan text-[10px] tracking-[0.32em] uppercase text-enunas-gray-medium mt-8 mb-5">
              Bestellung bestätigt
            </p>
            <h1
              className="font-cormorant text-5xl lg:text-6xl font-light text-enunas-black"
              style={{ letterSpacing: '0.02em', lineHeight: 1.05 }}
            >
              Vielen Dank.
            </h1>
            <p className="font-cormorant italic text-lg text-enunas-gray-medium mt-3">
              Deine Bestellung ist bei uns eingegangen.
            </p>
            <p className="font-league-spartan text-xs text-enunas-gray-medium mt-4 leading-relaxed">
              Du erhältst in Kürze eine Bestätigung per E-Mail.
            </p>
          </div>

          {/* Order details */}
          {!mainOrderLoading && mainOrder && <OrderDetails order={mainOrder} />}
          {mainOrderLoading && (
            <div className="border-t border-enunas-gray-light pt-6 space-y-4">
              <div className="h-2.5 w-1/3 bg-enunas-off-white animate-pulse" />
              <div className="h-4 w-full bg-enunas-off-white animate-pulse" />
              <div className="h-4 w-3/4 bg-enunas-off-white animate-pulse" />
            </div>
          )}

          <div className="flex flex-col items-center gap-5 pt-12 pb-4">
            <PrimaryLink href="/bekleidung">Weiter einkaufen</PrimaryLink>
            <Link
              href="/account"
              className="font-league-spartan text-xs text-enunas-gray-medium tracking-[0.12em] uppercase hover:text-enunas-black transition-colors duration-200"
            >
              Meine Bestellungen ansehen
            </Link>
          </div>
        </div>
      </div>
      <CartFooter />
    </>
  )
}
