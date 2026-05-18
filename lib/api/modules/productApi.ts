import { fetcher } from '../fetcher';
import type {
  ApiProduct,
  ApiProductsResponse,
  ApiListing,
  ApiVariant,
  ApiImage,
  CreateProductRequest,
} from '../../../types/api';

export interface ProductSearchParams {
  page?: number;
  size?: number;
  category?: string;
  [key: string]: string | number | undefined;
}

type QsRecord = { [key: string]: string | number | undefined };

function buildQs(params: QsRecord): string {
  const p = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined) p.set(key, String(val));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const productApi = {
  async list(params?: ProductSearchParams, signal?: AbortSignal): Promise<ApiProductsResponse> {
    // TODO: Replace size:100 with pagination when backend supports cursor/infinite scroll
    return fetcher<ApiProductsResponse>(`/products${buildQs((params ?? {}) as QsRecord)}`, { signal });
  },

  async getById(id: string, signal?: AbortSignal): Promise<ApiProduct> {
    return fetcher<ApiProduct>(`/products/${id}`, { signal });
  },

  async getBySku(sku: string, signal?: AbortSignal): Promise<ApiProduct> {
    return fetcher<ApiProduct>(`/products/sku/${sku}`, { signal });
  },

  async search(keyword: string, params?: ProductSearchParams, signal?: AbortSignal): Promise<ApiProductsResponse> {
    return fetcher<ApiProductsResponse>(
      `/products/search${buildQs({ keyword, ...(params as QsRecord) })}`,
      { signal }
    );
  },

  async getByCategory(category: string, params?: ProductSearchParams, signal?: AbortSignal): Promise<ApiProductsResponse> {
    return fetcher<ApiProductsResponse>(
      `/products/category/${encodeURIComponent(category)}${buildQs((params ?? {}) as QsRecord)}`,
      { signal }
    );
  },

  async getMy(signal?: AbortSignal): Promise<ApiProduct[]> {
    return fetcher<ApiProduct[]>('/products/my', { signal });
  },

  async create(data: CreateProductRequest): Promise<ApiProduct> {
    return fetcher<ApiProduct>('/products/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<ApiProduct>): Promise<ApiProduct> {
    return fetcher<ApiProduct>(`/products/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return fetcher<void>(`/products/delete/${id}`, { method: 'DELETE' });
  },

  async getListings(productId: string, signal?: AbortSignal): Promise<ApiListing[]> {
    return fetcher<ApiListing[]>(`/products/${productId}/listings`, { signal });
  },

  async createListing(productId: string, data: Partial<ApiListing>): Promise<ApiListing> {
    return fetcher<ApiListing>(`/products/${productId}/listings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateListing(productId: string, listingId: string, data: Partial<ApiListing>): Promise<ApiListing> {
    return fetcher<ApiListing>(`/products/${productId}/listings/${listingId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteListing(productId: string, listingId: string): Promise<void> {
    return fetcher<void>(`/products/${productId}/listings/${listingId}`, { method: 'DELETE' });
  },

  async getVariants(productId: string, signal?: AbortSignal): Promise<ApiVariant[]> {
    return fetcher<ApiVariant[]>(`/products/${productId}/variants`, { signal });
  },

  async createVariant(productId: string, data: Partial<ApiVariant>): Promise<ApiVariant> {
    return fetcher<ApiVariant>(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateVariant(productId: string, variantId: string, data: Partial<ApiVariant>): Promise<ApiVariant> {
    return fetcher<ApiVariant>(`/products/${productId}/variants/${variantId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    return fetcher<void>(`/products/${productId}/variants/${variantId}`, { method: 'DELETE' });
  },

  async getImages(productId: string, signal?: AbortSignal): Promise<ApiImage[]> {
    return fetcher<ApiImage[]>(`/products/${productId}/media/images`, { signal });
  },

  async uploadImage(productId: string, file: File): Promise<ApiImage> {
    const form = new FormData();
    form.append('file', file);
    return fetcher<ApiImage>(`/products/${productId}/media/images`, {
      method: 'POST',
      body: form,
      skipContentType: true,
    });
  },

  async deleteImage(productId: string, imageId: string): Promise<void> {
    return fetcher<void>(`/products/${productId}/media/images/${imageId}`, { method: 'DELETE' });
  },
};
