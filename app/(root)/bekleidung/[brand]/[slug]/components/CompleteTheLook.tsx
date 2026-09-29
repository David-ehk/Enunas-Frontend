'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'
import type { RecItem } from './ProductCard'
import GlassArrowButton from '@/components/GlassArrowButton'

interface CompleteTheLookProps {
  items: RecItem[]
  heroImage?: string
}

/**
 * "Vervollständige den Look" — look photo beside a horizontally scrolling product row, with the
 * article count next to the title and a thin progress track that follows the scroll position.
 */
export default function CompleteTheLook({ items, heroImage }: CompleteTheLookProps) {
  const sliderRef = useRef<HTMLUListElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const [overflowing, setOverflowing] = useState(false)

  const syncThumb = useCallback(() => {
    const slider = sliderRef.current
    const thumb = thumbRef.current
    if (!slider || !thumb) return
    const { scrollLeft, scrollWidth, clientWidth } = slider
    setOverflowing(scrollWidth > clientWidth + 1)
    const ratio = scrollWidth > 0 ? Math.min(1, clientWidth / scrollWidth) : 1
    const track = thumb.parentElement?.clientWidth ?? 0
    thumb.style.width = `${ratio * 100}%`
    thumb.style.transform = `translateX(${(scrollLeft / Math.max(1, scrollWidth)) * track}px)`
  }, [])

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return
    syncThumb()
    slider.addEventListener('scroll', syncThumb, { passive: true })
    const ro = new ResizeObserver(syncThumb)
    ro.observe(slider)
    return () => {
      slider.removeEventListener('scroll', syncThumb)
      ro.disconnect()
    }
  }, [syncThumb, items.length])

  function slide(dir: 1 | -1) {
    const el = sliderRef.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' })
  }

  if (!items || items.length === 0) return null

  // The photo panel only exists when there is a real product photo for it. Without one the
  // section degrades to a plain product row rather than standing in a drawn placeholder.
  const showHero = Boolean(heroImage)

  const title = (
    <h2 className="m-0 flex items-baseline gap-2 font-cormorant text-[22px] sm:text-[32px] leading-tight font-light text-enunas-black">
      Vervollständige den Look
      <sup
        className="font-league-spartan text-[11px] sm:text-xs font-normal tracking-[0.06em] text-enunas-gray-medium"
        aria-label={`${items.length} Artikel`}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {items.length}
      </sup>
    </h2>
  )

  return (
    <section className="px-4 sm:px-8 lg:px-16 py-6 sm:py-10 max-w-[1800px] mx-auto">
      {/* md:items-center puts the product column at the vertical middle of the tall outfit photo. */}
      <div className={showHero ? 'grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start md:items-center' : ''}>
        {showHero && (
          <div className="relative aspect-[2/3] bg-enunas-off-white overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImage} alt="Outfit" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        )}

        <div className="min-w-0">
          {title}

          <div className="relative h-[5px] rounded-full bg-enunas-gray-light mt-4 mb-6 sm:mb-7 overflow-hidden" aria-hidden>
            <div
              ref={thumbRef}
              className="absolute left-0 top-0 h-full w-full rounded-full bg-enunas-purple will-change-transform"
            />
          </div>

          <div className="relative">
          {overflowing && (
            <GlassArrowButton direction="prev" onClick={() => slide(-1)} className="flex lg:hidden absolute top-[26%] left-2 z-10" />
          )}
          <ul
            ref={sliderRef}
            role="list"
            className="flex gap-2 overflow-x-auto snap-x snap-mandatory list-none m-0 p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item) => (
              <li
                key={item.href + item.name}
                className={`snap-start shrink-0 ${
                  showHero
                    ? 'w-[60%] sm:w-[calc((100%-1rem)/3)] xl:w-[calc((100%-1.5rem)/4)]'
                    : 'w-[60%] sm:w-[calc((100%-1rem)/3)] lg:w-[calc((100%-1.5rem)/4)]'
                }`}
              >
                <PopularProductCard
                  imgURL={item.image ?? ''}
                  brandName={item.brand}
                  productName={item.name}
                  price={item.price}
                  originalPrice={item.originalPrice}
                  href={item.href}
                  colours={item.colors.map(hex => ({ hex, name: '' }))}
                  createdAt={new Date(0)}
                  preview={item.preview}
                  releaseDate={item.releaseDate}
                />
              </li>
            ))}
          </ul>
          {overflowing && (
            <GlassArrowButton direction="next" onClick={() => slide(1)} className="flex lg:hidden absolute top-[26%] right-2 z-10" />
          )}
          </div>
        </div>
      </div>
    </section>
  )
}
