'use client'

import { useEffect, useRef, useState } from 'react'
import { previewReleaseMs, formatReleaseDate } from '@/lib/preview'

interface ComingSoonCountdownProps {
  releaseDate: string
  variant: 'card' | 'pdp'
  onElapsed?: () => void
}

function parts(diff: number) {
  const d = Math.max(0, diff)
  return {
    days: Math.floor(d / 86_400_000),
    hours: Math.floor((d % 86_400_000) / 3_600_000),
    minutes: Math.floor((d % 3_600_000) / 60_000),
    seconds: Math.floor((d % 60_000) / 1000),
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function ComingSoonCountdown({ releaseDate, variant, onElapsed }: ComingSoonCountdownProps) {
  const target = previewReleaseMs(releaseDate)
  const [now, setNow] = useState<number | null>(null) // null until mounted → SSR-safe
  const firedRef = useRef(false)

  useEffect(() => {
    // Deliberate SSR/hydration mount gate: `now` stays null until the client mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (now == null || firedRef.current) return
    if (now >= target) {
      firedRef.current = true
      onElapsed?.()
    }
  }, [now, target, onElapsed])

  // Pre-mount / SSR: render the date only, no ticking digits (avoids hydration mismatch).
  if (now == null) {
    return (
      <span
        className="font-cormorant text-enunas-purple"
        style={{ fontSize: variant === 'pdp' ? 18 : 13, letterSpacing: '0.02em' }}
      >
        Kommt am {formatReleaseDate(releaseDate)}
      </span>
    )
  }

  const { days, hours, minutes, seconds } = parts(target - now)
  const digit = variant === 'pdp' ? 32 : 18
  const label = variant === 'pdp' ? 9 : 7

  const cells: { v: number; u: string }[] = [
    { v: days, u: 'T' },
    { v: hours, u: 'Std' },
    { v: minutes, u: 'Min' },
    { v: seconds, u: 'Sek' },
  ]

  return (
    <div
      className="flex items-baseline"
      style={{ gap: variant === 'pdp' ? 6 : 3 }}
      role="timer"
      aria-label={`Verfügbar am ${formatReleaseDate(releaseDate)}`}
    >
      {cells.map(({ v, u }, i) => (
        <span key={u} className="flex items-baseline" style={{ gap: variant === 'pdp' ? 6 : 3 }}>
          {i > 0 && (
            <span className="text-enunas-gray-light" style={{ fontSize: digit * 0.7, fontWeight: 200 }}>
              :
            </span>
          )}
          <span className="flex items-baseline" style={{ gap: 2 }}>
            <span
              className="font-cormorant text-enunas-purple"
              style={{ fontSize: digit, fontWeight: 300, lineHeight: 1 }}
            >
              {pad(v)}
            </span>
            <span
              className="font-league-spartan text-enunas-purple/60 uppercase"
              style={{ fontSize: label, letterSpacing: '0.12em' }}
            >
              {u}
            </span>
          </span>
        </span>
      ))}
    </div>
  )
}
