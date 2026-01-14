import { apiFetch } from './index';
import type { Product } from '../product';

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
  }
  const query = params.toString();
  return apiFetch<ProductsResponse>(`/products${query ? `?${query}` : ''}`);
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return apiFetch<Product>(`/products/slug/${slug}`);
}

export async function getProductById(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

export async function getProductsByCategory(
  category: string,
  subcategory?: string
): Promise<ProductsResponse> {
  const params = new URLSearchParams({ category });
  if (subcategory) params.append('subcategory', subcategory);
  return apiFetch<ProductsResponse>(`/products?${params.toString()}`);
}

export async function searchProducts(query: string): Promise<ProductsResponse> {
  return apiFetch<ProductsResponse>(`/products/search?q=${encodeURIComponent(query)}`);
}
