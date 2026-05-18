import { fetcher } from './fetcher';

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

export async function createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
  return fetcher<CreatePaymentResponse>('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPaymentStatus(paymentId: string): Promise<MolliePayment> {
  return fetcher<MolliePayment>(`/payments/${paymentId}`);
}

export async function getPaymentByOrderId(orderId: string): Promise<MolliePayment> {
  return fetcher<MolliePayment>(`/payments/order/${orderId}`);
}

export async function getAvailablePaymentMethods(): Promise<string[]> {
  return fetcher<string[]>('/payments/methods', { auth: false });
}
