'use client'

import { useMemo } from 'react'
import { Variant, findVariant, sortedSizes } from '../types/product'

interface SizeSelectorProps {
  variants: Variant[]
  selectedColor: string | null
  selectedSize: string | null
  onSizeSelect: (size: string) => void
}

export default function SizeSelector({ variants, selectedColor, selectedSize, onSizeSelect }: SizeSelectorProps) {
  const sizes = useMemo(() => sortedSizes(variants), [variants])

  if (sizes.length === 0) return null

  return (
    <div className="w-full max-w-[460px] mt-[26px] mb-3">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.max(sizes.length, 1)}, 1fr)` }}
      >
        {sizes.map((s) => {
          const v = findVariant(variants, selectedColor, s)
          const isDisabled = !v || v.stockQuantity === 0
          const isSelected = !isDisabled && s === selectedSize

          return (
            <button
              key={s}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onSizeSelect(s)}
              aria-pressed={isSelected}
              className={[
                'py-4 transition-all duration-200',
                'font-league-spartan text-[13px] tracking-[0.06em]',
                isDisabled
                  ? 'text-enunas-gray-medium bg-enunas-off-white border border-enunas-gray-light line-through cursor-not-allowed'
                  : isSelected
                  ? 'bg-white text-enunas-black border-[1.5px] border-enunas-black'
                  : 'bg-white text-enunas-black border border-enunas-gray-light hover:border-enunas-black',
              ].join(' ')}
            >
              {s}
            </button>
          )
        })}
      </div>
    </div>
  )
}
