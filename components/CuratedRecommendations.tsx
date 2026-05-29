'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCuration, type Segment } from '@/lib/curation'
import { productApi } from '@/lib/api'
import { generateSlug } from '@/lib/product'
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
}

export default function CuratedRecommendations({ excludeId, title = 'Das könnte dir auch gefallen', dark = false }: Props) {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const ids = resolveIds(excludeId)
    if (ids.length === 0) return
    Promise.all(ids.map(id => productApi.getById(id).catch(() => null)))
      .then(res => setProducts(res.filter((p): p is ApiProduct => p !== null)))
  }, [excludeId])

  if (products.length === 0) return null

  const visible = expanded ? products : products.slice(0, 4)
  const hiddenCount = products.length - 4

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
