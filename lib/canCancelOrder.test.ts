import { describe, it, expect } from 'vitest';
import { canCancelOrder } from './canCancelOrder';

describe('canCancelOrder', () => {
  it('returns true for cancellable statuses', () => {
    expect(canCancelOrder('PENDING')).toBe(true);
    expect(canCancelOrder('PAID')).toBe(true);
    expect(canCancelOrder('SHIPPING_PROBLEM')).toBe(true);
    expect(canCancelOrder('AWAITING_ADMIN')).toBe(true);
    expect(canCancelOrder('MANUAL_REVIEW')).toBe(true);
  });

  it('returns false for non-cancellable statuses', () => {
    expect(canCancelOrder('SHIPPED')).toBe(false);
    expect(canCancelOrder('PARTIALLY_SHIPPED')).toBe(false);
    expect(canCancelOrder('DELIVERED')).toBe(false);
    expect(canCancelOrder('RETURN_REQUESTED')).toBe(false);
    expect(canCancelOrder('RETURN_APPROVED')).toBe(false);
    expect(canCancelOrder('RETURN_RECEIVED')).toBe(false);
    expect(canCancelOrder('REFUNDED')).toBe(false);
    expect(canCancelOrder('CANCELLED')).toBe(false);
  });
});
