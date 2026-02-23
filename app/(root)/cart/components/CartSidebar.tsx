'use client'
import { useState, useEffect } from 'react'
import { useCart } from '@/app/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'

const FREE_SHIPPING_THRESHOLD = 50

export default function CartSidebar() {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    itemCount,
    totalPrice,
    updateQuantity,
    removeFromCart
  } = useCart()
  const [activeTab, setActiveTab] = useState<'cart' | 'wishlist'>('cart')

  const amountUntilFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice)
  const freeShippingProgress = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100)

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isCartOpen])

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[9998] transition-opacity duration-300"
          onClick={closeCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#F5F5F0] z-[9999]
          transform transition-transform duration-300 ease-in-out
          ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header with Tabs */}
        <div className="px-8 pt-6 pb-0 flex-shrink-0">
          <button 
            onClick={closeCart}
            className="absolute top-6 right-6 text-2xl hover:opacity-50 transition-opacity"
          >
            ✕
          </button>
          
          <div className="flex gap-8 border-b border-gray-300">
            <button
              onClick={() => setActiveTab('cart')}
              className={`pb-3 text-sm transition-all ${
                activeTab === 'cart' 
                  ? 'border-b-2 border-black' 
                  : 'text-gray-500'
              }`}
            >
              <h4>Warenkorb</h4>
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`pb-3 text-sm transition-all ${
                activeTab === 'wishlist' 
                  ? 'border-b-2 border-black' 
                  : 'text-gray-500'
              }`}
            >
              <h4>Wunschliste</h4>
            </button>
          </div>
        </div>

        {/* Scrollable Cart Items Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
          {activeTab === 'cart' ? (
            <>
              {cartItems.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-sm">Ihr Warenkorb ist leer</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex gap-4">
                      <div className="w-24 h-32 bg-gray-200 flex-shrink-0 relative">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">{item.brand}</p>
                            <h3 className="text-base font-medium pr-2">
                              {item.name}
                            </h3>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs underline hover:no-underline text-gray-600 flex-shrink-0"
                          >
                            Entfernen
                          </button>
                        </div>

                        {item.color && (
                          <p className="text-xs text-gray-500 mb-1">{item.color.name}</p>
                        )}
                        <p className="text-xs text-gray-500 mb-3">Größe: {item.size}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center border border-gray-300 hover:bg-gray-50"
                            >
                              −
                            </button>
                            <span className="text-sm w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center border border-gray-300 hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm font-semibold">€{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p className="text-sm">Ihre Wunschliste ist leer</p>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-gray-200 px-8 py-6 flex-shrink-0 bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-light">Insgesamt ({itemCount} Artikel)</span>
            <span className="text-lg font-light">€{totalPrice.toFixed(2)}</span>
          </div>

          {cartItems.length === 0 ? (
            <button
              disabled
              className="w-full bg-[#370E4D] text-white py-4 tracking-wide transition-colors mb-3 opacity-50 cursor-not-allowed"
            >
              <h3 className='text-base'>Sicher Zur Kasse</h3>
            </button>
          ) : (
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-[#370E4D] text-white py-4 tracking-wide hover:bg-[#2a0b3b] transition-colors mb-3 text-center"
            >
              <h3 className='text-base'>Sicher Zur Kasse</h3>
            </Link>
          )}

          <button
            onClick={closeCart}
            className="w-full text-center text-xs underline hover:no-underline text-gray-600 mb-5"
          >
            Weiter einkaufen
          </button>

          <div className="pt-5 border-t border-gray-200">
            <div className="mb-2">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#370E4D] rounded-full transition-all"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
            {amountUntilFreeShipping > 0 ? (
              <p className="text-xs text-gray-600">
                Noch <span className="font-semibold">€{amountUntilFreeShipping.toFixed(2)}</span> bis kostenloser Versand
              </p>
            ) : (
              <p className="text-xs text-green-600 font-semibold">
                Kostenloser Versand freigeschaltet!
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}