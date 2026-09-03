'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/app/context/CartContext'
import { useAuth } from '@/app/context/AuthContext'
import CheckoutNavbar from '@/app/(root)/cart/components/CheckoutNavbar'
import CartFooter from '@/app/(root)/cart/components/CartFooter'
import CheckoutAuthModal from './components/CheckoutAuthModal'
import SavedAddressSelector from './components/SavedAddressSelector'
import { orderApi, FetchError, type CreateOrderDto, type OrderPreviewResponseDto } from '@/lib/api'
import { calcShipping, calcFinalTotal } from '@/lib/pricing'
import { UPSELL_CODE_STORAGE_KEY } from '@/lib/featureFlags'
import { toShippingAddressDto, type AddressSelection } from '@/lib/address'

const SHIPPING_METHOD_LABEL: Record<OrderPreviewResponseDto['shippingBreakdown'][number]['calculationMethod'], string> = {
  GLOBAL_DEFAULT: 'Standard',
  BRAND_FLAT_RATE: 'Pauschale',
  BRAND_FREE_SHIPPING: 'Kostenlos',
}

export default function CheckoutPage() {
  const { cartItems, itemCount, totalPrice, clearCart } = useCart()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()

  // Client-side estimate — shown instantly, before a shipping address exists to price against.
  // Superseded by the live `preview` below the moment the backend can actually answer.
  const shippingCost = calcShipping(totalPrice)

  const [email, setEmail] = useState(user?.email ?? '')
  const [addressSelection, setAddressSelection] = useState<AddressSelection | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'applepay' | 'klarna' | 'card'>('paypal')
  const [promoCode, setPromoCode] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [preview, setPreview] = useState<OrderPreviewResponseDto | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [focusCouponSignal, setFocusCouponSignal] = useState(0)
  const [openAddressFormSignal, setOpenAddressFormSignal] = useState(0)
  const couponInputRef = useRef<HTMLInputElement>(null)
  const signInNoticeRef = useRef<HTMLDivElement>(null)
  const addressSectionRef = useRef<HTMLElement>(null)

  // FUTURE (upsell): the confirmation-page upsell used to hand a code to the checkout through
  // localStorage, and this auto-applied it. Removed for launch — the feature is not ready, and the
  // key was only cleared after a *successful* order, so anyone who opened /angebot and abandoned
  // kept a silent 10% off every later checkout: it survived logout and even a different account
  // signing in on the same browser. Nothing reads the key now, so any left over in a visitor's
  // browser is inert. Restore this together with the promo page, and give the code an expiry.
  //
  // useEffect(() => {
  //   const upsellCode = localStorage.getItem(UPSELL_CODE_STORAGE_KEY)
  //   if (upsellCode) setPromoCode(upsellCode)
  // }, [])
  //
  // One-off cleanup so a code stranded by the old behaviour cannot come back if the block above
  // is ever re-enabled. Safe to delete once enough time has passed.
  useEffect(() => {
    localStorage.removeItem(UPSELL_CODE_STORAGE_KEY)
  }, [])

  // Keeps the visible input in sync when a code was auto-applied above, without fighting the
  // user's own typing — this only fires when promoCode itself changes, not on every render.
  useEffect(() => {
    if (promoCode) setCouponInput(promoCode)
  }, [promoCode])

  useEffect(() => {
    if (user?.email) setEmail(user.email)
  }, [user?.email])

  // FUTURE (upsell): UPSELL10 was the one code recognised client-side, for instant feedback before
  // the server preview came back. With the feature off nothing should promise a discount the
  // backend has not confirmed, so the local estimate is always 0 and `preview.discountAmount`
  // (the real, server-priced answer) is the only thing that can discount an order.
  // const upsellDiscount = calcUpsellDiscount(totalPrice, promoCode)
  const upsellDiscount = 0
  const finalTotal = calcFinalTotal(totalPrice, shippingCost, upsellDiscount)

  // POST /orders/preview runs the exact same pricing pipeline as order creation, so once an
  // address is on file this is the authoritative source for shipping/discount/total — it
  // supersedes the client-side estimates above. UPSELL10 still gets instant local feedback
  // on apply (below) since that one code is recognized client-side too, but the preview
  // response is what actually confirms or corrects it, including surfacing a real error for
  // an invalid/expired/exhausted code instead of silently falling back to an undiscounted total.
  useEffect(() => {
    if (!addressSelection || cartItems.length === 0 || cartItems.some((item) => !item.defaultListingId)) {
      setPreview(null)
      return
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      setPreviewLoading(true)
      try {
        const body: CreateOrderDto = {
          items: cartItems.map((item) => ({
            listingId: Number(item.defaultListingId!),
            quantity: item.quantity,
          })),
          ...(addressSelection.mode === 'saved'
            ? { savedAddressId: addressSelection.id }
            : { shippingAddress: toShippingAddressDto(addressSelection.address) }),
          discountCode: promoCode.trim() || undefined,
        }
        const res = await orderApi.preview(body)
        if (cancelled) return
        setPreview(res)
        if (promoCode.trim()) {
          setCouponMessage(
            res.discountAmount
              ? { type: 'success', text: `✓ Rabatt angewendet (−€${res.discountAmount.toFixed(2)})` }
              : { type: 'info', text: 'Für diesen Code gilt kein Rabatt.' }
          )
        }
      } catch (err) {
        if (cancelled) return
        setPreview(null)
        if (promoCode.trim()) {
          setCouponMessage({
            type: 'info',
            text: err instanceof FetchError ? err.message : 'Gutscheincode konnte nicht geprüft werden.',
          })
        }
      } finally {
        if (!cancelled) setPreviewLoading(false)
      }
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // cartItems is compared by identity via CartContext's own state updates (add/remove/qty
    // change all produce a new array), so it's safe to depend on directly here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, addressSelection, promoCode])

  const displaySubtotal = preview?.subtotal ?? totalPrice
  const displayShippingTotal = preview?.shippingTotal ?? shippingCost
  const displayDiscount = preview?.discountAmount ?? upsellDiscount
  const displayTotal = preview?.total ?? finalTotal

  // "Rabatt hinzufügen" opens the (possibly still-collapsed) order summary accordion and jumps
  // straight to the coupon field — the signal counter (rather than watching summaryOpen itself)
  // means clicking it again while already open still re-focuses/re-scrolls, and the effect only
  // ever runs after the coupon input has actually mounted for this click.
  function handleAddDiscountClick() {
    setSummaryOpen(true)
    setFocusCouponSignal((s) => s + 1)
  }

  useEffect(() => {
    if (focusCouponSignal === 0) return
    const frame = requestAnimationFrame(() => {
      couponInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      couponInputRef.current?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [focusCouponSignal])

  function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault()
    const code = couponInput.trim()
    setPromoCode(code)
    if (!code) {
      setCouponMessage(null)
    } else if (addressSelection) {
      // The preview effect above re-runs on this promoCode change and will replace this with
      // the backend-confirmed result (success, no-discount, or a real invalid-code error).
      setCouponMessage({ type: 'info', text: 'Wird geprüft…' })
      // FUTURE (upsell): with no address there is no preview call, and UPSELL10 used to be
      // confirmed client-side here. Removed for launch — claiming "Rabatt angewendet" for a code
      // the server has not accepted is exactly the promise we cannot keep yet.
      // } else if (calcUpsellDiscount(totalPrice, code) > 0) {
      //   setCouponMessage({ type: 'success', text: '✓ Rabatt angewendet' })
    } else {
      setCouponMessage({ type: 'info', text: 'Wird bei der Bestellung geprüft.' })
    }
  }

  // Fires on the submit buttons' own click, ahead of the browser's native constraint validation
  // (Kontakt's e-mail field is genuinely `required` and must stay that way — see CheckoutAddressForm
  // for why the address fields underneath deliberately are not). Without this, an unauthenticated
  // guest who also hasn't typed an e-mail yet would get the browser's native "fill this field"
  // tooltip on Kontakt instead of being sent to the sign-in notice — auth has to win first,
  // regardless of what's filled in below it. Native validation (and, after that, the address
  // check in handleSubmit) only gets a chance to run once this lets the click through.
  function handleSubmitClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (!isAuthenticated) {
      e.preventDefault()
      setError('Bitte melden Sie sich an, um fortzufahren.')
      signInNoticeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isAuthenticated) {
      setError('Bitte melden Sie sich an, um fortzufahren.')
      signInNoticeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!addressSelection) {
      setError('Bitte wähle oder gib eine Lieferadresse ein.')
      addressSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setOpenAddressFormSignal((s) => s + 1)
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

      // (The upsell code is cleared on mount now, not only here — see the FUTURE note above.)
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

  // Not passed to the submit button's `disabled` attribute — a natively disabled button never
  // fires a click, so it couldn't scroll to the reason. Instead it only greys the button out
  // visually; the real gate (and the scroll-to-reason) lives in handleSubmit above.
  const checkoutBlocked = !isAuthenticated || !addressSelection
  const submitButtonClass =
    'group relative w-full overflow-hidden bg-enunas-purple text-white py-5 transition-colors duration-300 ease-out-expo' +
    (loading || checkoutBlocked ? ' opacity-60 cursor-not-allowed' : ' hover:bg-enunas-purple-dark')

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

  // Waits for the auth check to resolve first so an actually-logged-in visitor never flashes a
  // sign-in prompt they don't need.
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

  // Order creation still requires an authenticated user (guarded in handleSubmit below), but the
  // page itself is never gated behind a full-screen sign-in wall — a guest should see the same
  // order summary, address entry and payment options everyone else does, and only discover they
  // need to sign in via the notice at the top, not by being blocked outright. Cart items already
  // live in CartContext/localStorage, so nothing is lost while they log in or register inline.
  return (
    <>
      <CheckoutNavbar />
      {/* CheckoutNavbar is fixed and renders at 49px tall (py-2 + its text-2xl logo line +
          border-b) — this padding-top has to clear that or the breadcrumb below sits under it. */}
      <div className="min-h-screen pb-20 px-4 sm:px-8 lg:px-16 bg-white" style={{ paddingTop: '60px' }}>
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

          {/* Non-blocking sign-in notice — guests see the full checkout page (summary, address,
              payment) below just like everyone else, and only discover here that placing the
              order needs an account, instead of being walled off from the page outright. The
              actual sign-in/register form opens in CheckoutAuthModal, not inline. */}
          {!isAuthenticated && (
            <div ref={signInNoticeRef} className="mb-10 flex items-center gap-3 border-l-2 border-enunas-purple bg-enunas-purple-muted px-4 py-2.5">
              <p className="font-league-spartan text-[11px] text-enunas-black">
                Für die Bestellung ist eine Anmeldung erforderlich.
              </p>
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="flex-shrink-0 font-league-spartan text-[11px] uppercase tracking-[0.15em] text-enunas-purple underline hover:no-underline transition-colors duration-200"
              >
                Jetzt anmelden
              </button>
            </div>
          )}

          <CheckoutAuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">

            {/* ── Left: form ──────────────────────────────── */}
            <form id="checkout-form" onSubmit={handleSubmit} className="lg:col-span-3 space-y-10">

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
              <section ref={addressSectionRef}>
                <h2 className="font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium mb-4">
                  Lieferadresse
                </h2>
                <SavedAddressSelector
                  onChange={setAddressSelection}
                  isAuthenticated={isAuthenticated}
                  openFormSignal={openAddressFormSignal}
                />
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

              {/* Submit — hidden here on mobile/tablet; a duplicate below the order summary
                  (same form via the `form` attribute) takes over there instead, so the summary
                  a visitor is actually paying attention to comes before the button that commits
                  to it. Desktop keeps it right where the form naturally ends. */}
              <div className="hidden lg:block space-y-3">
                <button
                  type="submit"
                  onClick={handleSubmitClick}
                  disabled={loading}
                  className={submitButtonClass}
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

            {/* ── Right: order summary ──────────────────────
                Accordion (collapsed-by-default, toggle button) is phone-only (<md). From md
                up (tablet + desktop) the full summary is always shown, no toggle at all. */}
            <aside className="lg:col-span-2">
              <div className="lg:sticky lg:top-24">

                {/* Rabatt hinzufügen — standalone button above the summary block; opens the
                    accordion (if collapsed) and jumps straight to the Gutscheincode field below.
                    Phone-only (<md) — from md up the summary (and its Gutscheincode field) is
                    always expanded already, so this shortcut has nothing to do. */}
                <button
                  type="button"
                  onClick={handleAddDiscountClick}
                  className="md:hidden w-full flex items-center justify-center gap-1.5 font-league-spartan text-[11px] uppercase tracking-[0.15em] text-enunas-purple border border-enunas-purple py-3 mb-4 hover:bg-enunas-purple hover:text-white transition-colors duration-200"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Rabatt hinzufügen
                </button>

                <div className="bg-enunas-off-white p-6">

                {/* Collapsed state — phone only, and only while closed. This is the entire
                    collapsed view; the full breakdown below replaces it once opened instead of
                    sitting alongside it, so the total isn't shown twice at once. */}
                {!summaryOpen && (
                  <button
                    type="button"
                    onClick={() => setSummaryOpen(true)}
                    aria-expanded={false}
                    className="md:hidden w-full flex items-center justify-between gap-4"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="relative w-12 h-14 flex-shrink-0 bg-white border border-enunas-gray-light">
                        {cartItems[0]?.image && (
                          <Image src={cartItems[0].image} alt={cartItems[0].name} fill className="object-cover" />
                        )}
                      </span>
                      <span className="font-league-spartan text-xs text-enunas-gray-medium text-left">
                        {itemCount} {itemCount === 1 ? 'Artikel' : 'Artikel'}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-league-spartan text-sm text-enunas-black font-medium">
                        €{displayTotal.toFixed(2)}
                      </span>
                      <svg
                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        className="text-enunas-gray-medium"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </button>
                )}

                {/* Full breakdown — open on phone (toggle to collapse again), always on
                    tablet/desktop (md+) regardless of summaryOpen. */}
                <div className={`${summaryOpen ? 'block' : 'hidden'} md:block animate-fade-in`}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium">
                        Bestellübersicht
                      </h2>
                      <button
                        type="button"
                        onClick={() => setSummaryOpen(false)}
                        aria-label="Bestellübersicht einklappen"
                        className="md:hidden text-enunas-gray-medium hover:text-enunas-black transition-colors duration-200"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-180">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </div>

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

                    {/* Totals — once `preview` has loaded (POST /orders/preview, requires a
                        chosen shipping address) these are the backend-authoritative numbers,
                        guaranteed to match what order creation actually charges. Until then,
                        the client-side estimate from lib/pricing.ts is shown instead. */}
                    <div className="border-t border-enunas-gray-light pt-4 space-y-2">
                      <div className="flex justify-between font-league-spartan text-xs text-enunas-gray-medium">
                        <span>Zwischensumme</span>
                        <span>€{displaySubtotal.toFixed(2)}</span>
                      </div>

                      {preview?.shippingBreakdown && preview.shippingBreakdown.length > 0 ? (
                        preview.shippingBreakdown.map((line) => (
                          <div key={line.brandId} className="flex justify-between font-league-spartan text-xs text-enunas-gray-medium">
                            <span>
                              Versand — {line.brandName}
                              <span className="text-enunas-gray-medium/70"> · {SHIPPING_METHOD_LABEL[line.calculationMethod]}</span>
                            </span>
                            <span>{line.amount === 0 ? 'Kostenlos' : `€${line.amount.toFixed(2)}`}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex justify-between font-league-spartan text-xs text-enunas-gray-medium">
                          <span>Versand{previewLoading ? ' …' : ''}</span>
                          <span>{displayShippingTotal === 0 ? 'Kostenlos' : `€${displayShippingTotal.toFixed(2)}`}</span>
                        </div>
                      )}

                      {displayDiscount > 0 && (
                        <div className="flex justify-between font-league-spartan text-xs text-enunas-success">
                          <span>{preview?.discountCode ? `Rabatt (${preview.discountCode})` : 'Rabatt'}</span>
                          <span>−€{displayDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-league-spartan text-sm text-enunas-black pt-3 border-t border-enunas-gray-light">
                        <span className="font-medium">Gesamt</span>
                        <span className="font-medium">€{displayTotal.toFixed(2)}</span>
                      </div>
                      <p className="font-league-spartan text-[10px] text-enunas-gray-medium">
                        inkl. MwSt.
                      </p>
                    </div>

                    {/* Coupon code — applying it re-runs the preview effect above, which is what
                        actually confirms or rejects the code against the backend. */}
                    <form onSubmit={handleApplyCoupon} className="flex gap-2 pt-4 mt-4 border-t border-enunas-gray-light">
                      <input
                        ref={couponInputRef}
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
                </div>
              </div>
            </aside>

            {/* Submit — mobile/tablet only, right under the order summary above. Targets the
                form by id since it lives outside it here. */}
            <div className="lg:hidden space-y-3">
              <button
                type="submit"
                form="checkout-form"
                onClick={handleSubmitClick}
                disabled={loading}
                className={submitButtonClass}
              >
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

          </div>
        </div>
      </div>
      <CartFooter />
    </>
  )
}
