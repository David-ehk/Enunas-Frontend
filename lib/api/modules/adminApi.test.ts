import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { adminApi } from './adminApi'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

const order = { id: '1', status: 'PAID', currency: 'EUR', items: [], createdAt: 'x' }

beforeEach(() => { vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test') })
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

describe('adminApi.orders.getById', () => {
  it('fetches a single order by id', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(order))
    vi.stubGlobal('fetch', spy)
    await adminApi.orders.getById('1')
    expect(spy.mock.calls[0][0]).toBe('https://api.test/admin/orders/1')
  })
})

describe('adminApi.orders.cancelItems', () => {
  it('posts orderItemIds, reason and note to /admin/orders/{id}/cancel-items', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(order))
    vi.stubGlobal('fetch', spy)
    await adminApi.orders.cancelItems('1', [41, 42], 'OUT_OF_STOCK', 'restocking issue')
    expect(spy.mock.calls[0][0]).toBe('https://api.test/admin/orders/1/cancel-items')
    const init = spy.mock.calls[0][1] as RequestInit
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ orderItemIds: [41, 42], reason: 'OUT_OF_STOCK', note: 'restocking issue' })
  })

  it('omits note when not given', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(order))
    vi.stubGlobal('fetch', spy)
    await adminApi.orders.cancelItems('1', [41], 'OTHER')
    const init = spy.mock.calls[0][1] as RequestInit
    expect(JSON.parse(init.body as string)).toEqual({ orderItemIds: [41], reason: 'OTHER' })
  })
})

describe('adminApi.orders.reconcileCancelItems', () => {
  it('posts claimKey, action and refundId for RECORD', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(order))
    vi.stubGlobal('fetch', spy)
    await adminApi.orders.reconcileCancelItems('1', 'item-cancel-ENS-2026-ABC123-uuid', 'RECORD', 're_abc')
    expect(spy.mock.calls[0][0]).toBe('https://api.test/admin/orders/1/cancel-items/reconcile')
    const init = spy.mock.calls[0][1] as RequestInit
    expect(JSON.parse(init.body as string)).toEqual({ claimKey: 'item-cancel-ENS-2026-ABC123-uuid', action: 'RECORD', refundId: 're_abc' })
  })

  it('omits refundId for RELEASE', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(order))
    vi.stubGlobal('fetch', spy)
    await adminApi.orders.reconcileCancelItems('1', 'item-cancel-ENS-2026-ABC123-uuid', 'RELEASE')
    const init = spy.mock.calls[0][1] as RequestInit
    expect(JSON.parse(init.body as string)).toEqual({ claimKey: 'item-cancel-ENS-2026-ABC123-uuid', action: 'RELEASE' })
  })
})
