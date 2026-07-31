"use client"
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'

const LINES = [
  'Die schönsten Outfits entstehen dort,',
  'wo Persönlichkeit auf Kleidung trifft.',
]

export default function FounderQuote() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 })

  const revealClass = cn(
    'transition-all duration-1200 ease-out-expo',
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
  )
  const delay = (ms: number) => ({ transitionDelay: isVisible ? `${ms}ms` : '0ms' })

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="px-6 lg:px-16 py-24 lg:py-32 min-h-[55vh] flex items-center overflow-hidden"
    >
      <div className="max-w-[1800px] mx-auto w-full">
        <blockquote className="m-0">
          {LINES.map((line, i) => (
            <span
              key={line}
              className={cn(revealClass, 'block font-cormorant font-light italic text-enunas-purple')}
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
          <cite className="not-italic font-league-spartan text-[11px] uppercase tracking-[0.22em] text-enunas-gray-dark">
            David Konan — Gründer &amp; CEO
          </cite>
        </div>
      </div>
    </section>
  )
}
