export type Gender = 'UNISEX' | 'MEN' | 'WOMEN' | null;
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export interface Variant {
  color: string;
  /** ProductColor id — the join key for colourway-specific gallery images. */
  colorId?: number;
  id: number;
  size: string;
  sku: string;
  stockQuantity: number;
  weightGrams: number;
}

/** A gallery image with its colourway link. `productColorId === null` = shared (all colourways). */
export interface ProductImageObject {
  url: string;
  productColorId: number | null;
  primary: boolean;
}

export interface Product {
  brandId: number;
  brandName: string;
  careInstructions: string | null;
  catalogueCategory: string[] | null;
  category: string;
  collectionName: string | null;
  createdAt: string;
  creatorEmail: string;
  creatorId: number;
  description: string;
  gender: Gender;
  id: number;
  images: string[];
  /** Present once the backend returns per-image colour metadata; the gallery filters this by the
   *  selected colourway. Absent → gallery shows `images` unchanged. */
  imageObjects?: ProductImageObject[];
  inspirationStory: string | null;
  material: string;
  name: string;
  originCountry: string;
  releaseDate: string | null;
  returnPeriodDays: number;
  status: ProductStatus;
  updatedAt: string;
  variants: Variant[];
  videos: string[];
}

export const uniqueColors = (variants: Variant[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of variants) {
    if (!seen.has(v.color)) { seen.add(v.color); out.push(v.color); }
  }
  return out;
};

export const findVariant = (
  variants: Variant[],
  color: string | null,
  size: string | null
): Variant | undefined =>
  variants.find((v) => v.color === color && v.size === size);

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export const sortedSizes = (variants: Variant[]): string[] => {
  const present = new Set(variants.map((v) => v.size));
  return SIZE_ORDER.filter((s) => present.has(s));
};
