// Backend response shape from /api/products/[id]
// Matches the exact JSON your backend returns.

export type Gender = 'UNISEX' | 'MEN' | 'WOMEN' | null;
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export interface Variant {
  color: string;
  id: number;
  size: string;
  sku: string;
  stockQuantity: number;
  weightGrams: number;
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

// Helpers — keep these in a util module if you prefer.

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
