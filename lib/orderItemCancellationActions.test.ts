import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cancelOrderItems, reconcileCancelledItem } from './orderItemCancellationActions'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

const order = { id: '1', status: 'PAID', currency: 'EUR', items: [], createdAt: 'x' }
const refreshedOrder = { id: '1', status: 'PAID', currency: 'EUR', items: [{ id: '41', quantity: 1, cancellationState: 'PENDING' }], createdAt: 'x' }

beforeEach(() => { vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test') })
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

describe('cancelOrderItems', () => {
  it('returns ok with the order on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(order)))
    const outcome = await cancelOrderItems('1', [41], 'OUT_OF_STOCK')
    expect(outcome).toEqual({ ok: true, order })
  })

  it('returns the mapped message on 400, with no refetch attempt', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse({ message: 'Items belong to different brands' }, 400))
    vi.stubGlobal('fetch', spy)
    const outcome = await cancelOrderItems('1', [41, 42], 'OTHER')
    expect(outcome).toEqual({ ok: false, message: 'Items belong to different brands', refreshedOrder: undefined })
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('best-effort refetches the order on 409, so a newly-PENDING item is visible', async () => {
    const spy = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'Refund outcome unknown' }, 409))
      .mockResolvedValueOnce(jsonResponse(refreshedOrder))
    vi.stubGlobal('fetch', spy)
    const outcome = await cancelOrderItems('1', [41], 'OUT_OF_STOCK')
    expect(outcome).toEqual({ ok: false, message: 'Refund outcome unknown', refreshedOrder })
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy.mock.calls[1][0]).toBe('https://api.test/admin/orders/1')
  })

  it('still reports the original failure when the 409 refetch itself fails', async () => {
    const spy = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'Refund outcome unknown' }, 409))
      .mockResolvedValueOnce(jsonResponse({ message: 'not found' }, 404))
    vi.stubGlobal('fetch', spy)
    const outcome = await cancelOrderItems('1', [41], 'OUT_OF_STOCK')
    expect(outcome).toEqual({ ok: false, message: 'Refund outcome unknown', refreshedOrder: undefined })
  })
})

describe('reconcileCancelledItem', () => {
  it('returns ok with the order on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(order)))
    const outcome = await reconcileCancelledItem('1', 'claim-key', 'RECORD', 're_abc')
    expect(outcome).toEqual({ ok: true, order })
  })

  it('best-effort refetches the order on 409 (claim already settled elsewhere)', async () => {
    const spy = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'Claim already settled' }, 409))
      .mockResolvedValueOnce(jsonResponse(refreshedOrder))
    vi.stubGlobal('fetch', spy)
    const outcome = await reconcileCancelledItem('1', 'claim-key', 'RELEASE')
    expect(outcome).toEqual({ ok: false, message: 'Claim already settled', refreshedOrder })
  })

  it('does not attempt a refetch on a non-409 failure', async () => {
    // 5xx bodies are boilerplate — fetcher's germanErrorMessage() replaces them with its own
    // server-error copy regardless of what the backend sent, before this module ever sees it.
    const spy = vi.fn().mockResolvedValue(jsonResponse({ message: 'Server error' }, 500))
    vi.stubGlobal('fetch', spy)
    const outcome = await reconcileCancelledItem('1', 'claim-key', 'RECORD', 're_abc')
    expect(outcome).toEqual({ ok: false, message: 'Serverfehler. Bitte versuche es später erneut.' })
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
