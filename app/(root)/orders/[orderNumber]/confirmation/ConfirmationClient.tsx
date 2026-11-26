'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/app/Homepage/components/navbar'
import CartFooter from '@/app/(root)/cart/components/CartFooter'
import { orderApi } from '@/lib/api'
import { useCart } from '@/app/context/CartContext'
import type { ApiOrder, LiveOffer } from '@/types/api'
import { requestUpsellOffer, msLeft, forgetAppliedOffer, orderDiscountLabel } from '@/lib/upsellOffer'
import { useOfferCountdown } from '@/hooks/use-offer-countdown'
import OfferConfirmation from './components/OfferConfirmation'
import PrimaryLink from './components/PrimaryLink'
import { paymentOutcome, takePendingCheckout } from '@/lib/paymentOutcome'
import OrderItemThumb from '@/components/ui/OrderItemThumb'
import { shippingAddressLines } from '@/lib/orderAddress'
import { itemGross } from '@/lib/brandRevenue'
import { formatEuro } from '@/lib/format'

// Mollie's webhook usually lands before the customer is redirected back, but not always. Re-check
// a PENDING order for ~30 s before settling on "not confirmed yet".
const PAYMENT_POLL_INTERVAL_MS = 3000
const PAYMENT_POLL_ATTEMPTS = 10

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

// ── Order details ──────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch {
    return iso
  }
}

