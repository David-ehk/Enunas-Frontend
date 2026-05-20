import type { ApiProduct } from '@/types/api';
import { generateSlug } from '@/lib/product';

export interface ProductCardShape {
  id: string;
  imgURL: string;
  brandName: string;
  productName: string;
  price: string;
  href: string;
  colours: { hex: string; name: string }[];
  createdAt: Date | string;
  sizes?: string[];
  catalogue?: string[];
  subcategory?: string;
}

export function apiProductToProduct(p: ApiProduct): ApiProduct {
  return p;
}

export function apiProductToCardShape(p: ApiProduct): ProductCardShape {
  const brandSlug = generateSlug(p.brandName);
  return {
    id: p.id,
    imgURL: p.images?.[0] ?? '',
    brandName: p.brandName,
    productName: p.name,
    price: `${p.price.toFixed(2).replace('.', ',')}€`,
    href: `/bekleidung/${brandSlug}/${p.slug}`,
    colours: p.colours.map(c => ({ hex: c.hex, name: c.name })),
    createdAt: p.createdAt,
    sizes: p.sizes,
    catalogue: p.catalogue,
    subcategory: p.subcategory,
  };
}
