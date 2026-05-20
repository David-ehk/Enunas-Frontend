'use client'

import { formatEuro } from '@/lib/format'
import { FREE_SHIPPING_THRESHOLD } from '../constants'

interface FreeShippingBarProps {
  subtotal: number;
}

export default function FreeShippingBar({ subtotal }: FreeShippingBarProps) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  const reached = remaining === 0

  return (
    <div className="bg-enunas-off-white p-5 lg:p-6 mb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
        {reached ? (
          <p className="font-league-spartan text-xs tracking-[0.15em] uppercase text-enunas-success font-semibold">
            Kostenloser Versand freigeschaltet
          </p>
        ) : (
          <p className="font-league-spartan text-xs tracking-[0.15em] uppercase text-enunas-gray-dark">
            Noch <span className="font-semibold text-enunas-black">{formatEuro(remaining)}</span> bis kostenloser Versand
          </p>
        )}
        <p className="font-league-spartan text-xs text-enunas-gray-medium">
          {formatEuro(subtotal)} / {formatEuro(FREE_SHIPPING_THRESHOLD)}
        </p>
      </div>

      <div
        className="relative h-[3px] bg-enunas-gray-light overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="absolute inset-y-0 left-0 bg-enunas-purple transition-all duration-700 ease-out-expo"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