function OrderDetails({ order }: { order: ApiOrder }) {
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
              <OrderItemThumb src={item.imageUrl} alt={item.productName ?? ''} width={56} />
              <div className="flex-1 min-w-0">
                <p className="font-league-spartan text-sm text-enunas-black leading-snug">
                  {item.productName ?? 'Artikel'}
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
              {/* Line total, so the lines add up to the subtotal. */}
              <p className="font-league-spartan text-sm text-enunas-black flex-shrink-0">
                {formatEuro(itemGross(item))}
              </p>
            </div>
          ))}
        </div>
      )}

      {order.total != null && order.total > 0 && (
        <div className="py-5 border-b border-enunas-gray-light">
          {order.subtotal != null && (
            <div className="flex justify-between font-league-spartan text-xs text-enunas-gray-medium mb-2">
              <span>Zwischensumme</span>
              <span>{formatEuro(order.subtotal)}</span>
            </div>
          )}

          {/* shippingSnapshots is frozen at checkout, one line per brand. An empty/missing array
              means this order predates the shipping feature (no backfill) — treated as "no
              data", never displayed as free shipping. */}
          {order.shippingSnapshots && order.shippingSnapshots.length > 0 ? (
            order.shippingSnapshots.map(line => (
              <div key={line.brandId} className="flex justify-between font-league-spartan text-xs text-enunas-gray-medium mb-2">
                <span>Versand — {line.brandName}</span>
                <span>{line.amount === 0 ? 'Kostenlos' : formatEuro(line.amount)}</span>
              </div>
            ))
          ) : order.shippingTotal != null ? (
            <div className="flex justify-between font-league-spartan text-xs text-enunas-gray-medium mb-2">
              <span>Versand</span>
              <span>{order.shippingTotal === 0 ? 'Kostenlos' : formatEuro(order.shippingTotal)}</span>
            </div>
          ) : null}

          {order.discountAmount != null && order.discountAmount > 0 && (
            <div className="flex justify-between font-league-spartan text-xs text-enunas-success mb-2">
              <span>{orderDiscountLabel(order)}</span>
              <span>−{formatEuro(order.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t border-enunas-gray-light">
            <p className="font-league-spartan text-sm text-enunas-black font-medium">Gesamt</p>
            <p className="font-league-spartan text-sm text-enunas-black font-medium">{formatEuro(order.total)}</p>
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
            {shippingAddressLines(order.shippingAddress).map((line, i) => <p key={i}>{line}</p>)}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

interface Props {
  orderNumber: string
}

export default function ConfirmationClient({ orderNumber }: Props) {
  const { clearCart } = useCart()

  const [mainOrder, setMainOrder] = useState<ApiOrder | null>(null)
  const [mainOrderLoading, setMainOrderLoading] = useState(true)
  const [pollExhausted, setPollExhausted] = useState(false)
  const [recheckSignal, setRecheckSignal] = useState(0)
  const [upsell, setUpsell] = useState<LiveOffer | null>(null)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let attempt = 0
    const check = async () => {
      let order: ApiOrder | null = null
      try {
        order = await orderApi.getByOrderNumber(orderNumber)
      } catch {
        // Treated as "could not load" below — never as a confirmed order.
      }
      if (cancelled) return
      setMainOrder(order)
      setMainOrderLoading(false)
      if (paymentOutcome(order?.status, order?.paidAt) !== 'processing') return
      attempt += 1
      if (attempt < PAYMENT_POLL_ATTEMPTS) timer = setTimeout(check, PAYMENT_POLL_INTERVAL_MS)
      else setPollExhausted(true)
    }
    check()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [orderNumber, recheckSignal])

  const outcome = mainOrderLoading ? null : paymentOutcome(mainOrder?.status, mainOrder?.paidAt)

  // Clears the cart only for the checkout that was actually handed to Mollie, and only once it is
  // settled: paid → empty the cart; cancelled (unpaid) → forget the hand-off but keep the items.
  // Refunded (paid then cancelled) also clears because the customer won't reorder the same items.
  useEffect(() => {
    if (outcome !== 'confirmed' && outcome !== 'failed' && outcome !== 'refunded') return
    if (takePendingCheckout(mainOrder?.orderNumber ?? orderNumber) && outcome === 'confirmed') clearCart()
    // The offer is redeemed once its order is paid, so the checkout must stop sending it.
    if (outcome === 'confirmed' && mainOrder?.upsellOfferId != null) forgetAppliedOffer(mainOrder.upsellOfferId)
    if (outcome === 'refunded') {
      // Refunded order: clear the cart since the customer won't reorder these items.
      clearCart()
      takePendingCheckout(mainOrder?.orderNumber ?? orderNumber) // Forget the hand-off.
    }
  }, [outcome, mainOrder?.orderNumber, mainOrder?.upsellOfferId, orderNumber, clearCart])

  const offerOrderNumber = mainOrder?.orderNumber ?? orderNumber

  // The backend rolls once per paid order and repeats its answer, so asking again is harmless.
  useEffect(() => {
    if (outcome !== 'confirmed') return
    let cancelled = false
    requestUpsellOffer(() => orderApi.rollUpsellOffer(offerOrderNumber), {
      isCancelled: () => cancelled,
    }).then((offer) => {
      // An offer that had already expired when it arrived leaves the plain thank-you in place.
      if (!cancelled && offer && msLeft(offer.deadline) > 0) setUpsell(offer)
    })
    return () => {
      cancelled = true
    }
  }, [outcome, offerOrderNumber])

  const remaining = useOfferCountdown(upsell?.deadline ?? null)

  // ── Payment not confirmed — Mollie redirects here after failed/cancelled payments too, so
  // nothing below (every case says “Bestellung bestätigt”) may render until the order is paid. ──
  if (outcome !== 'confirmed') {
    const stillChecking = outcome === null || (outcome === 'processing' && !pollExhausted)
    const heading =
      stillChecking ? 'Zahlung wird geprüft…'
      : outcome === 'failed' ? 'Zahlung nicht abgeschlossen.'
      : outcome === 'refunded' ? 'Bestellung storniert'
      : outcome === 'processing' ? 'Zahlung noch nicht bestätigt.'
      : 'Status nicht verfügbar.'
    const body =
      stillChecking ? 'Einen Moment bitte — wir warten auf die Bestätigung deiner Zahlung.'
      : outcome === 'failed' ? 'Diese Bestellung wurde storniert, weil die Zahlung nicht zustande kam. Es wurde nichts abgebucht, und deine Artikel liegen weiterhin im Warenkorb.'
      : outcome === 'refunded' ? 'Deine Bestellung wurde storniert. Die Zahlung ist eingegangen, die Bestellung konnte aber nicht erfüllt werden. Der vollständige Betrag wird auf deine ursprüngliche Zahlungsmethode erstattet (5–10 Werktage).'
      : outcome === 'processing' ? 'Falls du die Zahlung abgebrochen hast, wird die Bestellung innerhalb von 30 Minuten automatisch storniert — es wird nichts abgebucht und du musst nichts weiter tun. Deine Artikel liegen weiterhin im Warenkorb.'
      : 'Wir konnten den Status deiner Bestellung gerade nicht laden. Unter „Meine Bestellungen” siehst du, ob die Zahlung eingegangen ist.'

    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white pb-24 px-4 sm:px-8 lg:px-16" style={{ paddingTop: '60px' }}>
          <div className="max-w-[580px] mx-auto">
            <div className="text-center pt-20 pb-12" role="status" aria-live="polite">
              {stillChecking && (
                <div className="w-8 h-8 mx-auto mb-8 border-2 border-enunas-gray-light border-t-enunas-purple rounded-full animate-spin motion-reduce:animate-none" />
              )}
              <p className="font-league-spartan text-[10px] tracking-[0.32em] uppercase text-enunas-gray-medium mb-5">
                {mainOrder?.orderNumber ? `Bestellung ${mainOrder.orderNumber}` : 'Deine Bestellung'}
              </p>
              <h1
                className="font-cormorant text-4xl lg:text-5xl font-light text-enunas-black"
                style={{ letterSpacing: '0.02em', lineHeight: 1.05 }}
              >
                {heading}
              </h1>
              <p className="font-league-spartan text-sm text-enunas-gray-medium mt-5 leading-relaxed">
                {body}
              </p>
            </div>

            {!stillChecking && (
              <div className="flex flex-col items-center gap-5 pt-4 pb-4">
                {outcome === 'unknown' ? (
                  <PrimaryLink href="/account">Meine Bestellungen</PrimaryLink>
                ) : (
                  <PrimaryLink href="/cart">Zum Warenkorb</PrimaryLink>
                )}
                {outcome === 'processing' || outcome === 'unknown' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPollExhausted(false)
                      setMainOrderLoading(true)
                      setRecheckSignal((s) => s + 1)
                    }}
                    className="font-league-spartan text-xs text-enunas-gray-medium tracking-[0.12em] uppercase hover:text-enunas-black transition-colors duration-200"
                  >
                    Status erneut prüfen
                  </button>
                ) : (
                  <Link
                    href="/account"
                    className="font-league-spartan text-xs text-enunas-gray-medium tracking-[0.12em] uppercase hover:text-enunas-black transition-colors duration-200"
                  >
                    Meine Bestellungen ansehen
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
        <CartFooter />
      </>
    )
  }

  if (upsell && remaining !== null) {
    return (
      <OfferConfirmation
        offer={upsell}
        remaining={remaining}
        orderNumber={offerOrderNumber}
      />
    )
  }

  // ── No offer: elegant centered thank-you with animated checkmark ─────────
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
