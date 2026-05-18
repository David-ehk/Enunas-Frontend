import { fetcher } from '../fetcher';
import type {
  ApiProduct,
  ApiProductsResponse,
  ApiListing,
  ApiVariant,
  ApiImage,
  CreateListingRequest,
  CreateVariantRequest,
  CreateProductRequest,
} from '../../types/api';

export interface ProductSearchParams {
  q?: string;
  category?: string;
  page?: number;
  size?: number;
}

type QsRecord = { [key: string]: string | number | undefined };

function buildQs(params?: QsRecord): string {
  if (!params) return '';
  const entries: [string, string][] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) entries.push([k, String(v)]);
  }
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries).toString();
}

export const productApi = {
  async list(params?: ProductSearchParams): Promise<ApiProductsResponse> {
    const qs = params ? buildQs(params as QsRecord) : '';
    return fetcher<ApiProductsResponse>(`/products${qs}`, { auth: false });
  },

  async getById(id: string): Promise<ApiProduct> {
    return fetcher<ApiProduct>(`/products/${id}`, { auth: false });
  },

  async getBySku(sku: string): Promise<ApiProduct> {
    return fetcher<ApiProduct>(`/products/sku/${sku}`, { auth: false });
  },

  async search(query: string, params?: Omit<ProductSearchParams, 'q'>): Promise<ApiProductsResponse> {
    const merged: QsRecord = { q: query, ...(params as QsRecord) };
    return fetcher<ApiProductsResponse>(
      `/products/search${buildQs(merged)}`,
      { auth: false }
    );
  },

  async getByCategory(category: string): Promise<ApiProductsResponse> {
    return fetcher<ApiProductsResponse>(`/products/category/${encodeURIComponent(category)}`, { auth: false });
  },

  async getMy(): Promise<ApiProduct[]> {
    return fetcher<ApiProduct[]>('/products/my');
  },

  async create(data: CreateProductRequest): Promise<ApiProduct> {
    return fetcher<ApiProduct>('/products/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<CreateProductRequest>): Promise<ApiProduct> {
    return fetcher<ApiProduct>(`/products/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return fetcher<void>(`/products/delete/${id}`, { method: 'DELETE' });
  },

  async getListings(productId: string): Promise<ApiListing[]> {
    return fetcher<ApiListing[]>(`/products/${productId}/listings`, { auth: false });
  },

  async createListing(productId: string, data: CreateListingRequest): Promise<ApiListing> {
    return fetcher<ApiListing>(`/products/${productId}/listings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateListing(productId: string, listingId: string, data: Partial<CreateListingRequest>): Promise<ApiListing> {
    return fetcher<ApiListing>(`/products/${productId}/listings/${listingId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteListing(productId: string, listingId: string): Promise<void> {
    return fetcher<void>(`/products/${productId}/listings/${listingId}`, { method: 'DELETE' });
  },

  async getVariants(productId: string): Promise<ApiVariant[]> {
    return fetcher<ApiVariant[]>(`/products/${productId}/variants`, { auth: false });
  },

  async createVariant(productId: string, data: CreateVariantRequest): Promise<ApiVariant> {
    return fetcher<ApiVariant>(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateVariant(productId: string, variantId: string, data: Partial<CreateVariantRequest>): Promise<ApiVariant> {
    return fetcher<ApiVariant>(`/products/${productId}/variants/${variantId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    return fetcher<void>(`/products/${productId}/variants/${variantId}`, { method: 'DELETE' });
  },

  async getImages(productId: string): Promise<ApiImage[]> {
    return fetcher<ApiImage[]>(`/products/${productId}/media/images`, { auth: false });
  },

  async uploadImage(productId: string, file: File): Promise<ApiImage> {
    const form = new FormData();
    form.append('file', file);
    return fetcher<ApiImage>(`/products/${productId}/media/images`, {
      method: 'POST',
      skipContentType: true,
      body: form,
    });
  },

  async deleteImage(productId: string, imageId: string): Promise<void> {
    return fetcher<void>(`/products/${productId}/media/images/${imageId}`, { method: 'DELETE' });
  },
};
