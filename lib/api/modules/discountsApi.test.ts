import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { discountsApi } from './discountsApi'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

const created = { id: 7, code: 'E2E0930', percent: 10, active: true }

beforeEach(() => { vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test') })
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

// Production, 30 Sep 2026: POST /brand/discounts rejects the whole request with
// 400 "Unknown field: active", so no brand could create any discount code.
describe('discountsApi.brand.create', () => {
  it('does not send `active` to POST /brand/discounts', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(created))
    vi.stubGlobal('fetch', spy)
    await discountsApi.brand.create({ code: 'E2E0930', percent: 10, active: true })
    const [url, init] = spy.mock.calls[0]
    expect(url).toBe('https://api.test/brand/discounts')
    expect(JSON.parse(init.body)).toEqual({ code: 'E2E0930', percent: 10 })
  })

  it('still honours an inactive code by deactivating it right after creation', async () => {
    const spy = vi.fn()
      .mockResolvedValueOnce(jsonResponse(created))
      .mockResolvedValueOnce(jsonResponse({ ...created, active: false }))
    vi.stubGlobal('fetch', spy)
    const result = await discountsApi.brand.create({ code: 'E2E0930', percent: 10, active: false })
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy.mock.calls[1][0]).toBe('https://api.test/brand/discounts/7')
    expect(JSON.parse(spy.mock.calls[1][1].body)).toEqual({ active: false })
    expect(result.active).toBe(false)
  })
})
