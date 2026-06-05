'use client'

import Link from 'next/link'
import CheckoutNavbar from './components/CheckoutNavbar'
import CartFooter from './components/CartFooter'
import { useCart } from '@/app/context/CartContext'
import CartHeader from './components/CartHeader'
import FreeShippingBar from './components/FreeShippingBar'
import CartItemRow from './components/CartItemRow'
import CartSummary from './components/CartSummary'
import EmptyCart from './components/EmptyCart'

export default function CartPage() {
  const { cartItems, itemCount, totalPrice, clearCart } = useCart()

  if (cartItems.length === 0) {
    return (
      <>
        <CheckoutNavbar />
        <div className="min-h-screen bg-white pb-20 px-4 sm:px-8 lg:px-16" style={{ paddingTop: '64px' }}>
          <EmptyCart />
        </div>
        <CartFooter />
      </>
    )
  }

  return (
    <>
      <CheckoutNavbar />

      <div className="min-h-screen bg-white pb-20 px-4 sm:px-8 lg:px-16" style={{ paddingTop: '96px' }}>
        <div className="max-w-[1440px] mx-auto">
          <CartHeader itemCount={itemCount} />

          <FreeShippingBar subtotal={totalPrice} />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-14 items-start">
            <section aria-label="Warenkorb Artikel">
              {cartItems.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}

              <div className="flex justify-between items-center pt-6 flex-wrap gap-3">
                <button
                  onClick={clearCart}
                  className="font-league-spartan text-xs tracking-[0.15em] uppercase text-enunas-black underline underline-offset-4 hover:text-enunas-error transition-colors duration-300"
                >
                  Warenkorb leeren
                </button>
                <Link
                  href="/bekleidung"
                  className="font-league-spartan text-xs tracking-[0.15em] uppercase text-enunas-black underline underline-offset-4 hover:text-enunas-purple transition-colors duration-300"
                >
                  Weiter einkaufen →
                </Link>
              </div>
            </section>

            <CartSummary subtotal={totalPrice} />
          </div>
        </div>
      </div>

      <CartFooter />
    </>
  )
}
