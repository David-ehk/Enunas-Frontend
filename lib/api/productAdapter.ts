import type { ApiProduct } from '@/types/api';
import { generateSlug } from '@/lib/product';

export interface ProductCardShape {
  id: string;
  imgURL: string;
  brandName: string;
  productName: string;
  price: string;
  href: string;
  colours: { hex: string; name: string; colorFamily?: string }[];
  createdAt: Date | string;
  sizes?: string[];
  catalogue?: string[];
  category?: string;
  subcategory?: string;
  gender?: string;
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
    colours: p.colours.map(c => ({ hex: c.hex, name: c.name, colorFamily: c.colorFamily })),
    createdAt: p.createdAt,
    sizes: p.sizes?.map(s => s.trim().toUpperCase()),
    catalogue: p.catalogue,
    category: p.category,
    subcategory: p.subcategory,
    gender: p.gender,
  };
}
