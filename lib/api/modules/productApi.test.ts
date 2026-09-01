import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sellableOnly, productApi } from './productApi'
import type { ApiProduct } from '@/types/api'
import type { RawPagedProducts } from '../productResponseAdapter'

// A product whose listing has been deactivated comes back from the backend with a null price,
// which the adapter flags as `available: false`. The storefront must not merchandise it: before
// this filter existed it rendered in the PLP priced at 0,00 € and could still be added to the
// basket, only failing at checkout with "Listing is not active".

const product = (over: Partial<ApiProduct> = {}): ApiProduct => ({
  id: '1',
  name: 'E2E Alpha Hoodie',
  brandName: 'Brand A',
  sku: 'SKU-1',
  slug: 'e2e-alpha-hoodie',
  price: 89.95,
  available: true,
  category: 'clothing',
  images: [],
  colours: [],
  sizes: ['M'],
  status: 'APPROVED',
  createdAt: '2026-01-01T00:00:00Z',
  ...over,
})

const paged = (totalElements: number): RawPagedProducts => ({
  content: [],
  totalElements,
  totalPages: 1,
  size: 20,
  page: 0,
})

describe('sellableOnly', () => {
  it('drops products that have no active listing', () => {
    const result = sellableOnly(paged(3), [
      product({ id: '1' }),
      product({ id: '2', price: 0, available: false }),
      product({ id: '3' }),
    ])
    expect(result.content.map(p => p.id)).toEqual(['1', '3'])
  })

  it('never surfaces a 0,00 € placeholder price', () => {
    const result = sellableOnly(paged(2), [
      product({ id: '1' }),
      product({ id: '2', price: 0, available: false }),
    ])
    expect(result.content.every(p => p.price > 0)).toBe(true)
  })

  it('adjusts totalElements so the "N ARTIKEL" count matches what is shown', () => {
    const result = sellableOnly(paged(3), [
      product({ id: '1' }),
      product({ id: '2', price: 0, available: false }),
      product({ id: '3', price: 0, available: false }),
    ])
    expect(result.content).toHaveLength(1)
    expect(result.totalElements).toBe(1)
  })

  it('leaves a fully sellable page untouched', () => {
    const content = [product({ id: '1' }), product({ id: '2' })]
    const result = sellableOnly(paged(2), content)
    expect(result.content).toEqual(content)
    expect(result.totalElements).toBe(2)
  })

  it('does not drive totalElements negative', () => {
    const result = sellableOnly(paged(0), [product({ id: '1', price: 0, available: false })])
    expect(result.totalElements).toBe(0)
  })
})

describe('productApi.getListings', () => {
  beforeEach(() => { vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test') })
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

  it('returns the array as-is', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: '1', price: 10, createdAt: 'x' }]), { status: 200 }),
    ))
    await expect(productApi.getListings('7')).resolves.toHaveLength(1)
  })

  it('unwraps a paged response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ content: [{ id: '1', price: 10, createdAt: 'x' }] }), { status: 200 }),
    ))
    await expect(productApi.getListings('7')).resolves.toHaveLength(1)
  })

  it('returns an empty list for a hidden product', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 })))
    await expect(productApi.getListings('7')).resolves.toEqual([])
  })
})
