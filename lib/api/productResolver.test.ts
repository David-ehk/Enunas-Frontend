import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FetchError } from './fetcher'

// Mock only `fetcher`; keep the real FetchError class so `instanceof` checks in the resolver
// work against the same constructor the test throws.
vi.mock('./fetcher', async (importActual) => {
  const actual = await importActual<typeof import('./fetcher')>()
  return { ...actual, fetcher: vi.fn() }
})

import { fetcher } from './fetcher'
import { resolveProductBySlug } from './productResolver'

const mockFetcher = vi.mocked(fetcher)

beforeEach(() => {
  mockFetcher.mockReset()
})

// NODE_ENV is 'test' here, so the dev mock fallback is disabled — this exercises the
// production-like path (genuine 404 → null, any other error → rethrow).
describe('resolveProductBySlug', () => {
  it('returns null for a genuine 404 (product really does not exist)', async () => {
    mockFetcher.mockRejectedValue(new FetchError(404, 'not found'))
    await expect(resolveProductBySlug('ghost')).resolves.toBeNull()
  })

  it('rethrows on a 500 so a backend error does not masquerade as a 404', async () => {
    mockFetcher.mockRejectedValue(new FetchError(500, 'boom'))
    await expect(resolveProductBySlug('waterfall')).rejects.toThrow(/boom/)
  })

  it('rethrows a non-FetchError (network/timeout) rather than swallowing it', async () => {
    mockFetcher.mockRejectedValue(new TypeError('fetch failed'))
    await expect(resolveProductBySlug('waterfall')).rejects.toThrow(/fetch failed/)
  })

  it('adapts and returns the product on success', async () => {
    mockFetcher.mockResolvedValue({
      id: 1, name: 'Waterfall', slug: 'waterfall', price: 49.95, brandName: 'B',
      category: 'CLOTHING', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z',
      variants: [], images: [],
    })
    const p = await resolveProductBySlug('waterfall')
    expect(p?.slug).toBe('waterfall')
    expect(p?.price).toBe(49.95)
  })
})
