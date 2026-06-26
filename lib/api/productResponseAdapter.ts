import type { ApiProduct } from '@/types/api';

// The real backend ProductResponseDto is nested and shaped very differently from the flat
// ApiProduct the storefront was built against (the mock contract). This adapter bridges the
// two: it flattens variants -> sizes/colours, maps image objects -> URLs, lowercases enums,
// and carries the denormalized lowest-active price + stable slug the backend now returns.

interface RawVariant {
  id: number;
  sku: string;
  color: string;
  colorFamily: string;
  size: string;
  stockQuantity: number;
  weightGrams?: number;
}

interface RawImage {
  id: number;
  imageUrl: string;
  altText?: string;
  primary: boolean;
  displayOrder: number;
}

export interface RawProductResponse {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  brandId?: number;
  brandName: string;
  description?: string;
  category?: string;
  catalogueCategory?: string[];
  gender?: string;
  material?: string;
  originCountry?: string;
  careInstructions?: string;
  status: string;
  createdAt: string;
  variants?: RawVariant[];
  images?: RawImage[];
}

export interface RawPagedProducts {
  content: RawProductResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  page: number;
}

// Backend variants carry a colorFamily enum but no hex; map it to a representative swatch.
const COLOR_FAMILY_HEX: Record<string, string> = {
  BLACK: '#0A0A0A', WHITE: '#FFFFFF', GREY: '#9B9B9B', BEIGE: '#D9C9A8', BROWN: '#6B4F3A',
  RED: '#C01B1B', PINK: '#E89BB0', ORANGE: '#D9762B', YELLOW: '#E3C233', GREEN: '#2E7D4F',
  BLUE: '#2B4B8C', PURPLE: '#6C169C', MULTICOLOR: '#888888', METALLIC: '#B8B8C0', OTHER: '#6B6B6B',
};

export function adaptProduct(raw: RawProductResponse): ApiProduct {
  const variants = raw.variants ?? [];

  // Distinct colours by color name, first-seen order.
  const seenColor = new Set<string>();
  const colours = variants
    .filter(v => (seenColor.has(v.color) ? false : (seenColor.add(v.color), true)))
    .map(v => ({
      id: String(v.id),
      hex: COLOR_FAMILY_HEX[v.colorFamily] ?? '#6B6B6B',
      name: v.color,
      colorFamily: v.colorFamily,
    }));

  // Distinct sizes, first-seen order.
  const seenSize = new Set<string>();
  const sizes = variants.map(v => v.size).filter(s => (seenSize.has(s) ? false : (seenSize.add(s), true)));

  // Images: primary first, then displayOrder.
  const images = [...(raw.images ?? [])]
    .sort((a, b) => Number(b.primary) - Number(a.primary) || a.displayOrder - b.displayOrder)
    .map(i => i.imageUrl);

  return {
    id: String(raw.id),
    name: raw.name,
    brandName: raw.brandName,
    sku: variants[0]?.sku ?? '',
    slug: raw.slug,
    description: raw.description,
    price: raw.price ?? 0,
    currency: 'EUR',
    category: (raw.category ?? '').toLowerCase(),
    gender: raw.gender,
    images,
    colours,
    sizes,
    catalogue: (raw.catalogueCategory ?? []).map(c => c.toLowerCase()),
    status: raw.status as ApiProduct['status'],
    createdAt: raw.createdAt,
    details: { material: raw.material, care: raw.careInstructions, origin: raw.originCountry },
  };
}
