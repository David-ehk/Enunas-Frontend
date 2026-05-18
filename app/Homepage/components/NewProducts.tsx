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
          "flex justify-center gap-4 items-center px-7 mb-4 transition-all duration-700",
          isVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <hr className="flex-1 max-w-20 border-gray-300" />
        <p className="text-lg sm:text-xl md:text-2xl whitespace-nowrap tracking-wide">
          Neue Arrivals
        </p>
        <hr className="flex-1 max-w-20 border-gray-300" />
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
      <div className="py-2 mt-5 flex justify-center items-center">
        <button className="relative w-full py-4 px-6 tracking-widest text-black/80 bg-[#F5F5F0] overflow-hidden group transition-colors duration-600">
          <span className="absolute left-1/2 -translate-x-1/2 top-[10%] w-full h-[1px] bg-black transition-all duration-500 ease-out group-hover:w-[75%]" />
          <span className="text-black text-xl">Mehr entdecken</span>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-[10%] w-full h-[1px] bg-black transition-all duration-500 ease-out group-hover:w-[75%]" />
        </button>
      </div>
    </section>
  )
}
