import type { Product, ProductColor } from './product';
import type { ApiProduct, ApiImage, ApiVariant } from '../types/api';
import { generateSlug } from './product';

export interface ProductCardShape {
  id: string;
  slug: string;
  brandName: string;
  productName: string;
  price: string;
  priceNumber: number;
  imgURL: string;
  category: string;
  subcategory: string;
  colours: { hex: string; name: string }[];
  catalogue: string[];
  sizes: string[];
  createdAt: Date;
  href: string;
}

export function apiProductToProduct(
  apiProduct: ApiProduct,
  images: ApiImage[] = [],
  variants: ApiVariant[] = []
): Product {
  const colorMap = new Map<string, ProductColor>();
  variants.forEach((v) => {
    if (v.color && !colorMap.has(v.color)) {
      colorMap.set(v.color, {
        id: v.color,
        name: v.color,
        hex: '#1A1A1A',
        slug: generateSlug(v.color),
      });
    }
  });

  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return a.sortOrder - b.sortOrder;
  });
  const imageUrls = sortedImages.map((i) => i.url);
  if (imageUrls.length === 0 && apiProduct.imageUrl) {
    imageUrls.push(apiProduct.imageUrl);
  }

  const sizes =
    variants.length > 0
      ? [...new Set(variants.map((v) => v.size))]
      : (apiProduct.sizes ?? []);

  return {
    id: apiProduct.id,
    slug: generateSlug(apiProduct.name),
    name: apiProduct.name,
    brand: apiProduct.brandName,
    description: apiProduct.description,
    price: apiProduct.price ?? 0,
    currency: apiProduct.currency ?? 'EUR',
    colors:
      apiProduct.colors?.map((c) => ({
        id: c.id,
        name: c.name,
        hex: c.hex,
        slug: generateSlug(c.name),
      })) ?? [...colorMap.values()],
    sizes,
    catalogue: apiProduct.catalogue ?? [],
    sku: apiProduct.sku,
    images: imageUrls,
    category: [
      apiProduct.category,
      ...(apiProduct.subcategory ? [apiProduct.subcategory] : []),
    ],
    details: {},
  };
}

export function apiProductToCardShape(apiProduct: ApiProduct): ProductCardShape {
  return {
    id: apiProduct.id,
    slug: generateSlug(apiProduct.name),
    brandName: apiProduct.brandName,
    productName: apiProduct.name,
    price: `${apiProduct.price ?? 0}€`,
    priceNumber: apiProduct.price ?? 0,
    imgURL: apiProduct.imageUrl ?? '',
    category: apiProduct.category,
    subcategory: apiProduct.subcategory ?? '',
    colours: apiProduct.colors?.map((c) => ({ hex: c.hex, name: c.name })) ?? [],
    catalogue: apiProduct.catalogue ?? [],
    sizes: apiProduct.sizes ?? [],
    createdAt: new Date(apiProduct.createdAt),
    href: `/bekleidung/${generateSlug(apiProduct.brandName)}/${generateSlug(apiProduct.name)}`,
  };
}
