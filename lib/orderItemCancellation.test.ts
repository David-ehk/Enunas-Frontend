import { describe, it, expect } from 'vitest';
import { isItemActive, hasNonActiveItems, allItemsCancelled, canReconcileItem } from './orderItemCancellation';
import type { ApiOrderItem } from '@/types/api';

function item(overrides: Partial<ApiOrderItem> = {}): ApiOrderItem {
  return { id: '1', quantity: 1, ...overrides };
}

describe('isItemActive', () => {
  it('treats an item with no cancellationState as active (predates the feature)', () => {
    expect(isItemActive(item())).toBe(true);
  });
  it('treats ACTIVE as active', () => {
    expect(isItemActive(item({ cancellationState: 'ACTIVE' }))).toBe(true);
  });
  it('treats PENDING and CANCELLED as not active', () => {
    expect(isItemActive(item({ cancellationState: 'PENDING' }))).toBe(false);
    expect(isItemActive(item({ cancellationState: 'CANCELLED' }))).toBe(false);
  });
});

describe('hasNonActiveItems', () => {
  it('is false when every item is active', () => {
    expect(hasNonActiveItems([item(), item({ cancellationState: 'ACTIVE' })])).toBe(false);
  });
  it('is true when any item is PENDING or CANCELLED', () => {
    expect(hasNonActiveItems([item(), item({ cancellationState: 'CANCELLED' })])).toBe(true);
  });
  it('is false for an empty or undefined list', () => {
    expect(hasNonActiveItems(undefined)).toBe(false);
    expect(hasNonActiveItems([])).toBe(false);
  });
});

describe('allItemsCancelled', () => {
  it('is true only when every item is CANCELLED', () => {
    expect(allItemsCancelled([
      item({ cancellationState: 'CANCELLED' }),
      item({ cancellationState: 'CANCELLED' }),
    ])).toBe(true);
  });
  it('is false when at least one item is active or pending', () => {
    expect(allItemsCancelled([item({ cancellationState: 'CANCELLED' }), item()])).toBe(false);
  });
  it('is false for an empty order', () => {
    expect(allItemsCancelled([])).toBe(false);
  });
});

describe('canReconcileItem', () => {
  const now = new Date('2026-09-29T12:00:00Z').getTime();

  it('is false when the item is not PENDING', () => {
    expect(canReconcileItem(item({ cancellationState: 'ACTIVE' }), now)).toBe(false);
    expect(canReconcileItem(item({ cancellationState: 'CANCELLED', cancelledAt: new Date(now).toISOString() }), now)).toBe(false);
  });
  it('is false when PENDING but claimed less than 5 minutes ago', () => {
    const cancelledAt = new Date(now - 4 * 60 * 1000).toISOString();
    expect(canReconcileItem(item({ cancellationState: 'PENDING', cancelledAt }), now)).toBe(false);
  });
  it('is true when PENDING and claimed exactly 5 minutes ago', () => {
    const cancelledAt = new Date(now - 5 * 60 * 1000).toISOString();
    expect(canReconcileItem(item({ cancellationState: 'PENDING', cancelledAt }), now)).toBe(true);
  });
  it('is false when PENDING but has no cancelledAt timestamp', () => {
    expect(canReconcileItem(item({ cancellationState: 'PENDING' }), now)).toBe(false);
  });
});
