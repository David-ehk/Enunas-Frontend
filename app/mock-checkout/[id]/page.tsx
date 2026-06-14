'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// This route exists only for local E2E testing with the mock-payments Spring profile.
// MockPaymentService returns "http://localhost:3000/mock-checkout/{id}" as the checkout URL.
// The mock fires the paid webhook synchronously inside POST /orders, so by the time the
// browser lands here the order is already PAID — just redirect to the account page.
export default function MockCheckoutPage() {
  const router = useRouter()

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      router.replace('/')
      return
    }
    const t = setTimeout(() => router.replace('/account'), 1500)
    return () => clearTimeout(t)
  }, [router])

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-enunas-off-white">
      <div className="text-center p-12">
        <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-4">
          Mock-Zahlung
        </p>
        <h1 className="font-cormorant text-3xl text-enunas-black mb-3">
          Zahlung verarbeitet
        </h1>
        <p className="font-league-spartan text-sm text-enunas-gray-medium">
          Weiterleitung zu deinen Bestellungen …
        </p>
      </div>
    </div>
  )
}
