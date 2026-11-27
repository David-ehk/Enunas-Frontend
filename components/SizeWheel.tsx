'use client'

import { useCallback, useEffect, useRef } from 'react'
import { centredIndex } from '@/lib/sizeWheel'
import { cn } from '@/lib/utils'

const ROW_PX = 48
/** Lets the sheet arrive before the wheel starts to roll. */
const ROLL_DELAY_MS = 350

interface SizeWheelProps {
  label: string
  sizes: { size: string; unavailable: boolean }[]
  index: number
  onIndexChange: (index: number) => void
}

/**
 * A wheel like the iPhone timer: sizes click into the middle row, and the others curve away above
 * and below. It opens by rolling from the first size to the picked one.
 */
export default function SizeWheel({ label, sizes, index, onIndexChange }: SizeWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null)
  // While the opening roll runs, passing sizes are not picked. A finger takes over at once.
  const rolling = useRef(true)
  const target = useRef(index)

  /** Bends each row by its distance from the middle. Written to the DOM: it runs every frame. */
  const paint = useCallback((scrollTop: number) => {
    const rows = wheelRef.current?.querySelectorAll<HTMLElement>('[data-row]') ?? []
    rows.forEach((row, i) => {
      const d = Math.max(-3, Math.min(3, i - scrollTop / ROW_PX))
      const far = Math.abs(d)
      row.style.transform = `perspective(500px) rotateX(${-d * 24}deg) scale(${1 - far * 0.08})`
      row.style.opacity = String(Math.max(0.15, 1 - far * 0.34))
    })
  }, [])

  const rollTo = useCallback((i: number) => {
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    wheelRef.current?.scrollTo?.({ top: i * ROW_PX, behavior: still ? 'auto' : 'smooth' })
  }, [])

  useEffect(() => {
    paint(0)
    const timer = window.setTimeout(() => {
      if (!rolling.current) return
      if (target.current === 0) rolling.current = false
      else rollTo(target.current)
    }, ROLL_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [paint, rollTo])

  const takeOver = () => { rolling.current = false }

  return (
    <div className="relative shrink-0">
      {/* The two hairlines around the picked row. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-24 h-12 border-y border-enunas-black/10" />
      <div
        ref={wheelRef}
        role="group"
        aria-label={label}
        onPointerDown={takeOver}
        onTouchStart={takeOver}
        onWheel={takeOver}
        onKeyDown={takeOver}
        onScroll={e => {
          const top = e.currentTarget.scrollTop
          paint(top)
          if (rolling.current) {
            if (Math.abs(top - target.current * ROW_PX) < 1) rolling.current = false
            return
          }
          const next = centredIndex(top, ROW_PX, sizes.length)
          if (next !== index) onIndexChange(next)
        }}
        // Five rows high; the padding lets the first and last size reach the middle.
        className="size-wheel relative h-60 snap-y snap-mandatory overflow-y-auto overscroll-contain py-24"
      >
        {sizes.map((s, i) => (
          <button
            key={s.size}
            data-row
            type="button"
            disabled={s.unavailable}
            onClick={() => { takeOver(); onIndexChange(i); rollTo(i) }}
            aria-pressed={i === index && !s.unavailable}
            aria-label={s.unavailable ? `${s.size}, ausverkauft` : s.size}
            className={cn(
              'block h-12 w-full snap-center text-lg uppercase tracking-[0.05em] transition-colors duration-200 ease-out-expo',
              i === index ? 'font-semibold text-enunas-purple' : 'text-enunas-black',
              s.unavailable && 'font-normal text-enunas-gray-dark line-through',
            )}
          >
            {s.size}
          </button>
        ))}
      </div>
    </div>
  )
}
