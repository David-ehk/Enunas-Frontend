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
            'relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white',
            'transition-all duration-500 ease-out-expo',
            open ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          ].join(' ')}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="absolute top-4 right-4 p-1 text-enunas-black hover:text-enunas-purple transition-colors duration-150 ease-out-expo focus:outline-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <CheckoutAuthGate onSuccess={onClose} />
        </div>
      </div>
    </>,
    document.body
  )
}
