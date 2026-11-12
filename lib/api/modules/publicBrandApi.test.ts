import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { publicBrandApi } from './publicBrandApi'
import { FetchError } from '../fetcher'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

const brand = {
  id: 5,
  brandName: 'Claude Testmarke 0109',
  slug: 'claude-testmarke-0109',
  logoUrl: 'https://enunas-brand-previews.s3.eu-central-1.amazonaws.com/brands/5/logo/a.png',
  heroImageUrl: 'https://enunas-brand-previews.s3.eu-central-1.amazonaws.com/brands/5/hero/b.png',
  description: 'Testmarke',
}

beforeEach(() => { vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test') })
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

describe('publicBrandApi.getBySlug', () => {
  it('requests the public slug route without an Authorization header', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(brand))
    vi.stubGlobal('fetch', spy)
    await publicBrandApi.getBySlug('claude-testmarke-0109')
    const [url, init] = spy.mock.calls[0]
    expect(url).toBe('https://api.test/brands/slug/claude-testmarke-0109/public-profile')
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined()
  })

  it('URL-encodes the slug so a raw route param cannot alter the path', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(brand))
    vi.stubGlobal('fetch', spy)
    await publicBrandApi.getBySlug('a/b c')
    expect(spy.mock.calls[0][0]).toBe('https://api.test/brands/slug/a%2Fb%20c/public-profile')
  })

  it('returns the brand on 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(brand)))
    await expect(publicBrandApi.getBySlug('claude-testmarke-0109')).resolves.toEqual(brand)
  })

  it('returns null on 404 — unknown brand, or endpoint not deployed yet', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ status: 404, message: 'Not found' }, 404)))
    await expect(publicBrandApi.getBySlug('unbekannt')).resolves.toBeNull()
  })

  it('rethrows other failures instead of hiding them as "no brand"', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ status: 500, message: 'boom' }, 500)))
    await expect(publicBrandApi.getBySlug('claude-testmarke-0109')).rejects.toBeInstanceOf(FetchError)
  })
})
