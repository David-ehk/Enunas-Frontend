'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import CheckoutNavbar from '@/app/(root)/cart/components/CheckoutNavbar'
import CartFooter from '@/app/(root)/cart/components/CartFooter'
import { orderApi } from '@/lib/api/modules/orderApi'
import type { ApiOrder } from '@/types/api'
import { shippingAddressLines } from '@/lib/orderAddress'
import { formatEuro } from '@/lib/format'

// ── Helpers ───────────────────────────────────────────────────────────────────

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
                  {formatEuro(item.lineTotal)}
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
              {formatEuro(total)}
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
            {shippingAddressLines(order.shippingAddress).map((line, i) => <p key={i}>{line}</p>)}
            {order.shippingAddress.country && (
              <p>{order.shippingAddress.country}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page content (inside Suspense) ────────────────────────────────────────────

function BestaetiguungContent() {
  const searchParams  = useSearchParams()
  const orderId       = searchParams.get('orderId')

  const [order, setOrder]         = useState<ApiOrder | null>(null)
  const [orderLoading, setLoading] = useState(true)

  useEffect(() => {
    // One-shot: fetch the confirmed order, or drop the loading state if there's no id.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!orderId) { setLoading(false); return }
    orderApi.getById(orderId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  // ── VARIANT 1: Standard confirmation ─────────────────────────────────────────
  return (
    <>
      <CheckoutNavbar />
      <div className="min-h-screen bg-white pb-24 px-4 sm:px-8 lg:px-16" style={{ paddingTop: '42px' }}>
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
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ paddingTop: '42px' }}>
        <div className="w-8 h-8 border-2 border-enunas-gray-light border-t-enunas-purple rounded-full animate-spin" />
      </div>
    }>
      <BestaetiguungContent />
    </Suspense>
  )
}
