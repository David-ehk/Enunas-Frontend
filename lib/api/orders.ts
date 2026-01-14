import { apiFetch, getAuthHeaders } from './index';
import type { CartItem } from '@/app/context/CartContext';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  paymentId?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface CreateOrderRequest {
  items: CartItem[];
  shippingAddress: ShippingAddress;
}

export async function createOrder(
  token: string,
  orderData: CreateOrderRequest
): Promise<Order> {
  return apiFetch<Order>('/orders', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(orderData),
  });
}

export async function getOrders(token: string): Promise<Order[]> {
  return apiFetch<Order[]>('/orders', {
    headers: getAuthHeaders(token),
  });
}

export async function getOrderById(token: string, orderId: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}`, {
    headers: getAuthHeaders(token),
  });
}

export async function getOrderByTrackingNumber(trackingNumber: string): Promise<Order> {
  return apiFetch<Order>(`/orders/tracking/${trackingNumber}`);
}

export async function cancelOrder(token: string, orderId: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });
}
