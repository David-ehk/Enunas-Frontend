'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'
import { productApi, apiProductToCardShape } from '@/lib/api'
import { generateSlug } from '@/lib/product'
import type { ProductCardShape } from '@/lib/api'

export default function BrandPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <BrandContent />
    </Suspense>
  )
}

function BrandContent() {
  const params = useParams<{ brand: string }>()
  const brandSlug = params.brand

  const [products, setProducts] = useState<ProductCardShape[]>([])
  const [brandDisplayName, setBrandDisplayName] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!brandSlug) return
    setLoading(true)
    productApi.list({ size: 200 })
      .then(res => {
        const brandProducts = res.content.filter(
          p => generateSlug(p.brandName) === brandSlug
        )
        if (brandProducts.length > 0) {
          setBrandDisplayName(brandProducts[0].brandName)
        }
        setProducts(brandProducts.map(apiProductToCardShape))
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [brandSlug])

  const displayName = brandDisplayName || brandSlug

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-100" />

      <div className="bg-white">
        <div className="text-center pt-16 pb-8 lg:pt-24 lg:pb-12 px-6">
          <p
            className="text-[10px] uppercase tracking-[0.2em] text-enunas-gray-medium mb-3"
            style={{ fontFamily: 'var(--font-league-spartan)' }}
          >
            Marke
          </p>
          <h1
            className="text-3xl lg:text-5xl tracking-[0.02em] text-enunas-black font-light"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            {displayName}
          </h1>
          {!loading && (
            <p
              className="mt-4 text-[12px] text-enunas-gray-medium tracking-[0.05em]"
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              {products.length} {products.length === 1 ? 'Artikel' : 'Artikel'}
            </p>
          )}
        </div>

        <section className="px-4 lg:px-8 xl:px-12 py-8 lg:py-12">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 max-w-[1800px] mx-auto">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <p
                className="text-enunas-gray-medium text-sm tracking-[0.05em]"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                Keine Produkte für diese Marke gefunden.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 max-w-[1800px] mx-auto">
              {products.map(product => (
                <PopularProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </section>

        <div className="h-16 lg:h-24" />
      </div>
    </div>
  )
}
