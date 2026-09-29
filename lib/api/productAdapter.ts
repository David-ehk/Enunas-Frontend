import type { ApiProduct } from '@/types/api';
import { generateSlug } from '@/lib/product';
import { colourwayCoverImage } from '@/lib/colourwayImage';

export interface ProductCardShape {
  id: string;
  imgURL: string;
  brandName: string;
  productName: string;
  price: string;
  /** Pre-formatted pre-discount price; null when not reduced. Non-null is the "on sale" flag. */
  originalPrice?: string | null;
  /** True when the product is a not-yet-released "Coming Soon" item. Authoritative — the card
   *  ignores price/originalPrice when this is set. */
  preview: boolean;
  /** ISO date "YYYY-MM-DD" the product releases; null when not a preview product. */
  releaseDate: string | null;
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

/**
 * One card per colourway: a product that comes in several colours is listed once per colour, each
 * with that colour's own cover photo, only its own swatch and sizes, and a link that opens the
 * product page on that colour. A single-colour product stays one ordinary card.
 */
export function apiProductToColourwayCards(p: ApiProduct): ProductCardShape[] {
  const base = apiProductToCardShape(p);
  if (p.colours.length <= 1) return [base];

  return p.colours.map(c => {
    const variants = (p.variants ?? []).filter(v => v.color === c.name);
    const colorId = variants.find(v => v.colorId != null)?.colorId ?? null;
    const sizes = [...new Set(variants.map(v => v.size.trim().toUpperCase()))];
    return {
      ...base,
      id: `${p.id}:${c.name}`,
      imgURL: colourwayCoverImage(p.imageObjects, colorId, base.imgURL),
      colours: [{ hex: c.hex, name: c.name, colorFamily: c.colorFamily }],
      sizes: sizes.length > 0 ? sizes : base.sizes,
      href: `${base.href}?color=${encodeURIComponent(c.name)}`,
    };
  });
}

export function apiProductToCardShape(p: ApiProduct): ProductCardShape {
  const brandSlug = generateSlug(p.brandName);
  const preview = p.preview ?? false;
  return {
    id: p.id,
    imgURL: p.images?.[0] ?? '',
    brandName: p.brandName,
    productName: p.name,
    // A preview product has no price to format — the card renders "Kommt am …" instead.
    price: preview ? '' : `${p.price.toFixed(2).replace('.', ',')}€`,
    originalPrice:
      preview || p.originalPrice == null
        ? null
        : `${p.originalPrice.toFixed(2).replace('.', ',')}€`,
    href: `/bekleidung/${brandSlug}/${p.slug}`,
    colours: p.colours.map(c => ({ hex: c.hex, name: c.name, colorFamily: c.colorFamily })),
    createdAt: p.createdAt,
    sizes: p.sizes?.map(s => s.trim().toUpperCase()),
    catalogue: p.catalogue,
    category: p.category,
    subcategory: p.subcategory,
    gender: p.gender,
    preview,
    releaseDate: p.releaseDate ?? null,
  };
}
