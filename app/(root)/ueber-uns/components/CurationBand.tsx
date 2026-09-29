'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const serif = { fontFamily: 'var(--font-Cormorant-Garamond)' }

type Step = { n: string; title: string; body: string }

/**
 * Solid-colour band with a slide timeline (vertical pagination lines on the left) and an outlined
 * marquee title cropped along the bottom edge. The marquee drifts with page scroll (transform only,
 * static under reduced motion).
 */
export default function CurationBand({
  steps,
  image,
  marquee,
  interval = 6000,
}: {
  steps: Step[]
  image: string
  marquee: string
  interval?: number
}) {
  const [i, setI] = useState(0)
  const [inView, setInView] = useState(false)
  const [paused, setPaused] = useState(false)
  const bandRef = useRef<HTMLElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  // Swipe left/right to change slide; ignored when the gesture is mostly vertical (page scroll).
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current
    touchStart.current = null
    if (!s) return
    const dx = e.changedTouches[0].clientX - s.x
    const dy = e.changedTouches[0].clientY - s.y
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    setI((n) => (dx < 0 ? (n + 1) % steps.length : (n - 1 + steps.length) % steps.length))
  }

  // Autoplay: only while visible and not hovered/focused; `i` in deps restarts the timer after a manual pick.
  useEffect(() => {
    const band = bandRef.current
    if (!band) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 })
    io.observe(band)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!inView || paused) return
    const t = window.setTimeout(() => setI((n) => (n + 1) % steps.length), interval)
    return () => window.clearTimeout(t)
  }, [i, inView, paused, steps.length, interval])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const band = bandRef.current
    const marquee = marqueeRef.current
    if (!band || !marquee) return
    let raf = 0
    const update = () => {
      raf = 0
      const r = band.getBoundingClientRect()
      const p = (window.innerHeight - r.top) / (window.innerHeight + r.height)
      marquee.style.transform = `translate3d(${-p * 900}px,0,0)`
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
  }, [])

  const step = steps[i]

  return (
    <section
      ref={bandRef}
      className="relative overflow-hidden bg-[#370E4D] text-white"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="max-w-[910px] mx-auto px-8 pt-24 pb-52 lg:pb-64 grid md:grid-cols-[330px_minmax(0,1fr)] gap-12 md:gap-20 items-center">
        <div className="relative aspect-[3/4] w-full max-w-[330px] overflow-hidden bg-white/10">
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 768px) 330px, 80vw"
            className="object-cover"
          />
        </div>
        <div key={step.n} className="animate-fade-in">
          <h2
            className="font-normal leading-[1.15] m-0 mb-6"
            style={{ ...serif, fontSize: 'clamp(1.9rem, 3vw, 2.5rem)', fontVariantNumeric: 'lining-nums' }}
          >
            {step.n} — {step.title}
          </h2>
          <p className="text-[18px] leading-[1.9] font-normal m-0 max-w-[350px]" style={serif}>
            {step.body}
          </p>
        </div>
      </div>

      <div className="absolute left-4 md:left-[75px] top-1/2 -translate-y-[60%] flex flex-col" role="tablist" aria-label="Schritte">
        {steps.map((s, idx) => (
          <button
            key={s.n}
            type="button"
            role="tab"
            aria-selected={idx === i}
            aria-label={`${s.n} ${s.title}`}
            onClick={() => setI(idx)}
            className="group h-10 w-6 flex items-center focus-visible:outline focus-visible:outline-1 focus-visible:outline-white"
          >
            <span
              className={`block h-px transition-[opacity,transform] duration-300 ease-out-expo origin-left ${
                idx === i ? 'w-6 opacity-100' : 'w-6 opacity-40 scale-x-50 group-hover:opacity-80'
              } bg-white`}
            />
          </button>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[110px] lg:h-[125px] overflow-hidden pointer-events-none" aria-hidden>
        <div
          ref={marqueeRef}
          className="whitespace-nowrap will-change-transform leading-[0.7]"
          style={{
            ...serif,
            fontSize: 'clamp(6rem, 15.3vw, 13.75rem)',
            fontWeight: 300,
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255,255,255,0.9)',
            textTransform: 'uppercase',
            paddingTop: '0.05em',
          }}
        >
          {`${marquee} — `.repeat(4)}
        </div>
      </div>
    </section>
  )
}
