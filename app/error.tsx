'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface the error to the console for debugging; wire to error tracking later.
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <p
        className="text-[10px] uppercase tracking-[0.25em] text-enunas-gray-medium mb-6"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        Etwas ist schiefgelaufen
      </p>
      <h1
        className="font-cormorant font-light text-enunas-black mb-6"
        style={{ fontSize: 'clamp(36px, 8vw, 68px)', lineHeight: 1.05 }}
      >
        Ein Fehler ist aufgetreten
      </h1>
      <p className="font-league-spartan text-sm text-enunas-gray-dark max-w-md leading-relaxed mb-10">
        Bitte versuche es erneut. Sollte das Problem bestehen bleiben, lade die Seite neu
        oder kehre zur Startseite zurück.
      </p>
      <div className="flex items-center gap-6">
        <button
          onClick={reset}
          className="font-league-spartan text-[11px] tracking-[0.2em] uppercase bg-enunas-purple text-white px-8 py-4 hover:bg-enunas-purple-light transition-colors duration-200"
        >
          Erneut versuchen
        </button>
        <Link
          href="/"
          className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-black border-b border-enunas-black pb-1 hover:text-enunas-purple hover:border-enunas-purple transition-colors duration-200"
        >
          Zur Startseite →
        </Link>
      </div>
    </main>
  )
}
