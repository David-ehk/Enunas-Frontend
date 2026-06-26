'use client'

import { useEffect } from 'react'

// global-error replaces the root layout when an error is thrown in it, so it must render
// its own <html>/<body>. Inline styles only — the app's CSS/fonts aren't guaranteed here.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 24px',
          background: '#FFFFFF',
          color: '#0A0A0A',
          fontFamily: "'League Spartan', system-ui, sans-serif",
        }}
      >
        <p style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#6B6B6B', marginBottom: 24 }}>
          Schwerwiegender Fehler
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, fontSize: 'clamp(36px, 8vw, 68px)', lineHeight: 1.05, margin: '0 0 24px' }}>
          Ein unerwarteter Fehler ist aufgetreten
        </h1>
        <p style={{ fontSize: 14, color: '#2D2D2D', maxWidth: 420, lineHeight: 1.6, marginBottom: 40 }}>
          Bitte lade die Seite neu. Wir arbeiten daran, dass dies nicht erneut passiert.
        </p>
        <button
          onClick={reset}
          style={{
            fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
            background: '#370E4D', color: '#fff', border: 'none',
            padding: '16px 32px', cursor: 'pointer',
          }}
        >
          Erneut versuchen
        </button>
      </body>
    </html>
  )
}
