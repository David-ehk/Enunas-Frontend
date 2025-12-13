// lib/product.ts
export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  currency: string;
  colors: ProductColor[];
  sizes: string[];
  sku: string;
  images: string[];
  category: string[];
  details: ProductDetails;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  slug: string;
}

export interface ProductDetails {
  material?: string;
  care?: string;
  origin?: string;
  [key: string]: string | undefined;
}

// Slug-Generierungsfunktion
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}
 