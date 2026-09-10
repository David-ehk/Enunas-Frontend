import type { ApiProduct, ApiCompleteTheLookItem } from '@/types/api';

// The real backend ProductResponseDto is nested and shaped very differently from the flat
// ApiProduct the storefront was built against (the mock contract). This adapter bridges the
// two: it flattens variants -> sizes/colours, maps image objects -> URLs, lowercases enums,
// and carries the denormalized lowest-active price + stable slug the backend now returns.

interface RawVariant {
  id: number;
  sku: string;
  color: string;
  colorFamily: string;
  /** ProductColor id — added alongside the colourway-specific images work. */
  colorId?: number;
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
  /** null = shared image (shown for every colourway). */
  productColorId?: number | null;
  color?: string | null;
}

interface RawColor {
  id: number;
  color: string;
  colorFamily?: string;
  sku?: string;
}

export interface RawProductResponse {
  id: number;
  name: string;
  slug: string;
  /** The effective lowest active price — already the discounted one when a sale is running. */
  price: number | null;
  /**
   * The pre-discount price of the same listing `price` came from. Sent on every product
   * response (verified live 2 Sep 2026 on /products, /products/slug/{slug} and
   * /products/color-family/{family}). "On sale" is exactly `originalPrice != null` — the
   * backend guarantees it is never at or below `price`, so never compare the two here.
   */
  originalPrice?: number | null;
  brandId?: number;
  brandName: string;
  collectionName?: string | null;
  /** The brand's story for this product. Optional — plenty of products have none. */
  inspirationStory?: string | null;
  releaseDate?: string | null;
  /** Backend "not yet released" flag. When true: price/originalPrice are null and releaseDate is
   *  a future date. See docs/superpowers/specs/2026-09-08-coming-soon-preview-state-design.md §2. */
  preview?: boolean;
  description?: string;
  category?: string;
  catalogueCategory?: string[];
  gender?: string;
  material?: string;
  originCountry?: string;
  careInstructions?: string;
  status: string;
  createdAt: string;
  returnPeriodDays?: number;
  variants?: RawVariant[];
  images?: RawImage[];
  /** Backend colourways with their real ProductColor ids. Absent on older responses. */
  colors?: RawColor[];
  // The backend sends a trimmed product shape here; only id/name/price are guaranteed.
  // Verified live 2 Sep 2026: it actually sends `{ brandName, id, image, name, price }` — a
  // SINGULAR `image` string, and no `slug`. `images` is kept for the full-shape case.
  completeTheLookProducts?: {
    id: number;
    name: string;
    price: number | null;
    /** Same sale pair as the top-level product, so look cards can strike through too. */
    originalPrice?: number | null;
    brandName?: string;
    slug?: string;
    image?: string;
    images?: RawImage[];
  }[];
}

export interface RawPagedProducts {
  content: RawProductResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  page: number;
}

// Matches the backend's own default on ProductResponseDto.returnPeriodDays. Only used when a
// response omits the field entirely — a real value always wins.
export const DEFAULT_RETURN_PERIOD_DAYS = 14

// Backend variants carry a colorFamily enum but no hex; map it to a representative swatch.
const COLOR_FAMILY_HEX: Record<string, string> = {
  BLACK: '#0A0A0A', WHITE: '#FFFFFF', GREY: '#9B9B9B', BEIGE: '#D9C9A8', BROWN: '#6B4F3A',
  RED: '#C01B1B', PINK: '#E89BB0', ORANGE: '#D9762B', YELLOW: '#E3C233', GREEN: '#2E7D4F',
  BLUE: '#2B4B8C', PURPLE: '#6C169C', MULTICOLOR: '#888888', METALLIC: '#B8B8C0', OTHER: '#6B6B6B',
};

