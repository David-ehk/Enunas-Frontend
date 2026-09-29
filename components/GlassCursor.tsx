'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'

const SIZE = 96
const HALF = SIZE / 2

interface GlassCursorProps {
  /** The element whose hover area gets the cursor (its own native cursor is hidden meanwhile). */
  targetRef: RefObject<HTMLElement | null>
  /** Plus = zoom in, minus = zoom out. */
  mode: 'plus' | 'minus'
}

/**
 * Custom cursor for image galleries: a see-through liquid-glass disc with a plus or minus,
 * following the pointer with a slight lag. Only on devices with a real hover pointer at tablet
 * width and up; everywhere else the native cursor is left untouched.
 */
export default function GlassCursor({ targetRef, mode }: GlassCursorProps) {
  const posRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  // The portal needs `document`, so nothing renders on the server or during hydration.
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return
    const target = targetRef.current
    const pos = posRef.current
    const body = bodyRef.current
    if (!target || !pos || !body) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)').matches) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.dataset.glassCursor = 'on'

    let raf = 0
    let x = 0
    let y = 0
    let tx = 0
    let ty = 0
    let shown = false

    const place = () => {
      pos.style.transform = `translate3d(${x - HALF}px, ${y - HALF}px, 0)`
    }
    const tick = () => {
      x += (tx - x) * (reduced ? 1 : 0.22)
      y += (ty - y) * (reduced ? 1 : 0.22)
      place()
      raf = Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1 ? requestAnimationFrame(tick) : 0
    }
    const show = (visible: boolean) => {
      shown = visible
      body.style.transform = visible ? 'scale(1)' : 'scale(0)'
      body.style.opacity = visible ? '1' : '0'
    }
    const onMove = (e: MouseEvent) => {
      tx = e.clientX
      ty = e.clientY
      if (!shown) {
        x = tx
        y = ty
        place()
        show(true)
      }
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onLeave = () => show(false)

    target.addEventListener('mousemove', onMove)
    target.addEventListener('mouseleave', onLeave)
    return () => {
      target.removeEventListener('mousemove', onMove)
      target.removeEventListener('mouseleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
      delete target.dataset.glassCursor
    }
  }, [targetRef, mounted])

  if (!mounted) return null

  return createPortal(
    <div
      ref={posRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9500]"
      style={{ width: SIZE, height: SIZE, willChange: 'transform' }}
    >
      <div
        ref={bodyRef}
        className="relative h-full w-full ease-out-expo"
        style={{
          transform: 'scale(0)',
          opacity: 0,
          transitionProperty: 'transform, opacity',
          transitionDuration: '400ms',
        }}
      >
        {/* Liquid-glass disc: mostly see-through, with a blurred backdrop, a bright rim and a
            soft neutral depth at the lower edge. */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 10,
            background:
              'radial-gradient(circle at 30% 24%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.14) 55%, rgba(255,255,255,0.06) 100%)',
            backdropFilter: 'blur(7px) saturate(1.7)',
            WebkitBackdropFilter: 'blur(7px) saturate(1.7)',
            border: '1px solid rgba(255,255,255,0.75)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -10px 18px rgba(10,10,10,0.08), 0 8px 24px rgba(10,10,10,0.1)',
          }}
        />

        {/* Plus / minus */}
        <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d={mode === 'plus' ? 'M1 7h12M7 1v12' : 'M1 7h12'} stroke="#0A0A0A" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </div>
    </div>,
    document.body,
  )
}
