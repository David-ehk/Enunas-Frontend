import { describe, it, expect } from 'vitest';
import { describeOrderItem } from './orderItemDisplay';
import type { ApiOrderItem } from '@/types/api';

function item(overrides: Partial<ApiOrderItem> = {}): ApiOrderItem {
  return { id: '1', quantity: 1, ...overrides };
}

describe('describeOrderItem — label', () => {
  it('prefers the backend productName over the legacy name', () => {
    expect(describeOrderItem(item({ productName: 'E2E Alpha Hoodie', name: 'legacy' })).label).toBe('E2E Alpha Hoodie');
  });
  it('falls back to the legacy name for pre-connect mock data', () => {
    expect(describeOrderItem(item({ name: 'Mock Tee' })).label).toBe('Mock Tee');
  });
  it('falls back to an em-dash when neither is present', () => {
    expect(describeOrderItem(item()).label).toBe('—');
  });
});

describe('describeOrderItem — size / color / variant', () => {
  it('prefers backend variantSize/variantColor over legacy size/color', () => {
    const d = describeOrderItem(item({ variantSize: 'M', size: 'S', variantColor: 'BLACK', color: 'WHITE' }));
    expect(d.size).toBe('M');
    expect(d.color).toBe('BLACK');
    expect(d.variant).toBe('M · BLACK');
  });
  it('falls back to legacy size/color for pre-connect mock data', () => {
    const d = describeOrderItem(item({ size: 'L', color: 'RED' }));
    expect(d.size).toBe('L');
    expect(d.color).toBe('RED');
    expect(d.variant).toBe('L · RED');
  });
  it('joins only the pieces that are present', () => {
    expect(describeOrderItem(item({ variantSize: 'M' })).variant).toBe('M');
    expect(describeOrderItem(item({ variantColor: 'BLACK' })).variant).toBe('BLACK');
  });
  it('is undefined when neither size nor color is present', () => {
    expect(describeOrderItem(item()).variant).toBeUndefined();
  });
});

describe('describeOrderItem — pricing', () => {
  it('prefers discountPriceAtPurchase, then priceAtPurchase, then the legacy price', () => {
    expect(describeOrderItem(item({ discountPriceAtPurchase: 8, priceAtPurchase: 10, price: 12 })).unitPrice).toBe(8);
    expect(describeOrderItem(item({ priceAtPurchase: 10, price: 12 })).unitPrice).toBe(10);
    expect(describeOrderItem(item({ price: 12 })).unitPrice).toBe(12);
  });
  it('prefers the backend lineTotal over unitPrice × quantity', () => {
    expect(describeOrderItem(item({ lineTotal: 99, priceAtPurchase: 10, quantity: 3 })).lineTotal).toBe(99);
  });
  it('falls back to unitPrice × quantity when lineTotal is absent', () => {
    expect(describeOrderItem(item({ priceAtPurchase: 10, quantity: 3 })).lineTotal).toBe(30);
  });
  it('leaves lineTotal undefined when there is no price to compute it from', () => {
    expect(describeOrderItem(item()).lineTotal).toBeUndefined();
  });
});
