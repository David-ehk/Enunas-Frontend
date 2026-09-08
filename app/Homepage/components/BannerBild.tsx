"use client"
import Image from 'next/image'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'

const BannerBild = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 })

  return (
    <section ref={ref as React.RefObject<HTMLElement>}>
      <div className="relative w-full h-[420px] sm:h-[500px] md:h-[600px] overflow-hidden">
        <Image
          src="https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWbmGGkjmM2SZ6mLfKiMTvNxhP12XG85FDYdR7k"
          alt="New in"
          fill
          sizes="100vw"
          className={cn(
            "object-cover transition-transform duration-1000 ease-out",
            isVisible ? "scale-100" : "scale-105"
          )}
        />

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
          <p
            className={cn(
              "text-xs uppercase tracking-widest mb-1 transition-all duration-700 ease-out",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: '200ms' }}
          >
            NEW Experience
          </p>
          <h2
            className={cn(
              "text-3xl sm:text-4xl md:text-6xl transition-all duration-700 ease-out",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: '400ms' }}
          >
            Dein Shop, um dich zu finden
          </h2>
        </div>
      </div>
    </section>
  )
}

export default BannerBild
