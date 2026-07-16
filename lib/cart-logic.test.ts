import { describe, it, expect } from 'vitest'
import { cartItemCount, cartTotal, cartDedupKey, addItem, updateQty, removeItem } from './cart-logic'
import type { CartItem } from '@/app/context/CartContext'

function line(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 'l1',
    productId: 'p1',
    name: 'Tee',
    brand: 'Brand',
    price: 20,
    currency: 'EUR',
    size: 'M',
    color: { id: 'c1', name: 'Black', hex: '#000' },
    image: '',
    quantity: 1,
    ...overrides,
  }
}

const newItem = (o: Partial<Omit<CartItem, 'id' | 'quantity'>> = {}): Omit<CartItem, 'id' | 'quantity'> => {
  const { id: _id, quantity: _q, ...rest } = line(o as Partial<CartItem>)
  void _id; void _q
  return rest
}

describe('cartItemCount / cartTotal', () => {
  it('sums quantities and price×quantity', () => {
    const items = [line({ id: 'a', price: 20, quantity: 2 }), line({ id: 'b', price: 5, quantity: 3 })]
    expect(cartItemCount(items)).toBe(5)
    expect(cartTotal(items)).toBe(20 * 2 + 5 * 3)
  })

  it('is 0 for an empty cart', () => {
    expect(cartItemCount([])).toBe(0)
    expect(cartTotal([])).toBe(0)
  })
})

describe('cartDedupKey', () => {
  it('keys on product + size + colour id', () => {
    expect(cartDedupKey({ productId: 'p1', size: 'M', color: { id: 'c1', name: 'x', hex: '#000' } }))
      .toBe('p1-M-c1')
  })

  it('uses "default" when colour is absent', () => {
    expect(cartDedupKey({ productId: 'p1', size: 'M', color: undefined })).toBe('p1-M-default')
  })
})

describe('addItem', () => {
  it('appends a new line with a deterministic id (injected suffix)', () => {
    const result = addItem([], newItem(), () => 'X')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('p1-M-c1-X')
    expect(result[0].quantity).toBe(1)
  })

  it('increments quantity when the same product+size+colour is added again', () => {
    const first = addItem([], newItem(), () => 'X')
    const second = addItem(first, newItem(), () => 'Y')
    expect(second).toHaveLength(1)
    expect(second[0].quantity).toBe(2)
  })

  it('keeps distinct lines for different size or colour', () => {
    const a = addItem([], newItem({ size: 'M' }), () => 'X')
    const b = addItem(a, newItem({ size: 'L' }), () => 'Y')
    expect(b).toHaveLength(2)
  })
})

describe('updateQty / removeItem', () => {
  it('updates a line quantity', () => {
    const items = [line({ id: 'a', quantity: 1 })]
    expect(updateQty(items, 'a', 4)[0].quantity).toBe(4)
  })

  it('removes the line when quantity drops to 0 or below', () => {
    const items = [line({ id: 'a' }), line({ id: 'b' })]
    expect(updateQty(items, 'a', 0).map(i => i.id)).toEqual(['b'])
    expect(updateQty(items, 'a', -1).map(i => i.id)).toEqual(['b'])
  })

  it('removeItem drops the matching line', () => {
    const items = [line({ id: 'a' }), line({ id: 'b' })]
    expect(removeItem(items, 'a').map(i => i.id)).toEqual(['b'])
  })
})
