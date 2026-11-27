'use client'

import { useCallback, useEffect, useState, type RefObject } from 'react'
import { snapTarget } from '@/lib/pdpSnap'

/** Space left under the "Produktdetails" row at the stop. */
const BELOW_ROW_PX = 8
/** Scrolling has stopped, momentum included, after this long without a scroll event. */
const IDLE_MS = 120

// Measured on each use: the mobile browser's toolbar changes the screen height.
// The stop puts the first row of `section` (its "Produktdetails" header) at the bottom edge.
const lockFor = (section: HTMLElement) => {
  const row = section.querySelector('button') ?? section
  return Math.round(row.getBoundingClientRect().bottom + window.scrollY - window.innerHeight + BELOW_ROW_PX)
}

function glideTo(top: number) {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top, behavior: still ? 'auto' : 'smooth' })
}

/** Phones only: after a swipe, glides the product page to the full photo or to the stop. */
export function usePdpSnap(stopRef: RefObject<HTMLElement | null>) {
  // Whether the page still rests on the full photo, for the swipe cue.
  const [atTop, setAtTop] = useState(true)
  useEffect(() => {
    const read = () => setAtTop(window.scrollY < 24)
    read()
    window.addEventListener('scroll', read, { passive: true })
    return () => window.removeEventListener('scroll', read)
  }, [])

  const scrollToStop = useCallback(() => {
    if (stopRef.current) glideTo(lockFor(stopRef.current))
  }, [stopRef])

  useEffect(() => {
    // Only a finger arms it, so scripted scrolling is never redirected.
    let from: number | null = null
    let released = false
    let timer = 0

    const settle = () => {
      const section = stopRef.current
      const start = from
      from = null
      released = false
      if (start === null || !section || !window.matchMedia('(max-width: 767px)').matches) return
      const to = window.scrollY
      // A tap or a sideways swipe through the photos.
      if (to === start) return

      const target = snapTarget({ from: start, to, lock: lockFor(section) })
      if (target !== null) glideTo(target)
    }

    const wait = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(settle, IDLE_MS)
    }
    const onStart = () => {
      window.clearTimeout(timer)
      released = false
      from = window.scrollY
    }
    const onEnd = (e: TouchEvent) => {
      if (e.touches.length > 0) return
      released = true
      wait()
    }
    const onScroll = () => {
      if (!released) return
      // Momentum from above is caught as it reaches the stop, so it does not run past and return.
      const section = stopRef.current
      if (section && from !== null && window.matchMedia('(max-width: 767px)').matches) {
        const lock = lockFor(section)
        if (from < lock - 1 && window.scrollY > lock + 1) {
          from = null
          released = false
          window.clearTimeout(timer)
          window.scrollTo({ top: lock, behavior: 'auto' })
          return
        }
      }
      wait()
    }

    const passive = { passive: true }
    window.addEventListener('touchstart', onStart, passive)
    window.addEventListener('touchend', onEnd, passive)
    window.addEventListener('touchcancel', onEnd, passive)
    window.addEventListener('scroll', onScroll, passive)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onEnd)
      window.removeEventListener('scroll', onScroll)
    }
  }, [stopRef])

  return { atTop, scrollToStop }
}
