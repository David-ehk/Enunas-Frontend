"use client"
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'

const BannerBild = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 })

  return (
    <section ref={ref as React.RefObject<HTMLElement>}>
      <div className="relative w-full h-[600px] overflow-hidden">
        <img
          src="https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Library-Sites-viviennewestwood-global-content/default/dwbf118223/images/hp/2025/Wk%2043/VW_HERO_AW2526_October.jpg?sw=1920&sh=1200&q=80"
          alt="New in"
          className={cn(
            "w-full h-full object-cover transition-transform duration-1000 ease-out",
            isVisible ? "scale-100" : "scale-105"
          )}
        />

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
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
              "text-4xl md:text-6xl transition-all duration-700 ease-out",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: '400ms' }}
          >
            Dein Shop dich zu finden
          </h2>
        </div>
      </div>
    </section>
  )
}

export default BannerBild
