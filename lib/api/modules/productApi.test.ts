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

  it('keeps a preview product even though it is unavailable', () => {
    const result = sellableOnly(paged(3), [
      product({ id: '1' }),
      product({ id: '2', price: 0, available: false, preview: true }),
      product({ id: '3', price: 0, available: false }),
    ])
    expect(result.content.map(p => p.id)).toEqual(['1', '2'])
    expect(result.totalElements).toBe(2)
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

describe('productApi.listAll', () => {
  beforeEach(() => { vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test') })
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

  /** A backend with `total` sellable products that pages like the real one. */
  const backend = (total: number, failingPage?: number) => {
    const urls: URL[] = []
    vi.stubGlobal('fetch', vi.fn(async (input: string) => {
      const url = new URL(input)
      urls.push(url)
      const page = Number(url.searchParams.get('page') ?? 0)
      const size = Number(url.searchParams.get('size') ?? 20)
      if (page === failingPage) return new Response('{}', { status: 500 })
      const content = Array.from({ length: Math.max(0, Math.min(size, total - page * size)) }, (_, i) => ({
        id: page * size + i + 1, name: 'P', slug: 'p', price: 10, brandName: 'B',
        status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z', variants: [],
      }))
      return new Response(JSON.stringify({
        content, totalElements: total, totalPages: Math.ceil(total / size), size, page,
      }), { status: 200 })
    }))
    return urls
  }

  const ids = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => String(from + i))

  it('returns every product past the old 200 limit, in page order', async () => {
    const urls = backend(250)

    const all = await productApi.listAll()

    expect(all.map(p => String(p.id))).toEqual(ids(1, 250))
    expect(urls.map(u => u.searchParams.get('page'))).toEqual(['0', '1', '2'])
  })

  it('asks for batches of 100 in a fixed order, so pages cannot overlap', async () => {
    const urls = backend(150)

    await productApi.listAll()

    expect(urls).toHaveLength(2)
    for (const url of urls) {
      expect(url.pathname).toBe('/products')
      expect(url.searchParams.get('size')).toBe('100')
      expect(url.searchParams.get('sort')).toBe('id,asc')
    }
  })

  it('needs one request while the catalogue fits in one batch', async () => {
    const urls = backend(10)

    await expect(productApi.listAll()).resolves.toHaveLength(10)
    expect(urls).toHaveLength(1)
  })

  it('pages through search results too, not just the first 20', async () => {
    const urls = backend(130)

    await expect(productApi.listAll('black tee')).resolves.toHaveLength(130)
    expect(urls).toHaveLength(2)
    for (const url of urls) {
      expect(url.pathname).toBe('/products/search')
      expect(url.searchParams.get('keyword')).toBe('black tee')
    }
  })

  it('fails as a whole instead of returning part of the catalogue', async () => {
    backend(250, 1)

    await expect(productApi.listAll()).rejects.toThrow()
  })
})