export function adaptProduct(raw: RawProductResponse): ApiProduct {
  const variants = raw.variants ?? [];

  // Colourways. Prefer the backend's `colors[]` — it carries the real ProductColor id, which is
  // the join key for colourway-specific images. Fall back to deriving them from the variants
  // (first-seen order, id = variant id) for older responses that don't send `colors[]`.
  const rawColors = raw.colors ?? [];
  const colors = rawColors.map(c => ({
    id: c.id,
    color: c.color,
    colorFamily: c.colorFamily,
    sku: c.sku,
  }));
  const colourIdByName = new Map<string, number>(rawColors.map(c => [c.color, c.id]));

  const seenColor = new Set<string>();
  const colours = variants
    .filter(v => (seenColor.has(v.color) ? false : (seenColor.add(v.color), true)))
    .map(v => ({
      id: String(colourIdByName.get(v.color) ?? v.colorId ?? v.id),
      hex: COLOR_FAMILY_HEX[v.colorFamily] ?? '#6B6B6B',
      name: v.color,
      colorFamily: v.colorFamily,
    }));

  // Distinct sizes, first-seen order.
  const seenSize = new Set<string>();
  const sizes = variants.map(v => v.size).filter(s => (seenSize.has(s) ? false : (seenSize.add(s), true)));

  // Images: primary first, then displayOrder.
  const sortedImages = [...(raw.images ?? [])]
    .sort((a, b) => Number(b.primary) - Number(a.primary) || a.displayOrder - b.displayOrder);
  const images = sortedImages.map(i => i.imageUrl);
  // Same list, carrying each image's colourway link so the PDP can filter on colour selection.
  // Only emitted when at least one image reports colour metadata — otherwise consumers just use
  // `images` and the gallery behaves exactly as before.
  const anyColourMeta = sortedImages.some(i => i.productColorId != null || 'productColorId' in i);
  const imageObjects = anyColourMeta
    ? sortedImages.map(i => ({
        url: i.imageUrl,
        productColorId: i.productColorId ?? null,
        primary: i.primary,
      }))
    : undefined;

  return {
    id: String(raw.id),
    name: raw.name,
    brandName: raw.brandName,
    sku: variants[0]?.sku ?? '',
    slug: raw.slug,
    description: raw.description,
    // A null price means "no active listing" — keep the 0 for type compatibility but flag the
    // product unavailable so no caller renders it as 0,00 €.
    price: raw.price ?? 0,
    available: raw.price != null,
    // "On sale" is exactly `originalPrice != null`. The backend derives both numbers from the
    // one winning listing and never returns an original at or below `price`, so comparing them
    // here could only ever discard a legitimate markdown.
    originalPrice: raw.originalPrice ?? null,
    currency: 'EUR',
    // The backend populates this from the entity (verified live: "Herbst 2026"). It sends an
    // empty string for products with no collection, which is "unset", not a collection named "".
    collectionName: raw.collectionName || null,
    // Same treatment as collectionName: the backend sends "" for "unset", and an empty story is
    // not a story. The PDP used to hardcode this to null, so a brand's story never reached it.
    inspirationStory: raw.inspirationStory || null,
    releaseDate: raw.releaseDate || null,
    preview: raw.preview ?? false,
    category: (raw.category ?? '').toLowerCase(),
    gender: raw.gender,
    images,
    ...(imageObjects ? { imageObjects } : {}),
    colours,
    ...(colors.length > 0 ? { colors } : {}),
    sizes,
    // Carried through verbatim: `colours`/`sizes` above flatten these for swatches and filters
    // and drop stockQuantity, which the PDP needs to gate sold-out sizes.
    variants: variants.map(v => ({
      id: v.id,
      sku: v.sku,
      color: v.color,
      colorFamily: v.colorFamily,
      colorId: v.colorId ?? colourIdByName.get(v.color),
      size: v.size,
      stockQuantity: v.stockQuantity,
      weightGrams: v.weightGrams,
    })),
    // The brand sets this per product; the backend's own default is 14. Never hardcode a
    // different number in the UI — the PDP used to claim 30 days while the backend said 14.
    returnPeriodDays: raw.returnPeriodDays ?? DEFAULT_RETURN_PERIOD_DAYS,
    catalogue: (raw.catalogueCategory ?? []).map(c => c.toLowerCase()),
    status: raw.status as ApiProduct['status'],
    createdAt: raw.createdAt,
    details: { material: raw.material, care: raw.careInstructions, origin: raw.originCountry },
    // Deliberately NOT coerced to 0 like `price` above: a look card with no price simply
    // renders without one, so there is nothing to guard with an `available` flag.
    completeTheLookProducts: raw.completeTheLookProducts?.map(
      (c): ApiCompleteTheLookItem => ({
        id: String(c.id),
        name: c.name,
        brandName: c.brandName,
        slug: c.slug,
        price: c.price ?? null,
        originalPrice: c.originalPrice ?? null,
        // Production sends the cover as a single `image` string; fall back to it whenever the
        // richer `images` array is absent, otherwise every look card renders imageless.
        images: c.images?.length
          ? [...c.images]
              .sort((a, b) => Number(b.primary) - Number(a.primary) || a.displayOrder - b.displayOrder)
              .map(i => i.imageUrl)
          : c.image
            ? [c.image]
            : [],
      }),
    ),
  };
}
