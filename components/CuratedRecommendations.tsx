'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCuration, resolveCuratedOrNewest, type Segment } from '@/lib/curation'
import { generateSlug } from '@/lib/product'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'
import { apiProductToCardShape } from '@/lib/api'
import type { ApiProduct } from '@/types/api'

const SEGMENT_PRIORITY: Segment[] = ['star', 'streetwear', 'cultural', 'athleisure', 'experimental']

function resolveIds(excludeId?: string): string[] {
  const curation = getCuration()
  for (const seg of SEGMENT_PRIORITY) {
    const ids = curation.recommendations[seg] ?? []
    if (ids.length > 0) return ids.filter(id => id !== excludeId)
  }
  return []
}

interface Props {
  excludeId?: string
  title?: string
  dark?: boolean
  /** 'feed' matches the "Neue Arrivals" section styling (homepage). */
  variant?: 'default' | 'feed'
}

export default function CuratedRecommendations({ excludeId, title = 'Das könnte dir auch gefallen', dark = false, variant = 'default' }: Props) {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(true)
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

  useEffect(() => {
    resolveCuratedOrNewest(resolveIds(excludeId), 8)
      .then(res => setProducts(res.filter(p => p.id !== excludeId)))
      .finally(() => setLoading(false))
  }, [excludeId])

  const visible = expanded ? products : products.slice(0, 4)
  const hiddenCount = products.length - 4

  if (variant === 'feed') {
    // Render the section while loading so the scroll-reveal observer can attach to it.
    if (!loading && products.length === 0) return null

    return (
      <section ref={ref as React.RefObject<HTMLElement>}>
        {/* Section header — mirrors NewProducts */}
        <div
          className={cn(
            "flex justify-center items-center gap-5 px-7 mb-6 transition-all duration-700",
            isVisible ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="flex-1 h-[1px] bg-enunas-gray-light" />
          <h2
            className="text-center font-cormorant max-w-[75%]"
            style={{ fontSize: 'clamp(1.75rem, 7vw, 2.5rem)', fontWeight: 300, letterSpacing: '0.08em', color: '#0A0A0A', lineHeight: 1.15 }}
          >
            {title}
          </h2>
          <div className="flex-1 h-[1px] bg-enunas-gray-light" />
        </div>

        {/* Product grid with stagger */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
              ))
            : visible.map((product, index) => (
                <div
                  key={product.id}
                  className={cn(
                    "transition-all duration-700 ease-out",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  )}
                  style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
                >
                  <PopularProductCard {...apiProductToCardShape(product)} />
                </div>
              ))
          }
        </div>

        {/* Button */}
        {!expanded && hiddenCount > 0 && (
          <div className="py-2 mt-6 flex justify-center items-center">
            <button
              onClick={() => setExpanded(true)}
              className="group relative w-full overflow-hidden"
              style={{
                padding: '18px 32px',
                background: '#F5F5F0',
                fontFamily: 'var(--font-Cormorant-Garamond)',
                fontSize: '20px',
                fontWeight: 400,
                letterSpacing: '0.06em',
                color: '#0A0A0A',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <span className="absolute left-1/2 -translate-x-1/2 top-[12%] w-full h-[1px] bg-black/30 transition-all duration-500 ease-out-expo group-hover:w-[75%]" />
              <span className="relative z-10">+{hiddenCount} weitere entdecken</span>
              <span className="absolute left-1/2 -translate-x-1/2 bottom-[12%] w-full h-[1px] bg-black/30 transition-all duration-500 ease-out-expo group-hover:w-[75%]" />
            </button>
          </div>
        )}
      </section>
    )
  }

  if (products.length === 0) return null

  const borderColor = dark ? 'rgba(255,255,255,0.1)' : '#E8E8E8'
  const headingColor = dark ? '#ffffff' : '#0A0A0A'
  const brandColor   = dark ? 'rgba(255,255,255,0.45)' : '#6B6B6B'
  const nameColor    = dark ? '#ffffff' : '#0A0A0A'
  const priceColor   = dark ? 'rgba(255,255,255,0.7)' : '#0A0A0A'
  const btnColor     = dark ? 'rgba(255,255,255,0.55)' : '#0A0A0A'

  return (
    <section className="px-6 lg:px-16 py-12 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-baseline mb-5 pb-3 border-b"
        style={{ borderColor }}>
        <h2 className="font-cormorant text-[32px] font-light" style={{ color: headingColor }}>
          {title}
        </h2>
        {!expanded && hiddenCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="font-league-spartan text-[11px] tracking-[0.22em] uppercase border-b pb-0.5 transition-colors hover:opacity-60"
            style={{ color: btnColor, borderColor: btnColor }}
          >
            +{hiddenCount} weitere →
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {visible.map(product => {
          const href = `/bekleidung/${generateSlug(product.brandName)}/${product.slug}`
          return (
            <Link key={product.id} href={href} className="group block cursor-pointer">
              <div className="relative aspect-[3/4] bg-[#F5F5F0] overflow-hidden mb-3.5">
                {product.images?.[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-opacity duration-200 group-hover:opacity-85"
                  />
                )}
              </div>
              <p className="font-league-spartan text-[10px] tracking-[0.22em] uppercase font-medium mb-1.5"
                style={{ color: brandColor }}>
                {product.brandName?.toUpperCase()}
              </p>
              <h3 className="font-cormorant text-[17px] font-light leading-tight mb-2"
                style={{ color: nameColor }}>
                {product.name}
              </h3>
              <p className="font-league-spartan text-[13px] font-light"
                style={{ color: priceColor }}>
                € {product.price?.toLocaleString('de-DE', { minimumFractionDigits: 0 })}
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
