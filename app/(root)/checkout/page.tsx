'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/app/context/CartContext'
import { useAuth } from '@/app/context/AuthContext'
import CheckoutNavbar from '@/app/(root)/cart/components/CheckoutNavbar'
import CartFooter from '@/app/(root)/cart/components/CartFooter'
import { orderApi, authApi, FetchError } from '@/lib/api'

const FREE_SHIPPING_THRESHOLD = 50

interface ShippingForm {
  firstName: string
  lastName: string
  email: string
  street: string
  city: string
  postalCode: string
  country: string
  phone: string
}

const COUNTRIES = [
  { value: 'DE', label: 'Deutschland' },
  { value: 'AT', label: 'Österreich' },
  { value: 'CH', label: 'Schweiz' },
  { value: 'NL', label: 'Niederlande' },
  { value: 'BE', label: 'Belgien' },
  { value: 'FR', label: 'Frankreich' },
]

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart()
  const { isAuthenticated, user, refreshUser } = useAuth()

  const shippingCost = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 4.99

  const [form, setForm] = useState<ShippingForm>({
    firstName: '',
    lastName: '',
    email: user?.email ?? '',
    street: '',
    city: '',
    postalCode: '',
    country: 'DE',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'applepay' | 'klarna' | 'card'>('paypal')
  const [promoCode, setPromoCode] = useState('')

  // Auto-apply discount code passed from the upsell confirmation flow
  useEffect(() => {
    const upsellCode = localStorage.getItem('enunas_upsell_code')
    if (upsellCode) {
      setPromoCode(upsellCode)
    }
  }, [])

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)

  const upsellDiscount = promoCode.trim().toUpperCase() === 'UPSELL10'
    ? Math.round(totalPrice * 0.1 * 100) / 100
    : 0
  const finalTotal = totalPrice + shippingCost - upsellDiscount

  function update(field: keyof ShippingForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleLogin() {
    setLoginError(null)
    setLoginLoading(true)
    try {
      await authApi.login({ email: loginEmail, password: loginPassword })
      await refreshUser()
      setShowLogin(false)
    } catch (err) {
      setLoginError(
        err instanceof FetchError ? err.message : 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Daten.'
      )
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isAuthenticated) {
      setError('Bitte melden Sie sich an, um fortzufahren.')
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

      const order = await orderApi.create({
        items: cartItems.map((item) => ({
          listingId: Number(item.defaultListingId!),
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: `${form.firstName} ${form.lastName}`,
          street: form.street,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
          phone: form.phone || undefined,
        },
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
        <div className="min-h-screen pb-20 flex items-center justify-center px-4" style={{ paddingTop: '64px' }}>
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

  return (
    <>
      <CheckoutNavbar />
      <div className="min-h-screen pb-20 px-4 sm:px-8 lg:px-16 bg-white" style={{ paddingTop: '64px' }}>
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
                {!isAuthenticated && (
                  <div className="bg-enunas-off-white border border-enunas-gray-light mb-4">
                    <button
                      type="button"
                      onClick={() => setShowLogin(v => !v)}
                      className="w-full flex items-center justify-between px-4 py-3 font-league-spartan text-xs text-enunas-gray-dark hover:text-enunas-black transition-colors duration-200"
                    >
                      <span>
                        <span className="text-enunas-purple font-medium">Anmelden</span>
                        {' '}für schnelleres Auschecken
                      </span>
                      <span
                        className="text-enunas-gray-medium transition-transform duration-200"
                        style={{ transform: showLogin ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        aria-hidden
                      >
                        ▾
                      </span>
                    </button>

                    {showLogin && (
                      <div className="px-4 pb-4 space-y-3 border-t border-enunas-gray-light pt-3">
                        <input
                          type="email"
                          placeholder="E-Mail-Adresse"
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                          className={inputClass}
                        />
                        <input
                          type="password"
                          placeholder="Passwort"
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
                          className={inputClass}
                        />
                        {loginError && (
                          <p className="font-league-spartan text-[11px] text-enunas-error">{loginError}</p>
                        )}
                        <button
                          type="button"
                          onClick={handleLogin}
                          disabled={loginLoading}
                          className="group relative w-full overflow-hidden bg-enunas-purple text-white py-3 hover:bg-enunas-purple-dark transition-colors duration-300 ease-out-expo disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
                          <span className="relative z-10 font-cormorant text-[18px] tracking-[0.06em]">{loginLoading ? 'Bitte warten…' : 'Anmelden'}</span>
                          <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <input
                  type="email"
                  placeholder="E-Mail-Adresse"
                  value={form.email}
                  onChange={update('email')}
                  required
                  className={inputClass}
                />
              </section>

              {/* Shipping address */}
              <section>
                <h2 className="font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium mb-4">
                  Lieferadresse
                </h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Vorname"
                      value={form.firstName}
                      onChange={update('firstName')}
                      required
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Nachname"
                      value={form.lastName}
                      onChange={update('lastName')}
                      required
                      className={inputClass}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Straße und Hausnummer"
                    value={form.street}
                    onChange={update('street')}
                    required
                    className={inputClass}
                  />
                  <div className="grid grid-cols-5 gap-3">
                    <input
                      type="text"
                      placeholder="PLZ"
                      value={form.postalCode}
                      onChange={update('postalCode')}
                      required
                      className={`${inputClass} col-span-2`}
                    />
                    <input
                      type="text"
                      placeholder="Stadt"
                      value={form.city}
                      onChange={update('city')}
                      required
                      className={`${inputClass} col-span-3`}
                    />
                  </div>
                  <select
                    value={form.country}
                    onChange={update('country')}
                    className={inputClass}
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="Telefonnummer (optional)"
                    value={form.phone}
                    onChange={update('phone')}
                    className={inputClass}
                  />
                </div>
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
                  disabled={loading || !isAuthenticated}
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

                {!isAuthenticated && (
                  <p className="font-league-spartan text-xs text-enunas-gray-medium text-center">
                    Bitte{' '}
                    <button
                      type="button"
                      onClick={() => { setShowLogin(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      className="text-enunas-purple underline hover:no-underline"
                    >
                      melden Sie sich an
                    </button>
                    , um Ihre Bestellung abzuschließen.
                  </p>
                )}

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

                {/*
                  Promo-code field intentionally removed. The only working code (UPSELL10) is
                  auto-attached invisibly via localStorage on the upsell path. A manual entry
                  field would either be a no-op (the old "Anwenden" TODO) or require validating
                  discount codes client-side — i.e. letting the client decide the price. If a
                  visible promo field is wanted later it must validate against the backend.
                */}
              </div>
            </aside>

          </div>
        </div>
      </div>
      <CartFooter />
    </>
  )
}
