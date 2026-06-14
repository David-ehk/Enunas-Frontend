import { fetcher } from '../fetcher';
import type { ApiOrder, ApiPage, ReturnReason } from '@/types/api';

// Mirrors backend OrderItemRequestDto
interface CreateOrderItemDto {
  listingId: number;
  quantity: number;
}

// Mirrors backend ShippingAddressDto
interface ShippingAddressDto {
  fullName: string;
  street: string;
  street2?: string;
  city: string;
  postalCode: string;
  country: string;
  state?: string;
  phone?: string;
}

// Mirrors backend CreateOrderDto
export interface CreateOrderDto {
  items: CreateOrderItemDto[];
  shippingAddress: ShippingAddressDto;
  notes?: string;
  discountCode?: string;
}

// Mirrors backend ReturnRequestDto
export interface ReturnRequestDto {
  orderItemId?: number;
  reason: ReturnReason;
  description?: string;
}

export const orderApi = {
  async getMyOrders(page = 0, size = 10): Promise<ApiPage<ApiOrder>> {
    return fetcher<ApiPage<ApiOrder>>(`/orders/me?page=${page}&size=${size}`);
  },

  async getById(orderId: string | number): Promise<ApiOrder> {
    return fetcher<ApiOrder>(`/orders/${orderId}`);
  },

  async create(dto: CreateOrderDto): Promise<ApiOrder> {
    return fetcher<ApiOrder>('/orders', { method: 'POST', body: JSON.stringify(dto) });
  },

  async requestReturn(orderId: string | number, dto: ReturnRequestDto): Promise<ApiOrder> {
    return fetcher<ApiOrder>(`/orders/${orderId}/return`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
};
