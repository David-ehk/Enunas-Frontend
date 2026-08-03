import React from 'react'
import { Product } from '@/lib/product'
import { generateSlug } from '@/lib/product'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'

interface RelatedProductsProps {
  currentProduct: Product;
  relatedProducts: Product[];
}

function RelatedProducts({ currentProduct, relatedProducts }: RelatedProductsProps) {
  const related = relatedProducts
    .filter(p => p.id !== currentProduct.id)
    .slice(0, 4)

  if (related.length === 0) return null

  return (
    <section className="border-t border-enunas-gray-light">
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 pt-8 pb-10">
        <h2
          className="font-cormorant text-xl sm:text-2xl text-center text-enunas-black mb-6 font-medium"
          style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
        >
          Ähnliche Artikel
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {related.map(p => (
            <PopularProductCard
              key={p.id}
              id={p.id}
              imgURL={p.images[0]}
              brandName={p.brand}
              productName={p.name}
              price={`${p.price}€`}
              href={`/bekleidung/${generateSlug(p.brand)}/${p.slug}`}
              colours={p.colors.map(c => ({ hex: c.hex, name: c.name }))}
              createdAt={new Date()}
              sizes={p.sizes}
              catalogue={p.catalogue}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default RelatedProducts
