import type { OrderStatus } from '@/types/api';

const CANCELLABLE_STATUSES: OrderStatus[] = [
  'PENDING',
  'PAID',
  'SHIPPING_PROBLEM',
  'AWAITING_ADMIN',
  'MANUAL_REVIEW',
];

export function canCancelOrder(status?: string): boolean {
  if (!status) return false;
  return CANCELLABLE_STATUSES.includes(status as OrderStatus);
}
