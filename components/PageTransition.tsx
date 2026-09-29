'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { resolveTransitionTarget, isCurtainFreePath } from '@/lib/pageTransition'
import { shouldRevealInitial } from '@/lib/initialReveal'

type Phase = 'idle' | 'cover' | 'reveal'

const DURATION_MS = 800
const FALLBACK_MS = 4000
const INITIAL_MIN_MS = 700
const INITIAL_MAX_MS = 4000

/**
 * Route-change curtain: on an internal link click the panel drops in from the top and covers the
 * page, the route changes underneath it, then it slides on out through the bottom. Transform only.
 * Skipped entirely under prefers-reduced-motion.
 */
export default function PageTransition() {
  const router = useRouter()
  const pathname = usePathname()
  // Starts covered: the first paint of every full page load is the curtain, so the videos get
  // time to load behind it (see the initial-load effect below).
  // Curtain-free pages (checkout, product pages) never start covered.
  const startsClear = isCurtainFreePath(pathname)
  const [phase, setPhase] = useState<Phase>(startsClear ? 'idle' : 'cover')
  const busy = useRef(!startsClear)
  const initial = useRef(!startsClear)
  const timers = useRef<number[]>([])

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])

  const reveal = useCallback(() => {
    if (!busy.current) return
    setPhase('reveal')
    later(() => {
      setPhase('idle')
      busy.current = false
    }, DURATION_MS)
  }, [later])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (busy.current || e.defaultPrevented) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const anchor = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!anchor) return

      const to = resolveTransitionTarget({
        href: anchor.href,
        currentUrl: window.location.href,
        target: anchor.getAttribute('target'),
        download: anchor.hasAttribute('download'),
        button: e.button,
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
      })
      if (!to) return

      // preventDefault makes Next's <Link> skip its own navigation, while the link's own onClick
      // (e.g. closing the cart sidebar) still runs. The push happens after the curtain is down.
      e.preventDefault()
      busy.current = true
      setPhase('cover')
      later(() => router.push(to), DURATION_MS)
      // If the navigation never commits, don't leave the page hidden.
      later(() => reveal(), DURATION_MS + FALLBACK_MS)
    }
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      timers.current.forEach(clearTimeout)
    }
  }, [router, later, reveal])

  // First load: hold the curtain until the videos in the first viewport can play.
  useEffect(() => {
    if (!initial.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      initial.current = false
      busy.current = false
      later(() => setPhase('idle'), 0)
      return
    }
    const start = performance.now()
    const iv = window.setInterval(() => {
      const videos = Array.from(document.querySelectorAll('video')).filter(
        v => v.getBoundingClientRect().top < window.innerHeight,
      )
      const videosReady = videos.every(v => v.readyState >= 3 || v.error !== null)
      if (
        shouldRevealInitial({
          elapsedMs: performance.now() - start,
          videosReady,
          minMs: INITIAL_MIN_MS,
          maxMs: INITIAL_MAX_MS,
        })
      ) {
        window.clearInterval(iv)
        initial.current = false
        reveal()
      }
    }, 100)
    return () => window.clearInterval(iv)
  }, [later, reveal])

  // The route committed: slide the curtain away.
  useEffect(() => {
    if (initial.current) return
    if (busy.current) reveal()
  }, [pathname, reveal])

  const y = phase === 'cover' ? '0%' : phase === 'reveal' ? '100%' : '-100%'

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-enunas-purple ease-out-expo"
      style={{
        transform: `translateY(${y})`,
        transitionProperty: 'transform',
        transitionDuration: phase === 'idle' ? '0ms' : `${DURATION_MS}ms`,
        pointerEvents: phase === 'idle' ? 'none' : 'auto',
        willChange: 'transform',
      }}
    >
      <span
        className="font-cormorant font-light text-white ease-out-expo"
        style={{
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          opacity: phase === 'cover' ? 1 : 0,
          transitionProperty: 'opacity',
          transitionDuration: '600ms',
          transitionDelay: phase === 'cover' ? '300ms' : '0ms',
        }}
      >
        Enunas
      </span>
    </div>
  )
}
