'use client'

import { useState, useEffect, type RefObject } from 'react'
import { useBottomBarGlass } from '@/hooks/use-bottom-bar-glass'

interface StickyAddToCartProps {
  productName: string
  formattedPrice: string
  selectedSize: string | null
  ctaLabel: string
  isOutOfStock: boolean
  /** Preview ("Coming Soon") CTA: clickable (opens the countdown note) but visually muted. */
  ctaMuted?: boolean
  onCta: () => void
  watchRef: RefObject<HTMLButtonElement | null>
  /** Phones: the same row as part of the page, on screen from the start. */
  inline?: boolean
  /** Fades the inline row out. It keeps its space, so nothing below it moves. */
  dismissed?: boolean
}

export default function StickyAddToCart({
  productName,
  formattedPrice,
  selectedSize,
  ctaLabel,
  isOutOfStock,
  ctaMuted = false,
  onCta,
  watchRef,
  inline = false,
  dismissed = false,
}: StickyAddToCartProps) {
  const [visible, setVisible] = useState(false)
  const glass = useBottomBarGlass()

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
      className={inline
        ? `md:hidden border-b border-enunas-gray-light transition-[opacity,visibility] duration-300 ease-out-expo ${dismissed ? 'invisible opacity-0' : ''}`
        : `${glass} fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-enunas-gray-light`}
      style={inline ? undefined : {
        transform: visible ? 'translateY(0)' : 'translateY(calc(100% + env(safe-area-inset-bottom)))',
        visibility: visible ? 'visible' : 'hidden',
        pointerEvents: visible ? 'auto' : 'none',
        // Hide only after the slide-out finishes, so the exit animation still plays.
        transition: `transform 500ms var(--ease-out-expo), visibility 0s ${visible ? '0s' : '500ms'}`,
      }}
      aria-hidden={inline ? dismissed : !visible}
    >
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-4 flex items-center gap-3 sm:gap-6">
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
          className={`group relative overflow-hidden shrink-0 px-6 sm:px-10 py-3 sm:py-3.5 bg-enunas-purple text-white transition-[background-color,opacity] duration-300 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed ${ctaMuted ? 'opacity-60' : 'hover:bg-enunas-purple-dark'}`}
          style={{
            fontFamily: 'var(--font-Cormorant-Garamond)',
            fontSize: 'clamp(14px, 3.6vw, 18px)',
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
