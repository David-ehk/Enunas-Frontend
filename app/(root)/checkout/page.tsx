'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import CheckoutNavbar from './components/CheckoutNavbar'
import CartFooter from './components/CheckoutFooter'
import { useCart } from '@/app/context/CartContext'
import CheckoutProgress from './components/CheckoutProgress'
import ShippingForm, { ShippingData } from './components/ShippingForm'
import PaymentView from './components/PaymentView'
import OrderReview from './components/OrderReview'

type PaymentMethod = 'paypal' | 'stripe' | 'applepay'

const EMPTY_SHIPPING: ShippingData = {
  fullName: '',
  address: '',
  plz: '',
  city: '',
  country: '',
}

export default function CheckoutPage() {
  const { cartItems, totalPrice } = useCart()
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [shippingData, setShippingData] = useState<ShippingData>(EMPTY_SHIPPING)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)

  const shippingCost = totalPrice >= 50 ? 0 : 4.99
  const finalTotal = totalPrice + shippingCost

  const handleShippingNext = (data: ShippingData) => {
    setShippingData(data)
    setCurrentStep(2)
  }

  const handlePaymentNext = () => {
    setCurrentStep(3)
  }

  return (
    <>
      <CheckoutNavbar />
      <main className="min-h-screen pt-24 pb-20 px-4 sm:px-8 lg:px-16 bg-enunas-white">
        <div className="max-w-6xl mx-auto">
          {/* Page title */}
          <div className="text-center mb-10">
            <h1 className="font-cormorant text-4xl text-enunas-black">Kasse</h1>
          </div>

          {/* Progress indicator */}
          <CheckoutProgress currentStep={currentStep} />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 items-start">
            {/* Left: active step */}
            <div className="bg-white p-8 border border-enunas-gray-light">
              {currentStep === 1 && (
                <ShippingForm
                  initialData={shippingData}
                  onNext={handleShippingNext}
                />
              )}
              {currentStep === 2 && (
                <PaymentView
                  selected={paymentMethod}
                  onSelect={(m) => setPaymentMethod(m)}
                  onNext={handlePaymentNext}
                  onBack={() => setCurrentStep(1)}
                />
              )}
              {currentStep === 3 && paymentMethod && (
                <OrderReview
                  shippingData={shippingData}
                  paymentMethod={paymentMethod}
                  onBack={() => setCurrentStep(2)}
                />
              )}
            </div>

            {/* Right: mini order summary */}
            <div className="bg-enunas-off-white p-6 border border-enunas-gray-light sticky top-28">
              <h2 className="font-league-spartan text-xs uppercase tracking-[0.2em] text-enunas-gray-medium mb-5">
                Deine Bestellung
              </h2>

              {cartItems.length === 0 ? (
                <p className="font-league-spartan text-sm text-enunas-gray-medium">
                  Dein Warenkorb ist leer.{' '}
                  <Link href="/bekleidung" className="underline">
                    Weiter einkaufen
                  </Link>
                </p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-16 bg-white flex-shrink-0 relative overflow-hidden">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-league-spartan text-[10px] uppercase tracking-[0.1em] text-enunas-gray-medium">
                            {item.brand}
                          </p>
                          <p className="font-cormorant text-sm text-enunas-black leading-tight">
                            {item.name}
                          </p>
                          <p className="font-league-spartan text-[11px] text-enunas-gray-medium mt-0.5">
                            Gr. {item.size} · {item.quantity}×
                          </p>
                        </div>
                        <p className="font-league-spartan text-xs font-semibold text-enunas-black flex-shrink-0">
                          €{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-enunas-gray-light pt-4 space-y-2">
                    <div className="flex justify-between font-league-spartan text-xs text-enunas-gray-medium">
                      <span>Zwischensumme</span>
                      <span>€{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-league-spartan text-xs text-enunas-gray-medium">
                      <span>Versand</span>
                      <span>{shippingCost === 0 ? 'Kostenlos' : `€${shippingCost.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between font-league-spartan text-sm font-semibold text-enunas-black pt-2 border-t border-enunas-gray-light">
                      <span>Gesamt</span>
                      <span>€{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <CartFooter />
    </>
  )
}
