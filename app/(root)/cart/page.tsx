'use client'

import { useCart } from '@/app/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/app/Homepage/components/navbar'
import Footer from '@/app/Homepage/components/footer'
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'

const FREE_SHIPPING_THRESHOLD = 50

export default function CartPage() {
  const {
    cartItems,
    itemCount,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart()

  const amountUntilFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice)
  const freeShippingProgress = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100)
  const shippingCost = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 4.99
  const finalTotal = totalPrice + shippingCost

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16 px-4 sm:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto text-center py-20">
            <ShoppingBag className="w-20 h-20 mx-auto text-gray-300 mb-6" />
            <h1 className="text-3xl font-medium mb-4">Ihr Warenkorb ist leer</h1>
            <p className="text-gray-600 mb-8">
              Entdecken Sie unsere Produkte und finden Sie etwas, das Ihnen gefällt.
            </p>
            <Link
              href="/bekleidung"
              className="inline-block bg-[#370E4D] text-white px-8 py-4 hover:bg-[#2a0b3b] transition-colors"
            >
              Weiter einkaufen
            </Link>
          </div>
        </main>
        <footer className="bg-[#370E4D] w-full px-4 sm:px-8 lg:px-16 pt-12 sm:pt-24 pb-8">
          <Footer />
        </footer>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-medium">Warenkorb ({itemCount} Artikel)</h1>
            <button
              onClick={clearCart}
              className="text-sm text-gray-600 hover:text-black underline"
            >
              Warenkorb leeren
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-gray-50 p-4 mb-8">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#370E4D] rounded-full transition-all"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
            {amountUntilFreeShipping > 0 ? (
              <p className="text-sm text-gray-600">
                Noch <span className="font-semibold">€{amountUntilFreeShipping.toFixed(2)}</span> bis kostenloser Versand
              </p>
            ) : (
              <p className="text-sm text-green-600 font-semibold">
                Kostenloser Versand freigeschaltet!
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 sm:gap-6 p-4 bg-white border border-gray-200"
                >
                  {/* Product Image */}
                  <div className="w-24 h-32 sm:w-32 sm:h-40 bg-gray-100 flex-shrink-0 relative">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{item.brand}</p>
                      <h3 className="text-lg font-medium mb-2">{item.name}</h3>
                      {item.color && (
                        <p className="text-sm text-gray-600 mb-1">
                          Farbe: {item.color.name}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">Größe: {item.size}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-50"
                          aria-label="Menge verringern"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-50"
                          aria-label="Menge erhöhen"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price & Remove */}
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">
                          €{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Artikel entfernen"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 sticky top-24">
                <h2 className="text-xl font-medium mb-6">Bestellübersicht</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Zwischensumme</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Versand</span>
                    <span>{shippingCost === 0 ? 'Kostenlos' : `€${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
                    <span>Gesamt</span>
                    <span>€{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button className="w-full bg-[#370E4D] text-white py-4 hover:bg-[#2a0b3b] transition-colors mb-4">
                  Zur Kasse
                </button>

                <Link
                  href="/bekleidung"
                  className="block text-center text-sm text-gray-600 hover:text-black underline"
                >
                  Weiter einkaufen
                </Link>

                {/* Payment Methods */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center mb-3">
                    Sichere Zahlung mit
                  </p>
                  <div className="flex justify-center gap-2">
                    <div className="w-10 h-6 bg-gray-200 rounded" />
                    <div className="w-10 h-6 bg-gray-200 rounded" />
                    <div className="w-10 h-6 bg-gray-200 rounded" />
                    <div className="w-10 h-6 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-[#370E4D] w-full px-4 sm:px-8 lg:px-16 pt-12 sm:pt-24 pb-8">
        <Footer />
      </footer>
    </>
  )
}
