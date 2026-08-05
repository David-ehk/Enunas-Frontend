'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/app/context/CartContext'
import { useAuth } from '@/app/context/AuthContext'
import CheckoutNavbar from '@/app/(root)/cart/components/CheckoutNavbar'
import CartFooter from '@/app/(root)/cart/components/CartFooter'
import CheckoutAuthGate from './components/CheckoutAuthGate'
import SavedAddressSelector from './components/SavedAddressSelector'
import { orderApi, FetchError } from '@/lib/api'
import { calcShipping, calcUpsellDiscount, calcFinalTotal } from '@/lib/pricing'
import { toShippingAddressDto, type AddressSelection } from '@/lib/address'

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()

  const shippingCost = calcShipping(totalPrice)

  const [email, setEmail] = useState(user?.email ?? '')
  const [addressSelection, setAddressSelection] = useState<AddressSelection | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'applepay' | 'klarna' | 'card'>('paypal')
  const [promoCode, setPromoCode] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null)

  // Auto-apply discount code passed from the upsell confirmation flow
  useEffect(() => {
    const upsellCode = localStorage.getItem('enunas_upsell_code')
    if (upsellCode) {
      setPromoCode(upsellCode)
    }
  }, [])

  // Keeps the visible input in sync when a code was auto-applied above, without fighting the
  // user's own typing — this only fires when promoCode itself changes, not on every render.
  useEffect(() => {
    if (promoCode) setCouponInput(promoCode)
  }, [promoCode])

  useEffect(() => {
    if (user?.email) setEmail(user.email)
  }, [user?.email])

  const upsellDiscount = calcUpsellDiscount(totalPrice, promoCode)
  const finalTotal = calcFinalTotal(totalPrice, shippingCost, upsellDiscount)

  // There is no backend endpoint to pre-validate a discount code — only /orders itself applies
  // and returns the real discount at creation time (see lib/pricing.ts's own note on this). So
  // this never fabricates a discount preview for a code it can't verify: UPSELL10 is the one
  // code the client recognizes and can show feedback for immediately; anything else is simply
  // carried through to order submission, where the backend is the actual authority.
  function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault()
    const code = couponInput.trim()
    setPromoCode(code)
    if (!code) {
      setCouponMessage(null)
    } else if (calcUpsellDiscount(totalPrice, code) > 0) {
      setCouponMessage({ type: 'success', text: '✓ Rabatt angewendet' })
    } else {
      setCouponMessage({ type: 'info', text: 'Wird bei der Bestellung geprüft.' })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isAuthenticated) {
      setError('Bitte melden Sie sich an, um fortzufahren.')
      return
    }
    if (!addressSelection) {
      setError('Bitte wähle oder gib eine Lieferadresse ein.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const missingListing = cartItems.find((item) => !item.defaultListingId)
      if (missingListing) {
        setError(
          `"${missingListing.name}" kann nicht bestellt werden — bitte entferne es und füge es erneut hinzu.`
        )
        setLoading(false)
        return
      }

      // Exactly one of savedAddressId / shippingAddress — never both, never neither. See
      // docs/superpowers/specs/2026-08-05-checkout-address-design.md §2.
      const order = await orderApi.create({
        items: cartItems.map((item) => ({
          listingId: Number(item.defaultListingId!),
          quantity: item.quantity,
        })),
        ...(addressSelection.mode === 'saved'
          ? { savedAddressId: addressSelection.id }
          : { shippingAddress: toShippingAddressDto(addressSelection.address) }),
        discountCode: promoCode.trim() || undefined,
      })

      if (!order.checkoutUrl) {
        setError('Kein Zahlungslink erhalten. Bitte versuche es erneut.')
        return
      }

      localStorage.removeItem('enunas_upsell_code')
      clearCart()
      window.location.href = order.checkoutUrl
    } catch (err) {
      setError(
        err instanceof FetchError
          ? err.message
          : 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full border border-enunas-gray-light px-4 py-3 font-league-spartan text-sm text-enunas-black bg-white focus:outline-none focus:border-enunas-purple transition-colors duration-200'

  if (cartItems.length === 0) {
    return (
      <>
        <CheckoutNavbar />
        <div className="min-h-screen pb-20 flex items-center justify-center px-4" style={{ paddingTop: '42px' }}>
          <div className="text-center">
            <h1
              className="text-3xl text-enunas-black font-light mb-4"
              style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
            >
              Ihr Warenkorb ist leer
            </h1>
            <Link
              href="/bekleidung"
              className="group relative inline-block overflow-hidden bg-enunas-purple text-white px-8 py-4 hover:bg-enunas-purple-dark transition-colors duration-300 ease-out-expo"
            >
              <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
              <span className="relative z-10 font-cormorant text-[18px] tracking-[0.06em]">Weiter einkaufen</span>
              <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
            </Link>
          </div>
        </div>
        <CartFooter />
      </>
    )
  }

  // Checkout requires an authenticated user — the address book and order creation both need
  // one. Waits for the auth check to resolve first so an actually-logged-in visitor never
  // flashes the gate. Cart items already live in CartContext/localStorage, so nothing is lost
  // while they log in or register inline below.
  if (authLoading) {
    return (
      <>
        <CheckoutNavbar />
        <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '42px' }}>
          <div className="w-8 h-8 border-2 border-enunas-gray-light border-t-enunas-purple rounded-full animate-spin" />
        </div>
        <CartFooter />
      </>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <CheckoutNavbar />
        <div className="min-h-screen pb-20 px-4" style={{ paddingTop: '42px' }}>
          <CheckoutAuthGate />
        </div>
        <CartFooter />
      </>
    )
  }

  return (
    <>
      <CheckoutNavbar />
      <div className="min-h-screen pb-20 px-4 sm:px-8 lg:px-16 bg-white" style={{ paddingTop: '42px' }}>
        <div className="max-w-6xl mx-auto">

          {/* Breadcrumb + heading */}
          <div className="mb-10">
            <p className="font-league-spartan text-[10px] uppercase tracking-[0.2em] text-enunas-gray-medium mb-3">
              <Link href="/cart" className="hover:text-enunas-black transition-colors duration-200">
                Warenkorb
              </Link>
              <span className="mx-2">/</span>
              <span className="text-enunas-black">Kasse</span>
            </p>
            <h1
              className="text-3xl lg:text-4xl text-enunas-black font-light tracking-[0.02em]"
              style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
            >
              Kasse
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">

            {/* ── Left: form ──────────────────────────────── */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-10">

              {/* Contact */}
              <section>
                <h2 className="font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium mb-4">
                  Kontakt
                </h2>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="E-Mail-Adresse"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className={inputClass}
                />
              </section>

              {/* Shipping address */}
              <section>
                <h2 className="font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium mb-4">
                  Lieferadresse
                </h2>
                <SavedAddressSelector onChange={setAddressSelection} />
              </section>

              {/* Payment method */}
              <section>
                <h2 className="font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium mb-4">
                  Zahlungsmethode
                </h2>
                <div className="flex flex-col gap-3">
                  {([
                    { id: 'paypal',   label: 'PayPal',      sub: 'Schnell & sicher', icon: (
                      // PayPal: iconic overlapping double-P mark
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6.5 20.5 8 10h5c2 0 3.5 1 3 3.5-.4 2-2 3.5-4 3.5H10l-1 7.5" />
                        <path d="M9.5 13.5h1c2 0 4-1.5 4.5-4C15.5 7 14 5.5 12 5.5H8L6.5 14" />
                      </svg>
                    )},
                    { id: 'applepay', label: 'Apple Pay',   sub: 'Mit Face ID & Touch ID', icon: (
                      // Apple Pay: Apple logo silhouette — leaf + apple body with bite
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 6.5c.6-1.2 1.8-2 3-2-.1 1.2-.7 2.2-1.5 2.8-.8.6-1.9.8-2.8.5" />
                        <path d="M8.5 8.5C7 8.5 5.5 9.5 4.8 11 3.5 13.2 4 17 5.8 19.2c.8 1 1.7 2 3 2 1 0 1.5-.6 2.7-.6 1.2 0 1.7.6 2.7.6 1.3 0 2.2-1 3-2 .6-.8 1-1.7 1.2-2.5-2.4-.9-2.8-4.2-.5-5.5-1-1.7-2.7-2.7-4.4-2.7-1.2 0-2 .5-3 .5z" />
                      </svg>
                    )},
                    { id: 'klarna',   label: 'Klarna',      sub: 'Jetzt kaufen, später zahlen', icon: (
                      // Klarna: the brand's distinctive K mark with dot
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="9" y1="4" x2="9" y2="20" />
                        <path d="M9 12.5 L15.5 4" />
                        <path d="M9 12.5 L15.5 20" />
                        <circle cx="18" cy="19.5" r="1.2" fill="currentColor" stroke="none" />
                      </svg>
                    )},
                    { id: 'card',     label: 'Kreditkarte', sub: 'Visa & Mastercard', icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <path d="M2 10h20" />
                        <path d="M6 14h4" />
                      </svg>
                    )},
                  ] as const).map(({ id, label, sub, icon }) => {
                    const selected = paymentMethod === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        className="flex items-center gap-4 px-4 py-3.5 border text-left transition-colors duration-200"
                        style={{
                          borderColor: selected ? '#370E4D' : '#E8E8E8',
                          backgroundColor: selected ? 'rgba(55,14,77,0.04)' : '#ffffff',
                        }}
                      >
                        <span style={{ color: selected ? '#370E4D' : '#6B6B6B', flexShrink: 0 }}>{icon}</span>
                        <span className="flex-1">
                          <span className="block font-league-spartan text-sm text-enunas-black">{label}</span>
                          <span className="block font-league-spartan text-[11px] text-enunas-gray-medium mt-0.5">{sub}</span>
                        </span>
                        <span
                          className="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                          style={{ borderColor: selected ? '#370E4D' : '#E8E8E8', backgroundColor: selected ? '#370E4D' : 'transparent' }}
                        >
                          {selected && (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path d="M1.5 4L3 5.5L6.5 2" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Error */}
              {error && (
                <p className="font-league-spartan text-xs text-enunas-error">{error}</p>
              )}

              {/* Submit */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || !addressSelection}
                  className="group relative w-full overflow-hidden bg-enunas-purple text-white py-5 hover:bg-enunas-purple-dark transition-colors duration-300 ease-out-expo disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {/* Diagonal shimmer sweep */}
                  <span
                    className="absolute top-0 h-full w-[40%] -skew-x-12 left-[-60%] group-hover:left-[120%] transition-[left] duration-700 ease-out-expo pointer-events-none"
                    style={{ background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.2), transparent)' }}
                    aria-hidden
                  />
                  <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
                  <span className="relative z-10 font-cormorant text-[20px] tracking-[0.06em]">{loading ? 'Bitte warten…' : 'Zur Zahlung'}</span>
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
                </button>

                <p className="font-league-spartan text-[10px] text-enunas-gray-medium text-center leading-relaxed">
                  Mit Ihrer Bestellung stimmen Sie unseren{' '}
                  <Link href="/agbs" className="underline hover:no-underline">AGB</Link>
                  {' '}und der{' '}
                  <Link href="/datenschutzerklärung" className="underline hover:no-underline">
                    Datenschutzerklärung
                  </Link>{' '}zu.
                </p>
              </div>
            </form>

            {/* ── Right: order summary ─────────────────────── */}
            <aside className="lg:col-span-2">
              <div className="bg-enunas-off-white p-6 sticky top-24">
                <h2 className="font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium mb-6">
                  Bestellübersicht
                </h2>

                {/* Items */}
                <div className="space-y-5 mb-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-3 items-start">
                      <div className="relative w-16 h-20 flex-shrink-0 bg-white border border-enunas-gray-light">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )}
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-enunas-purple text-white text-[10px] flex items-center justify-center leading-none">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-league-spartan text-[10px] text-enunas-gray-medium uppercase tracking-[0.05em] mb-0.5">
                          {item.brand}
                        </p>
                        <p className="font-league-spartan text-xs text-enunas-black leading-snug">
                          {item.name}
                        </p>
                        <p className="font-league-spartan text-[10px] text-enunas-gray-medium mt-1">
                          Größe: {item.size}
                          {item.color && ` · ${item.color.name}`}
                        </p>
                      </div>
                      <p className="font-league-spartan text-xs text-enunas-black flex-shrink-0">
                        €{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-enunas-gray-light pt-4 space-y-2">
                  <div className="flex justify-between font-league-spartan text-xs text-enunas-gray-medium">
                    <span>Zwischensumme</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-league-spartan text-xs text-enunas-gray-medium">
                    <span>Versand</span>
                    <span>{shippingCost === 0 ? 'Kostenlos' : `€${shippingCost.toFixed(2)}`}</span>
                  </div>
                  {upsellDiscount > 0 && (
                    <div className="flex justify-between font-league-spartan text-xs text-enunas-success">
                      <span>Enunas-Vorteil (−10&nbsp;%)</span>
                      <span>−€{upsellDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-league-spartan text-sm text-enunas-black pt-3 border-t border-enunas-gray-light">
                    <span className="font-medium">Gesamt</span>
                    <span className="font-medium">€{finalTotal.toFixed(2)}</span>
                  </div>
                  <p className="font-league-spartan text-[10px] text-enunas-gray-medium">
                    inkl. MwSt.
                  </p>
                </div>

                {/* Coupon code — see handleApplyCoupon above for why this never fabricates a
                    discount preview for codes the frontend can't actually verify. */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2 pt-4 mt-4 border-t border-enunas-gray-light">
                  <input
                    type="text"
                    name="coupon"
                    placeholder="Gutscheincode"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    className="flex-1 min-w-0 border border-enunas-gray-light px-3 py-2.5 font-league-spartan text-xs text-enunas-black bg-white focus:outline-none focus:border-enunas-purple transition-colors duration-200"
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 font-league-spartan text-[11px] uppercase tracking-[0.15em] text-enunas-purple border border-enunas-purple px-4 hover:bg-enunas-purple hover:text-white transition-colors duration-200"
                  >
                    Anwenden
                  </button>
                </form>
                {couponMessage && (
                  <p
                    className={`font-league-spartan text-[11px] mt-2 ${
                      couponMessage.type === 'success' ? 'text-enunas-success' : 'text-enunas-gray-medium'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </div>
            </aside>

          </div>
        </div>
      </div>
      <CartFooter />
    </>
  )
}
