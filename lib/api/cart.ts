import { fetcher } from './fetcher';
import type { CartItem } from '@/app/context/CartContext';

export interface ServerCart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export async function getCart(): Promise<ServerCart> {
  return fetcher<ServerCart>('/cart');
}

export async function addToServerCart(item: Omit<CartItem, 'id' | 'quantity'>): Promise<ServerCart> {
  return fetcher<ServerCart>('/cart/items', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function updateCartItem(itemId: string, quantity: number): Promise<ServerCart> {
  return fetcher<ServerCart>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromServerCart(itemId: string): Promise<ServerCart> {
  return fetcher<ServerCart>(`/cart/items/${itemId}`, { method: 'DELETE' });
}

export async function clearServerCart(): Promise<void> {
  return fetcher<void>('/cart', { method: 'DELETE' });
}

export async function syncCart(items: CartItem[]): Promise<ServerCart> {
  return fetcher<ServerCart>('/cart/sync', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}
