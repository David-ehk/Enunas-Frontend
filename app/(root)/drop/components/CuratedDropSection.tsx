'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCuration } from '@/lib/curation'
import { productApi } from '@/lib/api'
import type { ApiProduct } from '@/types/api'

export default function CuratedDropSection() {
  const [products, setProducts] = useState<ApiProduct[]>([])

  useEffect(() => {
    const ids = getCuration().drops
    if (ids.length === 0) return
    Promise.all(ids.map(id => productApi.getById(id).catch(() => null)))
      .then(results => setProducts(results.filter((p): p is ApiProduct => p !== null)))
  }, [])

  if (products.length === 0) return null

  return (
    <section className="py-20 px-6 lg:px-12 max-w-[1800px] mx-auto">
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-2"
          style={{ fontFamily: 'var(--font-league-spartan)' }}>
          Exklusiv
        </p>
        <h2 className="text-3xl text-white"
          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, letterSpacing: '0.02em' }}>
          Ausgewählte <em>Drops.</em>
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <Link
            key={product.id}
            href={`/bekleidung/${product.category}/${product.slug}`}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden aspect-[3/4] bg-[#1A1A1A] rounded-xl mb-3">
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
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-0.5"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {product.brandName}
            </p>
            <p className="text-base text-white leading-snug"
              style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500 }}>
              {product.name}
            </p>
            <p className="text-[12px] text-[#9B9B9B] mt-1"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              € {product.price?.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
