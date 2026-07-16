"use client"
import { useState, useEffect } from 'react'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import PopularProductCard from './PopularProductCard'
import { productApi, apiProductToCardShape } from '@/lib/api'
import type { ProductCardShape } from '@/lib/api'

export default function NewProducts() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })
  const [products, setProducts] = useState<ProductCardShape[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productApi.list({ size: 8 })
      .then(res => {
        const sorted = [...res.content].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setProducts(sorted.map(apiProductToCardShape))
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section ref={ref as React.RefObject<HTMLElement>}>
      {/* Section header */}
      <div
        className={cn(
          "flex justify-center items-center gap-5 px-7 mb-6 transition-all duration-700",
          isVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex-1 h-[1px] bg-enunas-gray-light" />
        <h2
          className="whitespace-nowrap font-cormorant"
          style={{ fontSize: '40px', fontWeight: 300, letterSpacing: '0.08em', color: '#0A0A0A', lineHeight: 1 }}
        >
          Neue Arrivals
        </h2>
        <div className="flex-1 h-[1px] bg-enunas-gray-light" />
      </div>

      {/* Product grid with stagger */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
            ))
          : products.map((product, index) => (
              <div
                key={product.id}
                className={cn(
                  "transition-all duration-700 ease-out",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                )}
                style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
              >
                <PopularProductCard
                  imgURL={product.imgURL}
                  brandName={product.brandName}
                  productName={product.productName}
                  price={product.price}
                  href={product.href}
                  colours={product.colours}
                  catalogue={product.catalogue}
                  sizes={product.sizes}
                  createdAt={product.createdAt}
                />
              </div>
            ))
        }
      </div>

      {/* Button */}
      <div className="py-2 mt-6 flex justify-center items-center">
        <button
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
          <span className="relative z-10">Mehr entdecken</span>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-[12%] w-full h-[1px] bg-black/30 transition-all duration-500 ease-out-expo group-hover:w-[75%]" />
        </button>
      </div>
    </section>
  )
}
