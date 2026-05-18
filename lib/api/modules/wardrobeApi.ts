import { fetcher } from '../fetcher';
import type { ApiWardrobeItem } from '../../../types/api';

export const wardrobeApi = {
  async add(productId: string): Promise<ApiWardrobeItem> {
    return fetcher<ApiWardrobeItem>('/wardrobe', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  async getAll(signal?: AbortSignal): Promise<ApiWardrobeItem[]> {
    return fetcher<ApiWardrobeItem[]>('/wardrobe', { signal });
  },

  async remove(id: string): Promise<void> {
    return fetcher<void>(`/wardrobe/${id}`, { method: 'DELETE' });
  },
};
