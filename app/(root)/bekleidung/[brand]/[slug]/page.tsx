import React from 'react'
import Link from 'next/link'
import ProductDetails from './components/ProductDetails'
import RelatedProducts from './components/RelatedProducts'
import { getProductBySlug, getAllProducts, slugifyProductName } from '@/lib/mockProducts'
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

  return (
    <div className="min-h-screen">
      <ProductDetails product={product} />
      <div className="px-8 py-8">
         {/* Breadcrumb */}
         <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-black">Home</Link>
            {' / '}
            <Link href="/bekleidung" className="hover:text-black">Bekleidung</Link>
            {' / '}
            <Link href={`/bekleidung/${brand}`} className="hover:text-black">{product.brand}</Link>
            {' / '}
            <span className="font-light text-gray-500">{product.name}</span>
          </nav>
          <br/>
        <RelatedProducts />
      </div>
    </div>
  )
}

export default ProductPage