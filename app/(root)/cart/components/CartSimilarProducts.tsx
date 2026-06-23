'use client'

import { useEffect, useState } from 'react'
import { productApi, apiProductToCardShape } from '@/lib/api'
import type { ProductCardShape } from '@/lib/api'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'

function ProductSkeleton() {
  return (
    <div className="flex-shrink-0 w-[220px] flex flex-col gap-2">
      <div className="w-full aspect-[3/4] bg-enunas-off-white animate-pulse" />
      <div className="h-2.5 w-1/2 bg-[#F0EFEA] animate-pulse" />
      <div className="h-3.5 w-2/3 bg-[#F0EFEA] animate-pulse" />
      <div className="h-2.5 w-1/4 bg-[#F0EFEA] animate-pulse" />
    </div>
  )
}

export default function CartSimilarProducts() {
  const [products, setProducts] = useState<ProductCardShape[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    productApi.list({ size: 10 })
      .then(r => setProducts(r.content.map(apiProductToCardShape)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && products.length === 0) return null

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-16 border-t border-enunas-gray-light">
      <h2 className="font-league-spartan text-[11px] tracking-[0.28em] uppercase text-enunas-gray-medium mb-8">
        Das könnte dir gefallen
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <ProductSkeleton key={i} />)
          : products.map(p => (
              <div key={p.id} className="flex-shrink-0 w-[220px]">
                <PopularProductCard {...p} />
              </div>
            ))
        }
      </div>
    </section>
  )
}
