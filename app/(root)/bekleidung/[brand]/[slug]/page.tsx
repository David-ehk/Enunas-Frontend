import React from 'react'
import ProductDetails from './components/ProductDetails'
import RelatedProducts from './components/RelatedProducts'
import MoreFromBrand from './components/MoreFromBrand'
import StyleSuggestions from './components/StyleSuggestions'
import { getProductBySlug, getAllProducts, slugifyProductName, getProductsByBrand } from '@/lib/mockProducts'
import { notFound } from 'next/navigation'

interface ProductPageProps {
  params: Promise<{
    brand: string;
    slug: string;
  }>;
}

async function ProductPage({ params }: ProductPageProps) {
  const { brand, slug } = await params

  // Versuche Produkt anhand Slug zu finden
  let product = getProductBySlug(slug)

  // Falls nicht gefunden, versuche Slug aus dem Namen zu generieren und zu matchen
  if (!product) {
    // Fallback: Suche nach Produkt, dessen generierter Slug übereinstimmt
    const allProducts = getAllProducts()
    product = allProducts.find(p => {
      const generatedSlug = slugifyProductName(p.name)
      return generatedSlug === slug || p.slug === slug
    })
  }

  // Wenn immer noch kein Produkt gefunden, 404 anzeigen
  if (!product) {
    notFound()
  }

  // Collect IDs shown in first two sections to exclude from StyleSuggestions
  const allProducts = getAllProducts()
  const relatedIds = allProducts
    .filter(p => p.id !== product.id && p.category[0] === product.category[0])
    .slice(0, 4)
    .map(p => p.id)

  const brandIds = getProductsByBrand(product.brand)
    .filter(p => p.id !== product.id)
    .slice(0, 4)
    .map(p => p.id)

  const excludeIds = [...relatedIds, ...brandIds]

  return (
    <div className="min-h-screen">
      <ProductDetails product={product} brandSlug={brand} />
      <RelatedProducts currentProduct={product} />
      <MoreFromBrand currentProduct={product} />
      <StyleSuggestions currentProduct={product} excludeIds={excludeIds} />
    </div>
  )
}

export default ProductPage
