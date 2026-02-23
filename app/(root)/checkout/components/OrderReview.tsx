'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/app/context/CartContext'
import { Separator } from '@/components/ui/separator'
import { ShippingData } from './ShippingForm'

type PaymentMethod = 'paypal' | 'stripe' | 'applepay'

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  paypal: 'PayPal',
  stripe: 'Kreditkarte',
  applepay: 'Apple Pay',
}

interface OrderReviewProps {
  shippingData: ShippingData
  paymentMethod: PaymentMethod
  onBack: () => void
}

export default function OrderReview({ shippingData, paymentMethod, onBack }: OrderReviewProps) {
  const { cartItems, totalPrice } = useCart()
  const [success, setSuccess] = useState(false)

  const shippingCost = totalPrice >= 50 ? 0 : 4.99
  const finalTotal = totalPrice + shippingCost

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-enunas-purple flex items-center justify-center mb-6">
          <span className="text-white text-2xl">✓</span>
        </div>
        <h2 className="font-cormorant text-3xl text-enunas-black mb-3">
          Vielen Dank für deine Bestellung!
        </h2>
        <p className="font-league-spartan text-sm text-enunas-gray-medium max-w-sm">
          Wir haben deine Bestellung erhalten und werden sie schnellstmöglich bearbeiten.
          {shippingData.email ? (
            <> Eine Bestätigungsmail wurde an{' '}
              <span className="text-enunas-black">{shippingData.email}</span> gesendet.
            </>
          ) : (
            <> Du erhältst in Kürze eine Bestätigungsmail.</>
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <h2 className="font-cormorant text-2xl text-enunas-black mb-8">Bestellung überprüfen</h2>

      {/* Produktübersicht */}
      <section className="mb-6">
        <h3 className="font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium mb-4">
          Produktübersicht
        </h3>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-[60px] h-[80px] bg-enunas-off-white flex-shrink-0 relative overflow-hidden">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="60px"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-league-spartan text-[10px] uppercase tracking-[0.1em] text-enunas-gray-medium">
                  {item.brand}
                </p>
                <p className="font-cormorant text-base text-enunas-black mt-0.5 leading-tight">
                  {item.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {item.color && (
                    <div
                      className="w-3 h-3 rounded-full border border-enunas-gray-light flex-shrink-0"
                      style={{ backgroundColor: item.color.hex }}
                      title={item.color.name}
                    />
                  )}
                  <p className="font-league-spartan text-xs text-enunas-gray-medium">
                    Gr. {item.size} · {item.quantity}×
                  </p>
                </div>
              </div>
              <p className="font-league-spartan text-sm font-semibold text-enunas-black flex-shrink-0">
                €{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-enunas-gray-light my-6" />

      {/* Versandadresse */}
      <section className="mb-6">
        <h3 className="font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium mb-3">
          Versandadresse
        </h3>
        {shippingData.email && (
          <p className="font-league-spartan text-sm text-enunas-black mb-1">
            {shippingData.email}
          </p>
        )}
        <p className="font-league-spartan text-sm text-enunas-black">
          {shippingData.fullName} · {shippingData.address}, {shippingData.plz} {shippingData.city}, {shippingData.country}
        </p>
        <p className="font-league-spartan text-xs text-enunas-gray-medium mt-1">
          Zahlungsmethode: {PAYMENT_LABELS[paymentMethod]}
        </p>
      </section>

      <Separator className="bg-enunas-gray-light my-6" />

      {/* Preisübersicht */}
      <section className="mb-8">
        <h3 className="font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium mb-4">
          Preisübersicht
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between font-league-spartan text-sm">
            <span className="text-enunas-gray-medium">Zwischensumme</span>
            <span className="text-enunas-black">€{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-league-spartan text-sm">
            <span className="text-enunas-gray-medium">Versand</span>
            <span className="text-enunas-black">
              {shippingCost === 0 ? 'Kostenlos' : `€${shippingCost.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between font-league-spartan text-base font-semibold pt-3 border-t border-enunas-gray-light">
            <span className="text-enunas-black">Gesamt</span>
            <span className="text-enunas-black">€{finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onBack}
          className="sm:w-auto px-8 py-4 font-league-spartan text-sm tracking-[0.15em] uppercase text-enunas-purple border border-enunas-purple hover:bg-enunas-purple hover:text-white transition-colors duration-200 ease-out-expo"
        >
          ← Zurück
        </button>
        <button
          type="button"
          onClick={() => setSuccess(true)}
          className="flex-1 py-4 bg-enunas-purple text-white font-league-spartan text-sm tracking-[0.15em] uppercase hover:bg-enunas-purple-light transition-colors duration-200 ease-out-expo"
        >
          Bestellung aufgeben
        </button>
      </div>
    </div>
  )
}
