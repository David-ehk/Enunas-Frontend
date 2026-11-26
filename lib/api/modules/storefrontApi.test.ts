import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { storefrontApi } from './storefrontApi'
import { setOnUnauthorized, FetchError } from '../fetcher'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

const curation = {
  trendy: ['12', '7'],
  drops: ['3'],
  recommendations: { streetwear: ['5'], cultural: [], athleisure: [], experimental: [], star: [] },
}

// Minimal raw ProductResponseDto — numeric id, as the backend sends it.
const rawProduct = {
  id: 42,
  name: 'Mantel',
  brandName: 'Marke',
  slug: 'mantel',
  price: 120,
  category: 'JACKETS',
  images: [],
  variants: [],
  colors: [],
}

function authHeader(init: RequestInit): string | undefined {
  return (init.headers as Record<string, string>).Authorization
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test')
  localStorage.clear()
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  setOnUnauthorized(() => {})
})

describe('storefrontApi.getCuration (public)', () => {
  it('requests /storefront/curation without a token even when one is stored', async () => {
    localStorage.setItem('enunas_token', 'tok')
    const spy = vi.fn().mockResolvedValue(jsonResponse(curation))
    vi.stubGlobal('fetch', spy)
    await expect(storefrontApi.getCuration()).resolves.toEqual(curation)
    const [url, init] = spy.mock.calls[0]
    expect(url).toBe('https://api.test/storefront/curation')
    expect(authHeader(init)).toBeUndefined()
  })
})

describe('storefrontApi.admin', () => {
  it('loads the admin curation with the token', async () => {
    localStorage.setItem('enunas_token', 'admintok')
    const spy = vi.fn().mockResolvedValue(jsonResponse(curation))
    vi.stubGlobal('fetch', spy)
    await expect(storefrontApi.admin.getCuration()).resolves.toEqual(curation)
    const [url, init] = spy.mock.calls[0]
    expect(url).toBe('https://api.test/admin/storefront/curation')
    expect(authHeader(init)).toBe('Bearer admintok')
  })

  it('PUTs the whole curation object and returns the server response', async () => {
    localStorage.setItem('enunas_token', 'admintok')
    const saved = { ...curation, trendy: ['12'] }
    const spy = vi.fn().mockResolvedValue(jsonResponse(saved))
    vi.stubGlobal('fetch', spy)
    await expect(storefrontApi.admin.saveCuration(curation)).resolves.toEqual(saved)
    const [url, init] = spy.mock.calls[0]
    expect(url).toBe('https://api.test/admin/storefront/curation')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(init.body as string)).toEqual(curation)
  })

  it('rejects with the FetchError on 400 so the editor can show it', async () => {
    localStorage.setItem('enunas_token', 'admintok')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ status: 400, message: 'Unknown product id' }, 400)))
    const err = await storefrontApi.admin.saveCuration(curation).catch(e => e)
    expect(err).toBeInstanceOf(FetchError)
    expect(err.status).toBe(400)
  })
})

describe('storefrontApi.getRecommendations', () => {
  const body = { personalized: true, primarySegment: 'streetwear', products: [rawProduct] }

  it('sends size and excludeProductId, the customer token, and no-store', async () => {
    localStorage.setItem('enunas_token', 'custtok')
    const spy = vi.fn().mockResolvedValue(jsonResponse(body))
    vi.stubGlobal('fetch', spy)
    await storefrontApi.getRecommendations({ size: 8, excludeProductId: '42' })
    const [url, init] = spy.mock.calls[0]
    expect(url).toBe('https://api.test/storefront/recommendations?size=8&excludeProductId=42')
    expect(authHeader(init)).toBe('Bearer custtok')
    expect(init.cache).toBe('no-store')
  })

  it('omits excludeProductId when there is none and sends no token when logged out', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(body))
    vi.stubGlobal('fetch', spy)
    await storefrontApi.getRecommendations({ size: 8 })
    const [url, init] = spy.mock.calls[0]
    expect(url).toBe('https://api.test/storefront/recommendations?size=8')
    expect(authHeader(init)).toBeUndefined()
  })

  it('returns the products adapted to the storefront shape, in server order', async () => {
    const second = { ...rawProduct, id: 7, slug: 'b' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ ...body, products: [rawProduct, second] })))
    const res = await storefrontApi.getRecommendations({ size: 8 })
    expect(res.personalized).toBe(true)
    expect(res.primarySegment).toBe('streetwear')
    expect(res.products.map(p => p.id)).toEqual(['42', '7'])
  })

  it('on 401 with a token retries once without it and does not end the session', async () => {
    localStorage.setItem('enunas_token', 'expired')
    const onUnauthorized = vi.fn()
    setOnUnauthorized(onUnauthorized)
    const general = { personalized: false, primarySegment: null, products: [rawProduct] }
    const spy = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ status: 401 }, 401))
      .mockResolvedValueOnce(jsonResponse(general))
    vi.stubGlobal('fetch', spy)
    const res = await storefrontApi.getRecommendations({ size: 8 })
    expect(spy).toHaveBeenCalledTimes(2)
    expect(authHeader(spy.mock.calls[1][1])).toBeUndefined()
    expect(res.personalized).toBe(false)
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('does not retry more than once', async () => {
    localStorage.setItem('enunas_token', 'expired')
    const spy = vi.fn().mockResolvedValue(jsonResponse({ status: 401 }, 401))
    vi.stubGlobal('fetch', spy)
    await expect(storefrontApi.getRecommendations({ size: 8 })).rejects.toBeInstanceOf(FetchError)
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('does not retry on errors other than 401', async () => {
    localStorage.setItem('enunas_token', 'custtok')
    const spy = vi.fn().mockResolvedValue(jsonResponse({ status: 500 }, 500))
    vi.stubGlobal('fetch', spy)
    await expect(storefrontApi.getRecommendations({ size: 8 })).rejects.toBeInstanceOf(FetchError)
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
