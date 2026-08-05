import { fetcher } from '../fetcher';
import type { ApiOrder, ApiPage, ReturnReason } from '@/types/api';

// Mirrors backend OrderItemRequestDto
interface CreateOrderItemDto {
  listingId: number;
  quantity: number;
}

// Mirrors backend ShippingAddressDto exactly — same fields as UserAddressDto (see addressApi.ts)
// plus an optional phone. Not the saved-address shape: this is the ad-hoc, one-time-entry path.
export interface ShippingAddressDto {
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  country: string;
  phone?: string;
}

// Mirrors backend CreateOrderDto. @ExactlyOneAddressSource on the backend enforces exactly one
// of shippingAddress / savedAddressId — never both, never neither.
export interface CreateOrderDto {
  items: CreateOrderItemDto[];
  shippingAddress?: ShippingAddressDto;
  savedAddressId?: number;
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
