'use client'

import { useState, useEffect, type RefObject } from 'react'

interface StickyAddToCartProps {
  productName: string
  formattedPrice: string
  selectedSize: string | null
  ctaLabel: string
  isOutOfStock: boolean
  onCta: () => void
  watchRef: RefObject<HTMLButtonElement | null>
}

export default function StickyAddToCart({
  productName,
  formattedPrice,
  selectedSize,
  ctaLabel,
  isOutOfStock,
  onCta,
  watchRef,
}: StickyAddToCartProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      if (!watchRef.current) return
      const ctaGone = watchRef.current.getBoundingClientRect().bottom < 0
      const footer = document.querySelector('footer')
      const footerInView = footer
        ? footer.getBoundingClientRect().top < window.innerHeight
        : false
      setVisible(ctaGone && !footerInView)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    // Run once on mount in case page loads already scrolled
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [watchRef])

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-enunas-gray-light transition-transform duration-500 ease-out-expo"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
      aria-hidden={!visible}
    >
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-4 flex items-center gap-6">
        <div className="flex-1 min-w-0">
          <p
            className="text-sm text-enunas-black truncate"
            style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
          >
            {productName}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            <span
              className="text-xs text-enunas-gray-dark"
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              {formattedPrice}
            </span>
            {selectedSize && (
              <span
                className="text-[10px] text-enunas-gray-medium uppercase tracking-[0.1em]"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                Größe: {selectedSize}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onCta}
          disabled={isOutOfStock}
          className="group relative overflow-hidden px-10 py-3.5 bg-enunas-purple text-white hover:bg-enunas-purple-dark transition-colors duration-300 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            fontFamily: 'var(--font-Cormorant-Garamond)',
            fontSize: '18px',
            letterSpacing: '0.06em',
          }}
        >
          <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
          <span className="relative z-10">{ctaLabel}</span>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
        </button>
      </div>
    </div>
  )
}
