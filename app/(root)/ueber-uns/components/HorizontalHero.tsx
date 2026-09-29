'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const serif = { fontFamily: 'var(--font-Cormorant-Garamond)' }

/**
 * Pinned, tinted hero. While the section is pinned, vertical scroll slides the text columns
 * sideways (transform only). Below 768px or with reduced motion it renders as a static stack.
 */
export default function HorizontalHero({
  image,
  video,
  poster,
  title,
  tagline,
  paragraphs,
}: {
  image?: string
  video?: string
  poster?: string
  title: React.ReactNode
  tagline: string
  paragraphs: string[]
}) {
  const outerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [distance, setDistance] = useState(0)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const measure = () => setEnabled(desktop.matches && !reduced.matches)
    measure()
    window.addEventListener('resize', measure)
    desktop.addEventListener('change', measure)
    reduced.addEventListener('change', measure)
    return () => {
      window.removeEventListener('resize', measure)
      desktop.removeEventListener('change', measure)
      reduced.removeEventListener('change', measure)
    }
  }, [])

  // Reduced motion: show the still poster instead of a looping video.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      const v = videoRef.current
      if (!v) return
      if (reduced.matches) v.pause()
      else void v.play().catch(() => {})
    }
    sync()
    reduced.addEventListener('change', sync)
    return () => reduced.removeEventListener('change', sync)
  }, [])

  // Measured after the wide layout is applied (enabled toggles the track to w-max).
  useEffect(() => {
    const track = trackRef.current
    if (!enabled || !track) return
    const measure = () => setDistance(Math.max(0, track.scrollWidth - window.innerWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    return () => ro.disconnect()
  }, [enabled])

  useEffect(() => {
    const track = trackRef.current
    const outer = outerRef.current
    if (!track || !outer) return
    if (!enabled) {
      track.style.transform = ''
      return
    }
    let raf = 0
    const update = () => {
      raf = 0
      const rect = outer.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, distance)))
      track.style.transform = `translate3d(${-p * distance}px,0,0)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [enabled, distance])

  return (
    <div
      ref={outerRef}
      style={enabled ? { height: `calc(100svh - 70px + ${distance}px)` } : undefined}
    >
      <div
        className={
          enabled
            ? 'sticky top-[70px] h-[calc(100svh-70px)] overflow-hidden'
            : 'relative overflow-hidden'
        }
      >
        {video ? (
          <video
            ref={videoRef}
            src={video}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover brightness-[1.9] contrast-[0.9]"
          />
        ) : (
          <Image
            src={image!}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover grayscale brightness-[1.35] contrast-[0.9]"
          />
        )}
        <div className="absolute inset-0 bg-[#5B1F80] mix-blend-multiply" aria-hidden />

        <div
          ref={trackRef}
          className={`relative will-change-transform text-white ${
            enabled
              ? 'flex h-full items-center w-max pl-[10vw] pr-[10vw]'
              : 'flex flex-col gap-14 px-8 py-24'
          }`}
        >
          <div className={enabled ? 'min-w-[389px] shrink-0' : ''}>
            <h1
              className="font-normal uppercase m-0 mb-10 whitespace-nowrap"
              style={{ ...serif, fontSize: 'clamp(3.5rem, 6.3vw, 5.625rem)', lineHeight: 0.94 }}
            >
              {title}
            </h1>
            <p className="text-[18px] lg:text-[20px] leading-[1.75] font-normal m-0 max-w-[389px]" style={serif}>
              {tagline}
            </p>
          </div>

          {paragraphs.map((t) => (
            <div key={t} className={enabled ? 'flex items-center shrink-0' : ''}>
              {enabled && <div className="w-px self-stretch bg-white/30 mx-[85px] h-[70vh]" aria-hidden />}
              <p
                className={`text-[18px] lg:text-[20px] leading-[1.75] font-normal m-0 ${enabled ? 'w-[389px]' : ''}`}
                style={serif}
              >
                {t}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
