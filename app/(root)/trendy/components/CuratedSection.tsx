'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCuration, resolveCuratedOrNewest } from '@/lib/curation'
import { generateSlug } from '@/lib/product'
import type { ApiProduct } from '@/types/api'

export default function CuratedTrendySection() {
  const [products, setProducts] = useState<ApiProduct[]>([])

  useEffect(() => {
    resolveCuratedOrNewest(getCuration().trendy, 8).then(setProducts)
  }, [])

  if (products.length === 0) return null

  return (
    <section className="py-20 px-6 lg:px-12 max-w-[1800px] mx-auto">
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-2"
          style={{ fontFamily: 'var(--font-league-spartan)' }}>
          Kuratiert für dich
        </p>
        <h2 className="text-3xl font-semibold text-[#0A0A0A]"
          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, letterSpacing: '0.02em' }}>
          Trending <em>jetzt.</em>
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <Link
            key={product.id}
            href={`/bekleidung/${generateSlug(product.brandName)}/${product.slug}`}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden aspect-[3/4] bg-[#F5F5F0] rounded-xl mb-3">
              {product.images?.[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
              )}
            </div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] mb-0.5"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {product.brandName}
            </p>
            <p className="text-base text-[#0A0A0A] leading-snug"
              style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500 }}>
              {product.name}
            </p>
            <p className="text-[12px] text-[#6B6B6B] mt-1"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              € {product.price?.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
