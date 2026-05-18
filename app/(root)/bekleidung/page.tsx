'use client'

import React, { Suspense, useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import CategoryNavigation from './components/CategoryNavigation'
import FilterBar from './components/FilterBar'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'
import { productApi, apiProductToCardShape } from '@/lib/api'
import type { ProductCardShape } from '@/lib/api'

const CATEGORY_LABELS: Record<string, string> = {
  oberteile: 'Oberteile',
  jacken: 'Jacken',
  hosen: 'Hosen',
  schuhe: 'Schuhe',
  accessoires: 'Accessoires',
}

const TYPE_LABELS: Record<string, string> = {
  tshirts: 'T-Shirts',
  hoodie: 'Hoodies',
  sweater: 'Sweater',
  hemden: 'Hemden',
  blazer: 'Blazer',
  jeans: 'Jeans',
  jogging: 'Jogger',
  shorts: 'Shorts',
  denim: 'Denim',
  puffer: 'Puffer',
}

export default function BekleidungPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <BekleidungContent />
    </Suspense>
  )
}

function BekleidungContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const categoryParam = searchParams.get('category') || ''
  const typeParam = searchParams.get('type') || ''

  const [allProducts, setAllProducts] = useState<ProductCardShape[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = categoryParam
      ? { size: 100, category: categoryParam }
      : { size: 100 }
    productApi.list(params)
      .then(res => setAllProducts(res.content.map(apiProductToCardShape)))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false))
  }, [categoryParam])

  const pageTitle = useMemo(() => {
    if (typeParam && TYPE_LABELS[typeParam]) return TYPE_LABELS[typeParam]
    if (categoryParam && CATEGORY_LABELS[categoryParam]) return CATEGORY_LABELS[categoryParam]
    return 'Bekleidung'
  }, [categoryParam, typeParam])

  const filteredProducts = useMemo(() => {
    if (!typeParam) return allProducts
    return allProducts.filter(p => p.subcategory === typeParam)
  }, [allProducts, typeParam])

  const handleCategoryReset = useCallback(() => {
    router.push('/bekleidung')
  }, [router])

  return (
    <main className="min-h-screen bg-white">
      {/* Category Navigation - scrolls with content */}
      <div className="bg-white border-b border-gray-100">
        <CategoryNavigation />
      </div>

      {/* Main Content - All scrollable like McQueen */}
      <div className="bg-white">
        {/* Page Header - Elegant, minimal McQueen style */}
        <div className="text-center pt-16 pb-8 lg:pt-20 lg:pb-10 px-6">
          <h1
            className="text-3xl lg:text-4xl tracking-[0.02em] text-enunas-black font-light"
            style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
          >
            {pageTitle}
          </h1>

          <div className="mt-5">
            <p
              className="text-[12px] text-enunas-gray-medium max-w-xl mx-auto leading-relaxed tracking-[0.02em]"
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              Kuratierte Auswahl an Premium-Streetwear und Designermode.
              Jeder Look, ein Statement.
            </p>
          </div>
        </div>

        {/* Filter Bar - McQueen elegant style */}
        <FilterBar
          articleCount={filteredProducts.length}
          onGenderChange={() => {}}
          onCategoryReset={handleCategoryReset}
        />

        {/* Product Grid - Generous spacing like McQueen */}
        <section className="px-4 lg:px-8 xl:px-12 py-8 lg:py-12">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-6 max-w-[1800px] mx-auto">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-6 max-w-[1800px] mx-auto">
              {filteredProducts.map((product) => (
                <PopularProductCard key={product.id} {...product} />
              ))}
            </div>
          )}

          {/* Load More Button - McQueen refined style */}
          {!loading && filteredProducts.length >= 8 && (
            <div className="flex justify-center mt-16 lg:mt-20">
              <button
                className="group relative px-10 py-4 text-[11px] tracking-[0.15em] uppercase text-enunas-black
                         border border-enunas-black overflow-hidden transition-colors duration-500"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
                  Mehr laden
                </span>
                <span className="absolute inset-0 bg-enunas-black transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
              </button>
            </div>
          )}
        </section>

        {/* Bottom spacing */}
        <div className="h-16 lg:h-24" />
      </div>
    </main>
  )
}
