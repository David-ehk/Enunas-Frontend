import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { adminReturnsApi, releaseRefundErrorMessage, reconcileRefundErrorMessage, canReconcileRefund } from './adminReturnsApi'
import { returnsApi } from './returnsApi'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

const order = { id: '27', status: 'DELIVERED', currency: 'EUR', items: [], createdAt: 'x' }

let spy: ReturnType<typeof vi.fn>
beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test')
  spy = vi.fn().mockResolvedValue(jsonResponse(order))
  vi.stubGlobal('fetch', spy)
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

const call = (i = 0) => ({ url: spy.mock.calls[i][0] as string, init: spy.mock.calls[i][1] as RequestInit })

// Frontend handoff of 7 Oct 2026: /refund (with a typed refundAmount) is removed; the amount is
// always computed by the backend and released via /release-refund.
describe('adminReturnsApi.releaseRefund', () => {
  it('releases a received return with an empty body', async () => {
    await adminReturnsApi.releaseRefund('RET-1')
    expect(call().url).toBe('https://api.test/admin/returns/RET-1/release-refund')
    expect(call().init.method).toBe('POST')
    expect(JSON.parse(String(call().init.body))).toEqual({})
  })

  it('sends the override reason for a return that is still APPROVED', async () => {
    await adminReturnsApi.releaseRefund('RET-1', '  Kunde hat Einlieferungsbeleg  ')
    expect(JSON.parse(String(call().init.body))).toEqual({ overrideReason: 'Kunde hat Einlieferungsbeleg' })
  })

  it('never calls the removed /refund endpoint', () => {
    expect('refundReturn' in adminReturnsApi).toBe(false)
  })
})

describe('refund previews and dashboard', () => {
  it('reads one return preview', async () => {
    await adminReturnsApi.getRefundPreview('RET-1')
    expect(call().url).toBe('https://api.test/admin/returns/RET-1/refund-preview')
  })

  it('reads the whole-order preview', async () => {
    await adminReturnsApi.getOrderRefundPreview('27')
    expect(call().url).toBe('https://api.test/admin/orders/27/refund-preview')
  })

  it('lists refunds by state with paging', async () => {
    spy.mockResolvedValue(jsonResponse({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 }))
    await adminReturnsApi.listRefunds('DUE', 1, 20)
    expect(call().url).toBe('https://api.test/admin/refunds?state=DUE&page=1&size=20')
  })
})

describe('adminReturnsApi.reconcileRefund', () => {
  it('records a refund found in Mollie', async () => {
    await adminReturnsApi.reconcileRefund('RET-1', 'RECORD', ' re_123 ')
    expect(call().url).toBe('https://api.test/admin/returns/RET-1/reconcile-refund')
    expect(JSON.parse(String(call().init.body))).toEqual({ action: 'RECORD', refundId: 're_123' })
  })

  it('sends RELEASE and REFRESH without a refund id', async () => {
    await adminReturnsApi.reconcileRefund('RET-1', 'REFRESH')
    expect(JSON.parse(String(call().init.body))).toEqual({ action: 'REFRESH' })
  })
})

describe('returnsApi.confirmReceived (brand)', () => {
  it('posts "Ware erhalten" to the brand endpoint', async () => {
    await returnsApi.confirmReceived('RET-2026-1FVC6C')
    expect(call().url).toBe('https://api.test/brand/returns/RET-2026-1FVC6C/receive')
    expect(call().init.method).toBe('POST')
  })
})

describe('admin error copy', () => {
  it('asks to retry in a minute when Mollie rate-limits', () => {
    expect(releaseRefundErrorMessage(503, 'Too Many Requests')).toBe('Mollie ist gerade ausgelastet. Bitte in einer Minute erneut versuchen.')
    expect(reconcileRefundErrorMessage(503, '')).toBe('Mollie ist gerade ausgelastet. Bitte in einer Minute erneut versuchen.')
  })

  it('tells the admin to check Mollie when a release conflicts', () => {
    expect(releaseRefundErrorMessage(409, 'Refund outcome unknown')).toContain('in Mollie prüfen')
  })

  it('reports a definitive Mollie rejection as safe to retry', () => {
    expect(releaseRefundErrorMessage(400, 'Mollie rejected')).toContain('Es wurde nichts erstattet')
  })
})

// RECORD/RELEASE only for IN_PROGRESS rows stuck 5+ minutes — earlier would race Mollie's answer.
describe('canReconcileRefund', () => {
  const claimedAt = '2026-10-08T10:00:00Z'
  const at = (min: number, sec = 0) => new Date(claimedAt).getTime() + (min * 60 + sec) * 1000

  it('is false before 5 minutes and true from 5 minutes on', () => {
    expect(canReconcileRefund({ state: 'IN_PROGRESS', claimedAt }, at(4, 59))).toBe(false)
    expect(canReconcileRefund({ state: 'IN_PROGRESS', claimedAt }, at(5))).toBe(true)
  })

  it('is false for any other state or without a claim time', () => {
    expect(canReconcileRefund({ state: 'PENDING', claimedAt }, at(30))).toBe(false)
    expect(canReconcileRefund({ state: 'IN_PROGRESS', claimedAt: null }, at(30))).toBe(false)
  })
})
