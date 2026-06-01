'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatEuro } from '@/lib/format'
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST, PAYMENT_BADGES } from '../constants'

interface CartSummaryProps {
  subtotal: number;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      className={cn(
        'flex justify-between font-league-spartan',
        bold ? 'text-base text-enunas-black font-medium' : 'text-sm text-enunas-gray-dark font-normal'
      )}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

export default function CartSummary({ subtotal }: CartSummaryProps) {
  const [promo, setPromo] = useState('')
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST
  const total = subtotal + shipping

  return (
    <aside className="bg-enunas-off-white p-7 lg:p-8 lg:sticky lg:top-28 h-fit">
      <h2 className="font-league-spartan text-[11px] tracking-[0.25em] uppercase text-enunas-gray-medium mb-6">
        Bestellübersicht
      </h2>

      <div className="flex flex-col gap-3 mb-5">
        <Row label="Zwischensumme" value={formatEuro(subtotal)} />
        <Row label="Versand" value={shipping === 0 ? 'Kostenlos' : formatEuro(shipping)} />
        <div className="h-px bg-enunas-gray-light my-1.5" />
        <Row label="Gesamt" value={formatEuro(total)} bold />
      </div>

      {/* Promo code */}
      <div className="flex mb-5">
        <input
          type="text"
          value={promo}
          onChange={(e) => setPromo(e.target.value)}
          placeholder="Promo Code"
          className="flex-1 px-3.5 py-3 border border-enunas-gray-light border-r-0 bg-white font-league-spartan text-xs tracking-[0.05em] focus:outline-none focus:border-enunas-purple transition-colors duration-300"
        />
        <button
          type="button"
          onClick={() => { /* TODO: applyPromo(promo) */ }}
          className="px-4 bg-enunas-black text-white font-league-spartan text-[10px] tracking-[0.2em] uppercase hover:bg-enunas-purple transition-colors duration-300 ease-out-expo"
        >
          Anwenden
        </button>
      </div>

      <Link
        href="/checkout"
        className="group relative block w-full overflow-hidden bg-enunas-purple text-white text-center py-5 hover:bg-enunas-purple-dark transition-colors duration-300 ease-out-expo mb-4"
      >
        <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
        <span className="relative z-10 font-cormorant text-[18px] tracking-[0.06em]">Zur Kasse</span>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
      </Link>

      <p className="font-league-spartan text-[10px] tracking-[0.15em] uppercase text-enunas-gray-medium text-center mt-6 mb-3">
        Sichere Zahlung mit
      </p>
      <div className="flex justify-center gap-2">
        {PAYMENT_BADGES.map((p) => (
          <div
            key={p.code}
            className="px-2.5 py-1.5 bg-white border border-enunas-gray-light font-league-spartan text-[9px] tracking-[0.1em] text-enunas-gray-medium"
            title={p.label}
          >
            {p.code}
          </div>
        ))}
      </div>
    </aside>
  )
}
