import React from 'react'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'
import { getPopularProducts, buildProductHref } from '@/lib/api/mockProducts'

const products = getPopularProducts()

function ProductCard() {
  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2">
        {products.map((product) => (
          <PopularProductCard
            key={product.id}
            imgURL={product.imgURL}
            brandName={product.brandName}
            productName={product.productName}
            price={product.price}
            href={buildProductHref(product)}
            colours={product.colours}
            createdAt={product.createdAt}
            sizes={product.sizes}
            categories={product.catalogue}
          />
        ))}
      </div>
    </section>
  )
}

export default ProductCard
