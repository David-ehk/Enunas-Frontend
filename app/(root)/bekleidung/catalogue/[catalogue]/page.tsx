'use client'

import React, { Suspense, useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'
import { productApi, apiProductToCardShape } from '@/lib/api'
import type { ProductCardShape } from '@/lib/api'

type CatalogueKey = 'Streetwear' | 'Experimental' | 'Athleisure' | 'Culture' | 'Star'

const CATALOGUE_SLOGANS: Record<CatalogueKey, string> = {
  Streetwear:   'Für diejenigen, die Gelassenheit leben und sich immer treu bleiben.',
  Experimental: 'Für die, die sich trauen, anders zu sein und ihre eigene Spur hinterlassen.',
  Athleisure:   'Für diejenigen, die das Leben auf den Fersen treten.',
  Culture:      'Für die, die Vielfalt leben und Mode als Ausdruck ihrer Geschichte feiern.',
  Star:         'Für diejenigen, die Eleganz neu definieren und in jeder Situation Glanz ausstrahlen.',
}

const CATALOGUE_COLORS: Record<CatalogueKey, string> = {
  Streetwear:   '#0011A5',
  Experimental: '#6C169C',
  Athleisure:   '#C01B1B',
  Culture:      '#EA9575',
  Star:         '#000000',
}

function resolveKey(raw: string): CatalogueKey | null {
  const normalised = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
  if (normalised in CATALOGUE_SLOGANS) return normalised as CatalogueKey
  if (raw in CATALOGUE_SLOGANS) return raw as CatalogueKey
  return null
}

export default function CatalogueCategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CatalogueCategoryContent />
    </Suspense>
  )
}

function CatalogueCategoryContent() {
  const params = useParams()
  const raw = Array.isArray(params.catalogue) ? params.catalogue[0] : (params.catalogue ?? '')
  const key = resolveKey(decodeURIComponent(raw))

  const [allProducts, setAllProducts] = useState<ProductCardShape[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productApi.list({ size: 100 })
      .then(res => setAllProducts(res.content.map(apiProductToCardShape)))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredProducts = useMemo(() => {
    if (!key) return []
    return allProducts.filter(p => p.catalogue.includes(key))
  }, [allProducts, key])

  if (!key) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-cormorant text-2xl text-enunas-gray-medium">
          Kollektion nicht gefunden.
        </p>
      </div>
    )
  }

  const slogan = CATALOGUE_SLOGANS[key]
  const color  = CATALOGUE_COLORS[key]

  return (
    <main className="min-h-screen bg-white">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="text-center pt-16 pb-10 lg:pt-20 lg:pb-12 px-6">
        <p className="font-league-spartan text-[10px] uppercase tracking-[0.3em] text-enunas-gray-medium mb-4">
          Catalogue
        </p>

        <h1
          className="font-cormorant text-4xl lg:text-5xl mb-5"
          style={{ color }}
        >
          {key}
        </h1>

        <p
          className="font-cormorant text-xl italic max-w-xl mx-auto leading-relaxed"
          style={{ color }}
        >
          {slogan}
        </p>

        {/* Accent line in catalogue colour */}
        <div
          className="mx-auto mt-7 h-px w-12"
          style={{ backgroundColor: color }}
        />

        <p className="font-league-spartan text-[10px] uppercase tracking-[0.2em] text-enunas-gray-medium mt-5">
          {loading ? '...' : `${filteredProducts.length} Artikel`}
        </p>
      </div>

      {/* ── Product grid ───────────────────────────────────────────────────── */}
      <section className="px-4 lg:px-8 xl:px-12 pb-24">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 max-w-[1800px] mx-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 max-w-[1800px] mx-auto">
            {filteredProducts.map(product => (
              <PopularProductCard
                key={product.id}
                {...product}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <p className="font-cormorant text-2xl text-enunas-gray-medium">
              Keine Artikel in dieser Kollektion.
            </p>
          </div>
        )}
      </section>

    </main>
  )
}
