import { fetcher } from '../fetcher';
import type { ApiWardrobeItem } from '@/types/api';

export const wardrobeApi = {
  async getAll(): Promise<ApiWardrobeItem[]> {
    return fetcher<ApiWardrobeItem[]>('/wardrobe');
  },

  async add(productId: string): Promise<ApiWardrobeItem> {
    return fetcher<ApiWardrobeItem>('/wardrobe', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  async remove(id: string): Promise<void> {
    return fetcher<void>(`/wardrobe/${id}`, { method: 'DELETE' });
  },
};
