"use client"
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import PopularProductCard from "./PopularProductCard"
import { getPopularProducts, buildProductHref } from '@/lib/api/mockProducts'

const PopularProduct = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })
  const products = getPopularProducts()

  return (
    <section
      id="products"
      className="max-container"
      ref={ref as React.RefObject<HTMLElement>}
    >
      {/* Section header */}
      <div
        className={cn(
          "flex justify-center items-center gap-4 px-7 mb-4 transition-all duration-700",
          isVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <hr className="flex-1 max-w-20 border-gray-300" />
        <p className="text-lg sm:text-xl md:text-2xl whitespace-nowrap tracking-wide">
          Unsere Favoriten
        </p>
        <hr className="flex-1 max-w-20 border-gray-300" />
      </div>

      {/* Product grid with stagger */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2">
        {products.map((product, index) => (
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
              href={buildProductHref(product)}
              colours={product.colours}
              catalogue={product.catalogue}
              sizes={product.sizes}
              createdAt={product.createdAt}
            />
          </div>
        ))}
      </div>

      {/* Button */}
      <div className="py-2 mt-5 flex justify-center items-center">
        <button className="relative w-full py-4 px-6 tracking-widest text-black/80 bg-[#F5F5F0] overflow-hidden group transition-colors duration-600">
          <span className="absolute left-1/2 -translate-x-1/2 top-[10%] w-full h-[1px] bg-[#370E4D] transition-all duration-500 ease-out group-hover:w-[75%]" />
          <span className="relative z-10">Mehr entdecken</span>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-[10%] w-full h-[1px] bg-[#370E4D] transition-all duration-500 ease-out group-hover:w-[75%]" />
        </button>
      </div>
    </section>
  )
}

export default PopularProduct
