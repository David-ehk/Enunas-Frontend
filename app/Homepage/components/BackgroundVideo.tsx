'use client'

import { useEffect, useRef, useState, type VideoHTMLAttributes } from 'react'
import { useRobustAutoplay } from '@/hooks/use-robust-autoplay'

type Props = Pick<VideoHTMLAttributes<HTMLVideoElement>, 'className' | 'style' | 'aria-hidden'> & {
  src: string
  /** Above the fold only: downloads from the server HTML on. Everything else waits until it is
   *  nearly on screen, so it cannot take bandwidth from the video the visitor is looking at. */
  priority?: boolean
  pauseOnReducedMotion?: boolean
}

/**
 * The one muted, looping video of the homepage. Loading and autoplay are decided here and
 * nowhere else; homepageVideos.test.tsx fails if a section renders its own <video>.
 */
export default function BackgroundVideo({ src, priority = false, pauseOnReducedMotion = false, ...rest }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [near, setNear] = useState(false)
  const load = priority || near

  useEffect(() => {
    const video = ref.current
    if (priority || !video) return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setNear(true)
        observer.disconnect()
      }
    }, { rootMargin: '600px 0px' })
    observer.observe(video)
    return () => observer.disconnect()
  }, [priority])

  useRobustAutoplay(ref, { enabled: load, pauseOnReducedMotion })

  return (
    <video
      {...rest}
      ref={ref}
      src={load ? src : undefined}
      preload={load ? 'auto' : 'none'}
      autoPlay
      loop
      muted
      playsInline
    />
  )
}
