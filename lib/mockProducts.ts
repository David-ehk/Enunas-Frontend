// lib/mockProducts.ts
// Adapter: Converts MockProduct (API source) to Product (for product pages)
// This ensures a single source of truth from lib/api/mockProducts.ts

import {
  MockProduct,
  mockProducts as apiMockProducts,
  getProductBySlug as apiGetBySlug,
  getAllProducts as apiGetAllProducts
} from './api/mockProducts';
import { Product, generateSlug } from './product';

/**
 * Converts a MockProduct to the Product interface used by product detail pages
 */
function toProduct(mock: MockProduct): Product {
  return {
    id: mock.id,
    slug: mock.slug,
    name: mock.productName,
    brand: mock.brandName,
    description: mock.description || '',
    price: mock.priceNumber,
    currency: 'EUR',
    colors: mock.colours.map((c, i) => ({
      id: `${mock.id}-color-${i}`,
      name: c.name,
      hex: c.hex,
      slug: c.name.toLowerCase().replace(/\s+/g, '-'),
    })),
    sizes: mock.sizes,
    catalogue: mock.catalogue,
    sku: mock.sku || `SKU-${mock.id}`,
    images: mock.images || [mock.imgURL],
    category: [mock.category, mock.subcategory], // e.g., ["schuhe", "sneaker"]
    details: mock.details || {},
  };
}

// Export converted products for components that expect the Product interface
export const mockProducts: Product[] = apiMockProducts.map(toProduct);

// Helper: Get product by slug (returns Product interface)
export function getProductBySlug(slug: string): Product | undefined {
  const mock = apiGetBySlug(slug);
  return mock ? toProduct(mock) : undefined;
}

// Helper: Get all products (returns Product[] interface)
export function getAllProducts(): Product[] {
  return mockProducts;
}

// Helper: Generate slug from product name (for URL matching)
export function slugifyProductName(name: string): string {
  return generateSlug(name);
}

// Helper: Build product href from Product interface
export function buildProductHrefFromProduct(product: Product): string {
  return `/bekleidung/${generateSlug(product.brand)}/${product.slug}`;
}

// Helper: Get products by brand
export function getProductsByBrand(brand: string): Product[] {
  return mockProducts.filter(p => p.brand === brand);
}

// Helper: Get products matching any catalogue tag
export function getProductsByCatalogue(tags: string[]): Product[] {
  const tagsLower = tags.map(t => t.toLowerCase());
  return mockProducts.filter(p =>
    p.catalogue.some(c => tagsLower.includes(c.toLowerCase()))
  );
}
