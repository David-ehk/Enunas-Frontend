import React from 'react'
import ProductDetails from './components/ProductDetails'
import RelatedProducts from './components/RelatedProducts'
import { Product } from '@/lib/product'

// Mock product data - replace with actual data fetching later
const mockProduct: Product = {
  id: '1',
  slug: 'test-product',
  name: 'Test Produkt',
  brand: 'Test Brand',
  description: 'Dies ist eine Test-Beschreibung für das Produkt.',
  price: 99.99,
  currency: 'EUR',
  colors: [
    { id: 'black', name: 'Black', hex: '#000000', slug: 'black' },
    { id: 'white', name: 'White', hex: '#FFFFFF', slug: 'white' },
  ],
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  sku: 'TEST-001',
  images: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop',
  ],
  category: ['bekleidung'],
  details: {
    material: '100% Baumwolle',
    care: 'Maschinenwäsche bei 30°C',
  },
}

// Statische Generierung: Alle Slugs vorab generieren
// export async function generateStaticParams() {
//   const products = await getAllProductSlugs();
//   return products.map((product) => ({
//     slug: product.slug,
//   }));
// }

// Dynamische Metadata basierend auf Produkt
// export async function generateMetadata(
//   { params }: ProductPageProps
// ): Promise<Metadata> {
//   const slug = (await params).slug;
//   const product = await getProductBySlug(slug);
//   return {
//     title: product.name,
//   };
// }

interface ProductPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    slug: string;
  }>;
}

async function ProductPage({ params }: ProductPageProps) {
  const { category, subcategory, slug } = await params

  // TODO: Replace with actual data fetching
  // const product = await getProductBySlug(slug);

  return (
    <div className="min-h-screen">
      <ProductDetails product={mockProduct} />
      <div className="container mx-auto px-4 py-8">
        <RelatedProducts />
      </div>
    </div>
  )
}

export default ProductPage