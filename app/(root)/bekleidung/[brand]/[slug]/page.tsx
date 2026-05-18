import React from 'react'
import ProductDetails from './components/ProductDetails'
import RelatedProducts from './components/RelatedProducts'
import MoreFromBrand from './components/MoreFromBrand'
import StyleSuggestions from './components/StyleSuggestions'
import { notFound } from 'next/navigation'
import { productApi, resolveProductWithMeta, apiProductToProduct } from '@/lib/api'
import { generateSlug } from '@/lib/product'
import type { Product } from '@/lib/product'
import type { ApiProduct } from '@/types/api'

interface ProductPageProps {
  params: Promise<{
    brand: string;
    slug: string;
  }>;
}

function toProduct(p: ApiProduct): Product {
  return apiProductToProduct(p, [], [])
}

async function ProductPage({ params }: ProductPageProps) {
  const { brand, slug } = await params

  const resolved = await resolveProductWithMeta(brand, slug).catch(() => null)
  if (!resolved) notFound()

  const { product, defaultListingId } = resolved
  const mainCategory = product.category[0]

  const [categoryRes, allRes] = await Promise.all([
    productApi.getByCategory(mainCategory).catch(() => ({ content: [] as ApiProduct[] })),
    // TODO: Replace size:100 with pagination when backend supports it
    productApi.list({ size: 100 }).catch(() => ({ content: [] as ApiProduct[] })),
  ])

  const relatedProducts = categoryRes.content
    .filter(p => p.id !== product.id)
    .map(toProduct)

  const brandProducts = allRes.content
    .filter(p => generateSlug(p.brandName) === brand && p.id !== product.id)
    .map(toProduct)

  const suggestions = allRes.content
    .filter(p => {
      const tags = p.catalogue ?? []
      return tags.some(t => product.catalogue.includes(t))
    })
    .map(toProduct)

  const excludeIds = [
    ...relatedProducts.slice(0, 4).map(p => p.id),
    ...brandProducts.slice(0, 4).map(p => p.id),
  ]

  return (
    <div className="min-h-screen">
      <ProductDetails product={product} brandSlug={brand} defaultListingId={defaultListingId} />
      <RelatedProducts currentProduct={product} relatedProducts={relatedProducts} />
      <MoreFromBrand currentProduct={product} brandProducts={brandProducts} />
      <StyleSuggestions currentProduct={product} suggestions={suggestions} excludeIds={excludeIds} />
    </div>
  )
}

export default ProductPage
