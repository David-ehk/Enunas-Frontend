import { apiFetch, getAuthHeaders } from './index';
import type { CartItem } from '@/app/context/CartContext';

export interface ServerCart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export async function getCart(token: string): Promise<ServerCart> {
  return apiFetch<ServerCart>('/cart', {
    headers: getAuthHeaders(token),
  });
}

export async function addToCart(
  token: string,
  item: Omit<CartItem, 'id' | 'quantity'>
): Promise<ServerCart> {
  return apiFetch<ServerCart>('/cart/items', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(item),
  });
}

export async function updateCartItem(
  token: string,
  itemId: string,
  quantity: number
): Promise<ServerCart> {
  return apiFetch<ServerCart>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromCart(token: string, itemId: string): Promise<ServerCart> {
  return apiFetch<ServerCart>(`/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
}

export async function clearCart(token: string): Promise<void> {
  await apiFetch<void>('/cart', {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
}

export async function syncCart(token: string, items: CartItem[]): Promise<ServerCart> {
  return apiFetch<ServerCart>('/cart/sync', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ items }),
  });
}
