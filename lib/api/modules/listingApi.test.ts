import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { listingApi } from './listingApi'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

const emptyPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 }

beforeEach(() => { vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test') })
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

describe('listingApi.list', () => {
  it('omits region entirely when not given — a missing filter means "any region"', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(emptyPage))
    vi.stubGlobal('fetch', spy)
    await listingApi.list()
    expect(spy.mock.calls[0][0]).toBe('https://api.test/listings')
  })

  it('sends region, page and size when given', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(emptyPage))
    vi.stubGlobal('fetch', spy)
    await listingApi.list({ region: 'DE', page: 1, size: 50 })
    expect(spy.mock.calls[0][0]).toBe('https://api.test/listings?region=DE&page=1&size=50')
  })

  it('normalises a legacy bare-array response into a page', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([{ id: '1', price: 10, createdAt: 'x' }])))
    const page = await listingApi.list()
    expect(page.content).toHaveLength(1)
    expect(page.totalElements).toBe(1)
  })
})
