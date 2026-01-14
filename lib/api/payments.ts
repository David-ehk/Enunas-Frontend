import { apiFetch, getAuthHeaders } from './index';

export interface MolliePayment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: MolliePaymentStatus;
  checkoutUrl?: string;
  method?: string;
  createdAt: string;
  paidAt?: string;
}

export type MolliePaymentStatus =
  | 'open'
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'canceled'
  | 'expired';

export interface CreatePaymentRequest {
  orderId: string;
  redirectUrl: string;
}

export interface CreatePaymentResponse {
  payment: MolliePayment;
  checkoutUrl: string;
}

export async function createPayment(
  token: string,
  data: CreatePaymentRequest
): Promise<CreatePaymentResponse> {
  return apiFetch<CreatePaymentResponse>('/payments', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function getPaymentStatus(
  token: string,
  paymentId: string
): Promise<MolliePayment> {
  return apiFetch<MolliePayment>(`/payments/${paymentId}`, {
    headers: getAuthHeaders(token),
  });
}

export async function getPaymentByOrderId(
  token: string,
  orderId: string
): Promise<MolliePayment> {
  return apiFetch<MolliePayment>(`/payments/order/${orderId}`, {
    headers: getAuthHeaders(token),
  });
}

export async function getAvailablePaymentMethods(): Promise<string[]> {
  return apiFetch<string[]>('/payments/methods');
}
