'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import CheckoutNavbar from '@/app/(root)/cart/components/CheckoutNavbar'
import CartFooter from '@/app/(root)/cart/components/CartFooter'
import { orderApi } from '@/lib/api/modules/orderApi'
import { productApi, apiProductToCardShape } from '@/lib/api'
import type { ApiOrder } from '@/types/api'
import type { ProductCardShape } from '@/lib/api'

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsePriceNum(price: string): number {
  return parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

// ── Animated checkmark SVG ────────────────────────────────────────────────────

function LargeCheckmark() {
  return (
    <>
      <style>{`
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
        @keyframes popCircle {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
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

// ── Upsell product card ───────────────────────────────────────────────────────

function UpsellCard({ product, discountPct }: { product: ProductCardShape; discountPct: number }) {
  const originalPrice = parsePriceNum(product.price)
  const discountedPrice = originalPrice * (1 - discountPct / 100)

  return (
    <Link href={product.href} className="group block">
      <div className="relative overflow-hidden aspect-[3/4] bg-enunas-off-white mb-3">
        {product.imgURL ? (
          <img
            src={product.imgURL}
            alt={product.productName}
            className="w-full h-full object-cover transition-transform duration-800 ease-out-expo group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-enunas-off-white" />
        )}
        <div
          className="absolute top-3 left-3 bg-enunas-purple text-white font-league-spartan px-2 py-1"
          style={{ fontSize: '10px', letterSpacing: '0.08em' }}
        >
          −{discountPct}%
        </div>
      </div>

      <p className="font-league-spartan text-[10px] text-enunas-gray-medium uppercase tracking-[0.1em] mb-1">
        {product.brandName}
      </p>
      <p className="font-cormorant text-base text-enunas-black leading-snug mb-2 group-hover:text-enunas-purple transition-colors duration-200">
        {product.productName}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="font-league-spartan text-sm text-enunas-purple font-medium">
          €{discountedPrice.toFixed(2).replace('.', ',')}
        </span>
        <span className="font-league-spartan text-xs text-enunas-gray-medium line-through">
          {product.price}
        </span>
      </div>
    </Link>
  )
}

// ── Shared CTA button ─────────────────────────────────────────────────────────

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative inline-block overflow-hidden"
      style={{
        padding: '16px 48px',
        background: '#370E4D',
        fontFamily: 'var(--font-Cormorant-Garamond)',
        fontSize: '18px',
        fontWeight: 400,
        letterSpacing: '0.06em',
        color: 'white',
        transition: 'background-color 300ms',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#250838' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#370E4D' }}
    >
      <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
      <span className="relative z-10">{children}</span>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
    </Link>
  )
}

// ── Order detail rows ─────────────────────────────────────────────────────────

function OrderDetails({ order }: { order: ApiOrder }) {
  const orderNumber = order.orderNumber ?? order.id
  const total = order.total

  return (
    <div className="border-t border-enunas-gray-light mt-4">

      {/* Number + date */}
      <div className="flex justify-between items-start py-6 border-b border-enunas-gray-light">
        <div>
          <p className="font-league-spartan text-[10px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-1.5">
            Bestellnummer
          </p>
          <p className="font-league-spartan text-sm text-enunas-black font-medium tracking-[0.05em]">
            {orderNumber}
          </p>
        </div>
        <div className="text-right">
          <p className="font-league-spartan text-[10px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-1.5">
            Datum
          </p>
          <p className="font-league-spartan text-sm text-enunas-black">
            {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Items */}
      {order.items.length > 0 && (
        <div className="py-6 border-b border-enunas-gray-light space-y-4">
          <p className="font-league-spartan text-[10px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-4">
            Artikel
          </p>
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <p className="font-league-spartan text-sm text-enunas-black leading-snug">
                  {item.productName ?? item.name ?? 'Artikel'}
                </p>
                {(item.variantSize || item.variantColor) && (
                  <p className="font-league-spartan text-[11px] text-enunas-gray-medium mt-0.5">
                    {[item.variantSize, item.variantColor].filter(Boolean).join(' · ')}
                  </p>
                )}
                {item.quantity > 1 && (
                  <p className="font-league-spartan text-[11px] text-enunas-gray-medium">
                    ×{item.quantity}
                  </p>
                )}
              </div>
              {item.lineTotal != null && (
                <p className="font-league-spartan text-sm text-enunas-black flex-shrink-0">
                  €{item.lineTotal.toFixed(2).replace('.', ',')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      {total != null && total > 0 && (
        <div className="py-5 border-b border-enunas-gray-light">
          <div className="flex justify-between">
            <p className="font-league-spartan text-sm text-enunas-black font-medium">Gesamt</p>
            <p className="font-league-spartan text-sm text-enunas-black font-medium">
              €{total.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <p className="font-league-spartan text-[10px] text-enunas-gray-medium mt-1">inkl. MwSt.</p>
        </div>
      )}

      {/* Shipping address */}
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
            {order.shippingAddress.country && (
              <p>{order.shippingAddress.country}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── 10-minute countdown ───────────────────────────────────────────────────────

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
  const { display, expired } = useCountdown(10 * 60)
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
            style={{
              fontSize: 'clamp(22px, 6vw, 52px)',
              letterSpacing: '0.02em',
              lineHeight: 1.1,
            }}
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

// ── Page content (inside Suspense) ────────────────────────────────────────────

function BestaetiguungContent() {
  const searchParams  = useSearchParams()
  const orderId       = searchParams.get('orderId')
  const isUpsell      = searchParams.get('upsell') === 'true'
  const discountPct   = 10

  const [order, setOrder]         = useState<ApiOrder | null>(null)
  const [orderLoading, setLoading] = useState(true)
  const [products, setProducts]   = useState<ProductCardShape[]>([])

  useEffect(() => {
    if (!orderId) { setLoading(false); return }
    orderApi.getById(orderId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  useEffect(() => {
    if (!isUpsell) return
    productApi.list({ size: 4 })
      .then(r => setProducts(r.content.map(apiProductToCardShape)))
      .catch(() => {})
  }, [isUpsell])

  // ── VARIANT 2: Upsell ────────────────────────────────────────────────────────
  if (isUpsell) {
    return (
      <>
        <CheckoutNavbar />
        <div className="min-h-screen bg-white pb-24 px-4 sm:px-8 lg:px-16" style={{ paddingTop: '64px' }}>
          <div className="max-w-[1440px] mx-auto">

            {/* Compact confirmation header */}
            <div className="text-center pt-8 pb-6 border-b border-enunas-gray-light">
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
              {order?.orderNumber && (
                <p className="font-league-spartan text-xs text-enunas-gray-medium mt-3 tracking-[0.12em]">
                  Bestellnummer:{' '}
                  <span className="text-enunas-black font-medium">{order.orderNumber}</span>
                </p>
              )}
              <p className="font-league-spartan text-xs text-enunas-gray-medium mt-2">
                Du erhältst in Kürze eine Bestätigung per E-Mail.
              </p>
              <p className="font-cormorant italic text-base text-enunas-gray-medium mt-4 max-w-md mx-auto leading-relaxed">
                Als besonderen Dank für deine Bestellung haben wir dich für ein exklusives Angebot ausgewählt —
                eine Gelegenheit, die nicht jeder erhält.
              </p>
            </div>

            {/* Upsell section */}
            <div className="py-8 lg:py-16">
              <CountdownBanner discountPct={discountPct} />

              {/* Product grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 max-w-[1280px] mx-auto">
                {products.length > 0
                  ? products.map(p => (
                      <UpsellCard key={p.id} product={p} discountPct={discountPct} />
                    ))
                  : Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex flex-col gap-3">
                        <div className="aspect-[3/4] bg-enunas-off-white animate-pulse" />
                        <div className="h-2.5 w-1/2 bg-enunas-off-white animate-pulse" />
                        <div className="h-4 w-3/4 bg-enunas-off-white animate-pulse" />
                        <div className="h-3 w-1/3 bg-enunas-off-white animate-pulse" />
                      </div>
                    ))
                }
              </div>

              {/* Divider + CTA */}
              <div className="max-w-[1280px] mx-auto">
                <div className="h-px bg-enunas-gray-light mt-16 mb-12" />
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
        </div>
        <CartFooter />
      </>
    )
  }

  // ── VARIANT 1: Standard confirmation ─────────────────────────────────────────
  return (
    <>
      <CheckoutNavbar />
      <div className="min-h-screen bg-white pb-24 px-4 sm:px-8 lg:px-16" style={{ paddingTop: '64px' }}>
        <div className="max-w-[580px] mx-auto">

          {/* Hero */}
          <div className="text-center pt-20 pb-12">
            <LargeCheckmark />

            <p
              className="font-league-spartan text-[10px] tracking-[0.32em] uppercase text-enunas-gray-medium mt-8 mb-5"
              style={{ animationDelay: '0.5s' }}
            >
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
          {!orderLoading && order && <OrderDetails order={order} />}

          {/* Skeleton while loading */}
          {orderLoading && (
            <div className="border-t border-enunas-gray-light pt-6 space-y-4">
              <div className="h-2.5 w-1/3 bg-enunas-off-white animate-pulse" />
              <div className="h-4 w-full bg-enunas-off-white animate-pulse" />
              <div className="h-4 w-3/4 bg-enunas-off-white animate-pulse" />
            </div>
          )}

          {/* CTAs */}
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

// ── Root export ───────────────────────────────────────────────────────────────

export default function BestaetiguungPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ paddingTop: '64px' }}>
        <div className="w-8 h-8 border-2 border-enunas-gray-light border-t-enunas-purple rounded-full animate-spin" />
      </div>
    }>
      <BestaetiguungContent />
    </Suspense>
  )
}
