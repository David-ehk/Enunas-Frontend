import React from 'react'
import ProductDetails from './components/ProductDetails'
import CompleteTheLook from './components/CompleteTheLook'
import MoreFromBrand from './components/MoreFromBrand'
import SimilarProducts from './components/SimilarProducts'
import CuratedRecommendations from '@/components/CuratedRecommendations'
import { notFound } from 'next/navigation'
import { productApi, resolveProductWithMeta } from '@/lib/api'
import { DEFAULT_RETURN_PERIOD_DAYS } from '@/lib/api/productResponseAdapter'
// productApi used below for category/brand recommendations
import { generateSlug } from '@/lib/product'
import type { ApiProduct, ApiCompleteTheLookItem } from '@/types/api'
import type { Product as PdpProduct, Variant } from './types/product'
import type { RecItem } from './components/ProductCard'

interface ProductPageProps {
  params: Promise<{
    brand: string
    slug: string
  }>
}

function toNewProduct(p: ApiProduct): PdpProduct {
  // Prefer the real backend variants — they carry the true per-variant stockQuantity and SKU.
  // The synthesised fallback below only applies to mock/pre-connect data that has no variants;
  // it fabricates stock, so anything built from it must never be treated as sellable truth.
  let variants: Variant[]
  if (p.variants && p.variants.length > 0) {
    variants = p.variants.map(v => ({
      color: v.color,
      id: v.id,
      size: v.size,
      sku: v.sku,
      stockQuantity: v.stockQuantity,
      weightGrams: v.weightGrams ?? 0,
    }))
  } else {
    variants = []
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
    returnPeriodDays: p.returnPeriodDays ?? DEFAULT_RETURN_PERIOD_DAYS,
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
    price: p.available ? `€ ${p.price.toFixed(0)}` : null,
    colors: (p.colours ?? []).map(c => c.hex),
    href: `/bekleidung/${generateSlug(p.brandName)}/${p.slug}`,
    image: p.images?.[0],
  }
}

function completeTheLookToRecItem(c: ApiCompleteTheLookItem): RecItem {
  return {
    brand: c.brandName ?? '',
    name: c.name,
    // null price = no active listing. The card renders without a price rather than "€ 0".
    price: c.price != null ? `€ ${c.price.toFixed(0)}` : null,
    colors: [],
    href: c.slug && c.brandName ? `/bekleidung/${generateSlug(c.brandName)}/${c.slug}` : '#',
    image: c.images?.[0],
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

  // The brand's own curated look wins when the backend supplies one; the category query is only
  // a fallback for products with nothing curated.
  const curated = resolved.completeTheLookProducts ?? []
  const relatedItems: RecItem[] = curated.length > 0
    ? curated.slice(0, 4).map(completeTheLookToRecItem)
    : categoryRes.content
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
        available={resolved.available}
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
