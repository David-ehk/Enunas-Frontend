import React from 'react'
import ProductDetails from './components/ProductDetails'
import RelatedProducts from './components/RelatedProducts'
import { getProductBySlug, getAllProducts, slugifyProductName } from '@/lib/mockProducts'
import { notFound } from 'next/navigation'

interface ProductPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    slug: string;
  }>;
}

async function ProductPage({ params }: ProductPageProps) {
  const { category, subcategory, slug } = await params

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

  return (
    <div className="min-h-screen">
      <ProductDetails product={product} />
      <div className="container mx-auto px-4 py-8">
        <RelatedProducts />
      </div>
    </div>
  )
}

export default ProductPage