import { fetcher } from './fetcher';
import type { ApiProduct } from '@/types/api';
import { mockProducts } from './mockProducts';
import { adaptProduct, type RawProductResponse } from './productResponseAdapter';

export async function resolveProductBySlug(slug: string): Promise<ApiProduct | null> {
  try {
    const result = await fetcher<RawProductResponse>(`/products/slug/${slug}`, { auth: false });
    if (result) return adaptProduct(result);
  } catch {
    // fall through to mock (dev only, unless mock is explicitly disabled)
  }

  // Step-0 masking switch: NEXT_PUBLIC_DISABLE_MOCK=true forbids the dev mock fallback so a
  // missing/failed real product surfaces as a real notFound instead of mock data.
  const mockAllowed = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_MOCK !== 'true';
  if (!mockAllowed) return null;
  const mock = mockProducts.find(p => p.slug === slug);
  if (!mock) return null;
  return {
    id: mock.id,
    name: mock.productName,
    brandName: mock.brandName,
    sku: mock.sku ?? `MOCK-${mock.id}`,
    slug: mock.slug,
    description: mock.description,
    price: mock.priceNumber,
    currency: 'EUR',
    category: mock.category,
    subcategory: mock.subcategory,
    images: mock.images ?? [mock.imgURL],
    colours: mock.colours.map(c => ({ hex: c.hex, name: c.name })),
    sizes: mock.sizes,
    catalogue: mock.catalogue,
    status: 'APPROVED' as const,
    createdAt: mock.createdAt.toISOString(),
    details: mock.details,
  };
}

export interface ProductWithMeta extends ApiProduct {
  breadcrumb: { label: string; href: string }[];
}

export async function resolveProductWithMeta(slug: string): Promise<ProductWithMeta | null> {
  const product = await resolveProductBySlug(slug);
  if (!product) return null;
  return {
    ...product,
    breadcrumb: [
      { label: 'Bekleidung', href: '/bekleidung' },
      { label: product.category, href: `/bekleidung?category=${product.category}` },
      { label: product.name, href: '#' },
    ],
  };
}
