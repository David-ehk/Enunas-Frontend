import { useEffect, type RefObject } from 'react'

/**
 * Background/looping video autoplay, made reliable across browsers:
 *
 * - React sets `muted`/`autoPlay` as DOM attributes, but the browser's autoplay gate checks the
 *   live `.muted` PROPERTY at the exact moment it decides whether to play, and that property
 *   isn't always synced in time during hydration — so the JSX attributes alone can lose the
 *   race. Setting `.muted`/`.defaultMuted` and calling `.play()` imperatively is the fix.
 * - Some mobile browsers (iOS Low Power Mode, Android Data Saver) reject autoplay outright as a
 *   policy decision rather than a buffering one, so a `canplaythrough` retry alone can't unblock
 *   that either — the first tap/scroll/click anywhere on the page is used as a last-resort kick.
 * - `prefers-reduced-motion` pauses the video instead of forcing playback, and is re-checked live
 *   so a mid-session OS setting change takes effect without a reload.
 */
export function useRobustAutoplay(videoRef: RefObject<HTMLVideoElement | null>): void {
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const tryPlay = () => { video.play().catch(() => {}) }

    const sync = () => {
      if (reduced.matches) {
        video.pause()
        return
      }
      video.muted = true
      video.defaultMuted = true
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.addEventListener('canplaythrough', tryPlay, { once: true })
        })
      }
    }

    sync()
    reduced.addEventListener('change', sync)

    const events: Array<keyof DocumentEventMap> = ['touchstart', 'pointerdown', 'click', 'scroll']
    events.forEach(event => document.addEventListener(event, tryPlay, { once: true, passive: true }))

    return () => {
      reduced.removeEventListener('change', sync)
      events.forEach(event => document.removeEventListener(event, tryPlay))
    }
  }, [videoRef])
}
