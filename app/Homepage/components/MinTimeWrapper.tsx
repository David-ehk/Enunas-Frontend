// ==========================================
// LÖSUNG 1: CartProvider in MinTimeWrapper (EMPFOHLEN)
// ==========================================
// MinTimeWrapper.tsx

'use client'
import { ReactNode, useEffect, useState } from 'react'
import { CartProvider } from '@/app/context/CartContext'
import CartSidebar from '@/app/(root)/cart/components/CartSidebar'

export default function MinTimeWrapper({
  navbar, 
  children, 
  footer
}: { 
  navbar?: ReactNode
  children: React.ReactNode
  footer?: ReactNode
}) {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 500)
    return () => clearTimeout(timer)
  }, [])

  if (!minTimeElapsed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F5F0] z-100">
        <div className="">
          <h3 className="text-7xl text-black font-semibold">Enunas</h3>
        </div>
      </div>
    )
  }

  return (
    <CartProvider>
      {navbar}
      {children}
      {footer}
      <CartSidebar />
    </CartProvider>
  )
}