'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import CheckoutAuthGate from './CheckoutAuthGate'

interface CheckoutAuthModalProps {
  open: boolean
  onClose: () => void
}

// Centered variant of the same scrim/dialog pattern the search overlay uses
// (Homepage/components/Searchbar.tsx) — same colors, timing, Escape key and body-scroll-lock
// handling, just a centered card instead of a slide-in side panel. Keeps the sign-in/register
// form feeling like its own dedicated screen without leaving /checkout or losing the cart.
export default function CheckoutAuthModal({ open, onClose }: CheckoutAuthModalProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <>
      {/* Scrim */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{ backdropFilter: 'blur(4px) brightness(0.88)' }}
        className={[
          'fixed inset-0 z-[9998] bg-[rgba(10,8,14,0.35)]',
          'transition-opacity duration-500 ease-out-expo',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Card */}
      <div
        className={[
          'fixed inset-0 z-[9999] flex items-center justify-center p-4',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        ].join(' ')}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Anmeldung"
          className={[
            'relative w-full max-w-md',
            'transition-all duration-500 ease-out-expo',
            open ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          ].join(' ')}
        >
          {/* The icon stays 18px, but the tap target is 44px — the minimum reliable touch size
              (Apple HIG / Material). It used to be `p-1` around the SVG, i.e. 26x26: on a phone a
              near-miss lands on the white card, which does nothing, so the X reads as broken.
              top/right pull back from 4 to 2 so the larger box keeps the same visual position.
              Lives in this outer, non-scrolling wrapper rather than inside the scrollable card
              below — it used to sit inside that scrolling box, so once the card's content grew
              taller than the viewport (a small phone, or the keyboard opening while typing email/
              password — the browser auto-scrolls the focused field into view) the X scrolled
              away with it, off the top, with body scroll locked and nothing left to tap. */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            style={{ touchAction: 'manipulation' }}
            className="absolute top-2 right-2 z-10 flex h-11 w-11 items-center justify-center text-enunas-black hover:text-enunas-purple transition-colors duration-150 ease-out-expo focus:outline-none focus-visible:ring-2 focus-visible:ring-enunas-purple"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <div className="max-h-[90vh] overflow-y-auto bg-white">
            <CheckoutAuthGate onSuccess={onClose} />
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
