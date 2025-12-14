// Product Interface
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  images: ProductImage[];
  colors: ColorVariant[];
  sizes: string[];
}

export interface ColorVariant {
  id: string;
  name: string;
  hex: string;
  sku: string;  // ← Wichtig für deine SKU-Logik
  images: string[];
}

export interface ProductImage {
  url: string;
  alt: string;
  order: number;
}