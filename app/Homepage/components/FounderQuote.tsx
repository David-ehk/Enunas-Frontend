"use client"
import { useEffect, useRef } from 'react'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'

const LINES = [
  'Die besten Fits entstehen, wenn Kleidung',
  ' deine Persönlichkeit matcht.',
]

const PILL_VIDEO = 'https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWbpR5K1iOCwcgFKdqleIRySxzn6ZXroN0M3Ha7'

export default function FounderQuote() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 })
  const videoRef = useRef<HTMLVideoElement>(null)

  // Reduced motion: keep the first frame instead of a looping video.
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

  const revealClass = cn(
    'transition-all duration-1200 ease-out-expo',
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
  )
  const delay = (ms: number) => ({ transitionDelay: isVisible ? `${ms}ms` : '0ms' })

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="relative w-full aspect-video min-h-[440px] sm:min-h-0 overflow-hidden bg-white"
    >
      <video
        ref={videoRef}
        src={PILL_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 flex items-center px-6 lg:px-16 text-white mix-blend-difference">
        <div className="max-w-[1800px] mx-auto w-full">
          <blockquote className="m-0">
            {LINES.map((line, i) => (
              <span
                key={line}
                className={cn(revealClass, 'block font-cormorant font-light italic')}
                style={{
                  ...delay(i * 140),
                  fontSize: 'clamp(2.5rem, 6.4vw, 6rem)',
                  lineHeight: 1.06,
                }}
              >
                {line}
              </span>
            ))}
          </blockquote>

          <div
            className={cn(revealClass, 'flex items-center justify-end mt-12 lg:mt-16')}
            style={delay(LINES.length * 140)}
          >
            <cite className="not-italic font-league-spartan text-[11px] uppercase tracking-[0.22em]">
              David Konan — Gründer &amp; CEO
            </cite>
          </div>
        </div>
      </div>
    </section>
  )
}
