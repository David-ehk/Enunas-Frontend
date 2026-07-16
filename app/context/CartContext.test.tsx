import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from './CartContext'

const sampleItem = {
  productId: 'p1',
  name: 'Tee',
  brand: 'Brand',
  price: 20,
  currency: 'EUR',
  size: 'M',
  color: { id: 'c1', name: 'Black', hex: '#000' },
  image: '',
}

beforeEach(() => {
  localStorage.clear()
})

describe('CartProvider', () => {
  it('adds an item and exposes count/total', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider })
    act(() => result.current.addToCart(sampleItem))
    expect(result.current.itemCount).toBe(1)
    expect(result.current.totalPrice).toBe(20)
  })

  it('collapses a duplicate product+size+colour into one line with quantity 2', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider })
    act(() => result.current.addToCart(sampleItem))
    act(() => result.current.addToCart(sampleItem))
    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.itemCount).toBe(2)
  })

  it('persists an empty array to localStorage after the last item is removed', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider })
    act(() => result.current.addToCart(sampleItem))
    const id = result.current.cartItems[0].id
    expect(localStorage.getItem('cart')).not.toBe('[]')

    act(() => result.current.removeFromCart(id))
    expect(result.current.cartItems).toHaveLength(0)
    // The hydration-guard fix: removing the last item must clear storage, not leave a stale cart.
    expect(localStorage.getItem('cart')).toBe('[]')
  })
})
