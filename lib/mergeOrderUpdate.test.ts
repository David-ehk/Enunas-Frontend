import { describe, it, expect } from 'vitest';
import { mergeOrderUpdate } from './mergeOrderUpdate';
import type { ApiOrder } from '@/types/api';

function order(overrides: Partial<ApiOrder> = {}): ApiOrder {
  return {
    id: '1', status: 'PAID', currency: 'EUR', createdAt: 'x',
    items: [{ id: '1', quantity: 1, productName: 'Hoodie' }],
    shipments: [{ brandId: 1, brandName: 'A', status: 'AWAITING_SHIPMENT' }],
    ...overrides,
  };
}

describe('mergeOrderUpdate', () => {
  it('applies the patch fields over the current order', () => {
    const merged = mergeOrderUpdate(order(), { status: 'SHIPPED' });
    expect(merged.status).toBe('SHIPPED');
  });

  it('keeps the current items when the patch omits them (trimmed response)', () => {
    const current = order();
    const merged = mergeOrderUpdate(current, { status: 'SHIPPED', items: [] });
    expect(merged.items).toBe(current.items);
  });

  it('keeps the current shipments when the patch omits them (trimmed response)', () => {
    const current = order();
    const merged = mergeOrderUpdate(current, { status: 'SHIPPED', shipments: [] });
    expect(merged.shipments).toBe(current.shipments);
  });

  it('uses the patch items/shipments when the response actually carries them', () => {
    const current = order();
    const newItems = [{ id: '2', quantity: 2, productName: 'Tee' }];
    const newShipments = [{ brandId: 1, brandName: 'A', status: 'SHIPPED' as const }];
    const merged = mergeOrderUpdate(current, { items: newItems, shipments: newShipments });
    expect(merged.items).toBe(newItems);
    expect(merged.shipments).toBe(newShipments);
  });
});
