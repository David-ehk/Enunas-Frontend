import { fetcher } from '../fetcher';
import type { ApiOrder, ApiPage, ReturnReason, ShippingSnapshot, ShippingCalculationMethod } from '@/types/api';

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

// A preview's shipping line has the exact same shape as an order's frozen snapshot — see
// ShippingSnapshot/ShippingCalculationMethod in @/types/api. Re-exported here so callers that
// only import from orderApi.ts (the preview call site) don't also need types/api.ts.
export type { ShippingSnapshot, ShippingCalculationMethod };
export type ShippingBreakdownLine = ShippingSnapshot;

export interface OrderPreviewItem {
  listingId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
}

// Mirrors backend OrderPreviewResponseDto (POST /orders/preview). Runs the exact same pricing
// pipeline as POST /orders — guaranteed to match what gets charged — but does not reserve a
// discount code's usage; only the real order-creation call does that.
export interface OrderPreviewResponseDto {
  items: OrderPreviewItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount?: number;
  shippingBreakdown: ShippingBreakdownLine[];
  shippingTotal: number;
  total: number;
  currency: string;
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

  // Same body as create() — runs the identical pricing pipeline so the checkout summary it
  // renders is guaranteed to match what create() actually charges.
  async preview(dto: CreateOrderDto): Promise<OrderPreviewResponseDto> {
    return fetcher<OrderPreviewResponseDto>('/orders/preview', { method: 'POST', body: JSON.stringify(dto) });
  },

  async requestReturn(orderId: string | number, dto: ReturnRequestDto): Promise<ApiOrder> {
    return fetcher<ApiOrder>(`/orders/${orderId}/return`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
};
