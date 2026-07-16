import React from 'react'
import ProductDetails from './components/ProductDetails'
import CompleteTheLook from './components/CompleteTheLook'
import MoreFromBrand from './components/MoreFromBrand'
import SimilarProducts from './components/SimilarProducts'
import CuratedRecommendations from '@/components/CuratedRecommendations'
import { notFound } from 'next/navigation'
import { productApi, resolveProductWithMeta } from '@/lib/api'
// productApi used below for category/brand recommendations
import { generateSlug } from '@/lib/product'
import type { ApiProduct } from '@/types/api'
import type { Product as PdpProduct, Variant } from './types/product'
import type { RecItem } from './components/ProductCard'

interface ProductPageProps {
  params: Promise<{
    brand: string
    slug: string
  }>
}

function toNewProduct(p: ApiProduct): PdpProduct {
  const variants: Variant[] = []
  let variantId = 1
  for (const colour of (p.colours ?? [])) {
    for (const size of (p.sizes ?? [])) {
      variants.push({
        color: colour.name,
        id: variantId++,
        size,
        sku: `${p.sku ?? 'PROD'}-${colour.name.slice(0, 3).toUpperCase()}-${size}`,
        stockQuantity: 10,
        weightGrams: 500,
      })
    }
  }

  return {
    brandId: 0,
    brandName: p.brandName,
    careInstructions: p.details?.care ?? null,
    catalogueCategory: (p.catalogue && p.catalogue.length > 0) ? p.catalogue : null,
    category: p.category,
    collectionName: null,
    createdAt: p.createdAt,
    creatorEmail: '',
    creatorId: 0,
    description: p.description ?? '',
    gender: null,
    id: parseInt(p.id) || 0,
    images: p.images ?? [],
    inspirationStory: null,
    material: p.details?.material ?? '',
    name: p.name,
    originCountry: p.details?.origin ?? '',
    releaseDate: null,
    returnPeriodDays: 30,
    status: 'ACTIVE',
    updatedAt: p.createdAt,
    variants,
    videos: [],
  }
}

function toRecItem(p: ApiProduct): RecItem {
  return {
    brand: p.brandName,
    name: p.name,
    price: `€ ${p.price.toFixed(0)}`,
    colors: (p.colours ?? []).map(c => c.hex),
    href: `/bekleidung/${generateSlug(p.brandName)}/${p.slug}`,
    image: p.images?.[0],
  }
}

async function ProductPage({ params }: ProductPageProps) {
  const { brand, slug } = await params

  // No blanket catch here: the resolver returns null only for a genuine 404 (→ notFound),
  // and throws for real backend errors so they reach error.tsx instead of masquerading as a
  // "product not found" 404.
  const resolved = await resolveProductWithMeta(slug)
  if (!resolved) notFound()

  const product = toNewProduct(resolved)

  const colorHexMap: Record<string, string> = {}
  for (const c of (resolved.colours ?? [])) {
    colorHexMap[c.name] = c.hex
  }

  const mainCategory = resolved.category

  const [categoryRes, allRes] = await Promise.all([
    productApi.list({ category: mainCategory }).catch(() => ({ content: [] as ApiProduct[] })),
    productApi.list({ size: 100 }).catch(() => ({ content: [] as ApiProduct[] })),
  ])

  const relatedItems: RecItem[] = categoryRes.content
    .filter((p: ApiProduct) => p.id !== resolved.id)
    .slice(0, 4)
    .map(toRecItem)

  const brandItems: RecItem[] = allRes.content
    .filter((p: ApiProduct) => generateSlug(p.brandName) === brand && p.id !== resolved.id)
    .slice(0, 4)
    .map(toRecItem)

  const catalogueTags = resolved.catalogue ?? []
  const similarItems: RecItem[] = allRes.content
    .filter((p: ApiProduct) => {
      if (p.id === resolved.id) return false
      const tags = p.catalogue ?? []
      return tags.some((t: string) => catalogueTags.includes(t))
    })
    .slice(0, 4)
    .map(toRecItem)

  return (
    <div className="min-h-screen">
      <ProductDetails
        product={product}
        price={resolved.price}
        currency={resolved.currency ?? 'EUR'}
        brandSlug={brand}
        productSlug={slug}
        colorHexMap={colorHexMap}
        productId={resolved.id}
      />
      <CompleteTheLook items={relatedItems} />
      <MoreFromBrand brand={product.brandName} items={brandItems} />
      <SimilarProducts items={similarItems} />
      <CuratedRecommendations excludeId={resolved.id} />
    </div>
  )
}

export default ProductPage
