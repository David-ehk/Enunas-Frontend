import type { ApiProduct } from '@/types/api';
import { generateSlug, colourHref, withColourFirst } from '@/lib/product';
import { colourwayCoverImage } from '@/lib/colourwayImage';

export interface ProductCardShape {
  id: string;
  /** The product this card shows. Several colourway cards share one; `id` differs per card. */
  productId: string;
  imgURL: string;
  brandName: string;
  productName: string;
  price: string;
  /** Pre-formatted pre-discount price; null when not reduced. Non-null is the "on sale" flag. */
  originalPrice?: string | null;
  /** True when the product is a not-yet-released "Coming Soon" item. Authoritative — the card
   *  ignores price/originalPrice when this is set. */
  preview: boolean;
  /** True when the product has variants and every one is at zero stock. It stays listed —
   *  the card just says "Ausverkauft" and offers no sizes. */
  soldOut?: boolean;
  /** ISO date "YYYY-MM-DD" the product releases; null when not a preview product. */
  releaseDate: string | null;
  href: string;
  colours: { hex: string; name: string; colorFamily?: string }[];
  /** Colour cards only: the card's own colour first, then the product's other colours — what the
   *  card displays. `colours` stays the own colour alone, so the colour filter matches per card. */
  allColours?: { hex: string; name: string; colorFamily?: string }[];
  createdAt: Date | string;
  sizes?: string[];
  catalogue?: string[];
  category?: string;
  subcategory?: string;
  productType?: string;
  outfitSlot?: string;
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

  // A colour with no photo of its own gets a shared one; the product's first image may belong to
  // another colour.
  const shared = (p.imageObjects ?? []).filter(i => i.productColorId == null);
  const sharedCover = (shared.find(i => i.primary) ?? shared[0])?.url ?? base.imgURL;

  return p.colours.map(c => {
    const variants = (p.variants ?? []).filter(v => v.color === c.name);
    const colorId = variants.find(v => v.colorId != null)?.colorId ?? null;
    const sizes = [...new Set(variants.filter(v => v.stockQuantity > 0).map(v => v.size.trim().toUpperCase()))];
    return {
      ...base,
      id: `${p.id}:${c.name}`,
      imgURL: colourwayCoverImage(p.imageObjects, colorId, sharedCover),
      colours: [{ hex: c.hex, name: c.name, colorFamily: c.colorFamily }],
      allColours: withColourFirst(p.colours, c.name).map(o => ({
        hex: o.hex, name: o.name, colorFamily: o.colorFamily,
      })),
      sizes: variants.length > 0 ? sizes : base.sizes,
      soldOut: variants.length > 0 && variants.every(v => v.stockQuantity === 0),
      href: colourHref(base.href, c.name),
    };
  });
}

/**
 * One card per product (homepage sections): like apiProductToCardShape, but when the cover photo
 * belongs to one colourway, that colour's swatch comes first and the link opens the PDP on it —
 * so photo, swatch and landing colour agree. Shared or untagged covers leave the card unchanged.
 */
export function apiProductToCoverCard(p: ApiProduct): ProductCardShape {
  const base = apiProductToCardShape(p);
  const coverColorId = p.imageObjects?.find(i => i.url === base.imgURL)?.productColorId ?? null;
  if (coverColorId == null) return base;
  const colourName = p.variants?.find(v => v.colorId === coverColorId)?.color;
  const cover = base.colours.find(c => c.name === colourName);
  if (!cover) return base;
  return {
    ...base,
    colours: withColourFirst(base.colours, cover.name),
    href: colourHref(base.href, cover.name),
  };
}

// Sizes with stock left, uppercased; undefined when there is no variant data to go by.
function variantSizes(variants: ApiProduct['variants']): string[] | undefined {
  if (!variants || variants.length === 0) return undefined;
  return [...new Set(variants.filter(v => v.stockQuantity > 0).map(v => v.size.trim().toUpperCase()))];
}

export function apiProductToCardShape(p: ApiProduct): ProductCardShape {
  const brandSlug = generateSlug(p.brandName);
  const preview = p.preview ?? false;
  return {
    id: p.id,
    productId: p.id,
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
    // With real variant data, only sizes that are still in stock; otherwise the flat size list.
    sizes: variantSizes(p.variants) ?? p.sizes?.map(s => s.trim().toUpperCase()),
    soldOut: p.variants !== undefined && p.variants.length > 0 && p.variants.every(v => v.stockQuantity === 0),
    catalogue: p.catalogue,
    category: p.category,
    subcategory: p.subcategory,
    productType: p.productType,
    outfitSlot: p.outfitSlot,
    gender: p.gender,
    preview,
    releaseDate: p.releaseDate ?? null,
  };
}
