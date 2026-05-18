import { fetcher } from './fetcher';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface LegacyOrder {
  id: string;
  userId: string;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  paymentId?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getOrderByTrackingNumber(trackingNumber: string): Promise<LegacyOrder> {
  return fetcher<LegacyOrder>(`/orders/tracking/${trackingNumber}`);
}
